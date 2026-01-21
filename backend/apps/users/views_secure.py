"""
Vues d'authentification sécurisées avec httpOnly cookies
Protection contre XSS, CSRF, brute force
"""

import secrets
import logging
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.throttling import AnonRateThrottle
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse

from .models import EmailVerificationToken, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .validators import calculate_password_strength
from .captcha import verify_hcaptcha

User = get_user_model()

# Logger de sécurité
security_logger = logging.getLogger('apps.users')


class LoginRateThrottle(AnonRateThrottle):
    """Rate limiting spécifique pour login : 5 tentatives / 15 min"""
    scope = 'login'  # Utilise le scope défini dans settings


@extend_schema(
    summary="Connexion utilisateur",
    description="""
    Authentification sécurisée avec JWT stockés dans des cookies httpOnly.
    
    **Sécurité :**
    - Protection brute force : 5 tentatives max / 15 min
    - CAPTCHA obligatoire (hCaptcha)
    - Tokens stockés dans cookies httpOnly (protection XSS)
    
    **Réponse :**
    Les tokens JWT sont automatiquement stockés dans des cookies sécurisés.
    """,
    tags=["Authentication"],
    examples=[
        OpenApiExample(
            'Connexion valide',
            value={
                'email': 'patient@example.com',
                'password': 'MotDePasse123!Secure',
                'captcha': 'token_hcaptcha_ici'
            },
            request_only=True,
        ),
    ],
    responses={
        200: OpenApiResponse(
            description="Connexion réussie",
            response={
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'},
                    'user': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer'},
                            'email': {'type': 'string'},
                        }
                    }
                }
            }
        ),
        400: OpenApiResponse(description="CAPTCHA invalide ou données incorrectes"),
        401: OpenApiResponse(description="Identifiants invalides"),
        429: OpenApiResponse(description="Trop de tentatives (rate limiting)"),
    }
)
class SecureTokenObtainPairView(TokenObtainPairView):
    """
    Connexion sécurisée avec cookies httpOnly
    Protection brute force avec django-axes (via middleware)
    Protection anti-bot avec hCaptcha
    """
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request, *args, **kwargs):
        # Vérifier CAPTCHA avant authentification
        captcha_token = request.data.get('h-captcha-response') or request.data.get('captcha')
        remote_ip = request.META.get('REMOTE_ADDR')
        
        try:
            verify_hcaptcha(captcha_token, remote_ip)
        except Exception as e:
            security_logger.warning(
                f"CAPTCHA échoué pour IP {remote_ip}",
                extra={'ip': remote_ip, 'email': request.data.get('email')}
            )
            return Response(
                {'detail': str(e.detail) if hasattr(e, 'detail') else 'CAPTCHA invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            email = request.data.get('email')
            security_logger.info(
                f"Connexion réussie pour {email} depuis {remote_ip}",
                extra={'ip': remote_ip, 'email': email}
            )
            
            # Récupérer les tokens
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            # Stocker dans cookies httpOnly (sécurisé)
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
            )
            
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=refresh_token,
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
            )
            
            # Ne pas retourner les tokens dans le body (sécurité)
            response.data = {
                'message': 'Connexion réussie',
                'user': {
                    'id': request.user.id if hasattr(request, 'user') else None,
                    'email': request.data.get('email'),
                }
            }
        
        return response


class SecureTokenRefreshView(TokenRefreshView):
    """
    Refresh token sécurisé avec cookies httpOnly
    """
    
    def post(self, request, *args, **kwargs):
        # Récupérer refresh token depuis cookie
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token manquant'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Injecter dans request.data pour TokenRefreshView
        request.data['refresh'] = refresh_token
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Nouveau access token
            access_token = response.data.get('access')
            
            # Mettre à jour cookie
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
            )
            
            # Si nouveau refresh token (rotation activée)
            if 'refresh' in response.data:
                new_refresh_token = response.data.get('refresh')
                response.set_cookie(
                    key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                    value=new_refresh_token,
                    max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                    path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
                )
            
            response.data = {'message': 'Token rafraîchi'}
        
        return response


@extend_schema(
    summary="Déconnexion utilisateur",
    description="""
    Déconnexion sécurisée avec suppression des cookies et blacklist du refresh token.
    
    **Sécurité :**
    - Suppression des cookies JWT
    - Blacklist du refresh token (empêche réutilisation)
    - Logging de sécurité
    """,
    tags=["Authentication"],
    responses={
        200: OpenApiResponse(description="Déconnexion réussie"),
        401: OpenApiResponse(description="Non authentifié"),
    }
)
class SecureLogoutView(APIView):
    """
    Déconnexion sécurisée : suppression des cookies + blacklist token
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Récupérer refresh token
            refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            
            if refresh_token:
                # Blacklist le refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()
                
            remote_ip = request.META.get('REMOTE_ADDR')
            user_email = request.user.email if hasattr(request.user, 'email') else 'unknown'
            security_logger.info(
                f"Déconnexion de {user_email} depuis {remote_ip}",
                extra={'ip': remote_ip, 'email': user_email}
            )
        except Exception:
            pass  # Ignorer les erreurs de blacklist
        
        # Créer response
        response = Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
        
        # Supprimer les cookies
        response.delete_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
        )
        response.delete_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
            path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
        )
        
        return response


@extend_schema(
    summary="Inscription utilisateur",
    description="""
    Création d'un nouveau compte utilisateur avec validation renforcée.
    
    **Sécurité :**
    - CAPTCHA obligatoire (hCaptcha)
    - Mot de passe : min 12 caractères, majuscule, minuscule, chiffre, caractère spécial
    - Email de vérification envoyé automatiquement
    - Tokens JWT stockés dans cookies httpOnly
    
    **Après inscription :**
    - Un email de vérification est envoyé
    - L'utilisateur est automatiquement connecté
    """,
    tags=["Authentication"],
    responses={
        201: OpenApiResponse(description="Inscription réussie"),
        400: OpenApiResponse(description="Données invalides ou CAPTCHA incorrect"),
        429: OpenApiResponse(description="Trop de tentatives (rate limiting)"),
    }
)
class SecureRegisterView(generics.CreateAPIView):
    """
    Inscription sécurisée avec validation renforcée
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    throttle_classes = [AnonRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        remote_ip = request.META.get('REMOTE_ADDR')
        security_logger.info(
            f"Nouvelle inscription: {user.email} depuis {remote_ip}",
            extra={'ip': remote_ip, 'email': user.email, 'user_id': user.id}
        )
        
        # Créer token de vérification email
        token = secrets.token_urlsafe(32)
        EmailVerificationToken.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        
        # Envoyer email de vérification (asynchrone avec Celery)
        from .emails import send_verification_email
        try:
            send_verification_email(user, token)
        except Exception as e:
            logger.error(f"Erreur envoi email vérification: {e}")
        
        # Générer tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Créer response
        response = Response({
            'message': 'Inscription réussie. Vérifiez votre email.',
            'user': UserProfileSerializer(user).data,
        }, status=status.HTTP_201_CREATED)
        
        # Stocker tokens dans cookies httpOnly
        response.set_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            value=access_token,
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
        )
        
        response.set_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
            value=refresh_token,
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
        )
        
        return response


class PasswordStrengthView(APIView):
    """
    Endpoint pour calculer la force d'un mot de passe
    Utilisé pour feedback en temps réel côté frontend
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request):
        password = request.data.get('password', '')
        
        if not password:
            return Response(
                {'error': 'Mot de passe requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        strength = calculate_password_strength(password)
        
        return Response(strength)


@extend_schema(
    summary="Profil utilisateur",
    description="""
    Récupération et modification du profil de l'utilisateur connecté.
    
    **GET** : Récupère les informations du profil
    **PUT/PATCH** : Modifie les informations du profil
    
    **Champs modifiables :**
    - first_name, last_name, phone
    - date_of_birth, gender, address
    - emergency_contact, emergency_phone
    - avatar (image)
    """,
    tags=["Authentication"],
    responses={
        200: OpenApiResponse(description="Profil récupéré/modifié avec succès"),
        401: OpenApiResponse(description="Non authentifié"),
    }
)
class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Profil utilisateur (lecture + modification)
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@extend_schema(
    summary="Changement de mot de passe",
    description="""
    Permet à un utilisateur authentifié de changer son mot de passe.
    
    **Sécurité :**
    - Vérification de l'ancien mot de passe
    - Validation du nouveau mot de passe (min 12 caractères)
    - Logging de sécurité
    """,
    tags=["Authentication"],
    request=ChangePasswordSerializer,
    responses={
        200: OpenApiResponse(description="Mot de passe modifié avec succès"),
        400: OpenApiResponse(description="Ancien mot de passe incorrect ou nouveau mot de passe invalide"),
        401: OpenApiResponse(description="Non authentifié"),
    }
)
class ChangePasswordView(APIView):
    """
    Changement de mot de passe (utilisateur connecté)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer  # Pour drf-spectacular

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            remote_ip = request.META.get('REMOTE_ADDR')
            security_logger.warning(
                f"Tentative de changement de mot de passe échouée pour {user.email} depuis {remote_ip}",
                extra={'ip': remote_ip, 'email': user.email, 'user_id': user.id}
            )
            return Response(
                {'old_password': 'Mot de passe incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        remote_ip = request.META.get('REMOTE_ADDR')
        security_logger.info(
            f"Mot de passe changé pour {user.email} depuis {remote_ip}",
            extra={'ip': remote_ip, 'email': user.email, 'user_id': user.id}
        )
        
        return Response({'message': 'Mot de passe modifié avec succès.'})


@extend_schema(
    summary="Demande de réinitialisation de mot de passe",
    description="""
    Envoie un email avec un lien de réinitialisation de mot de passe.
    
    **Sécurité :**
    - Protection contre énumération d'utilisateurs (timing attack)
    - Message générique même si l'email n'existe pas
    - Token valide 1 heure
    - Rate limiting : 3 requêtes/heure
    """,
    tags=["Authentication"],
    request=PasswordResetRequestSerializer,
    examples=[
        OpenApiExample(
            'Demande de reset',
            value={'email': 'patient@example.com'},
            request_only=True,
        ),
    ],
    responses={
        200: OpenApiResponse(description="Email envoyé (si l'adresse existe)"),
        429: OpenApiResponse(description="Trop de tentatives"),
    }
)
class PasswordResetRequestView(APIView):
    """
    Demande de réinitialisation de mot de passe
    Protection contre énumération d'utilisateurs via timing attack
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]
    serializer_class = PasswordResetRequestSerializer  # Pour drf-spectacular

    def post(self, request):
        import time
        start_time = time.time()
        
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            token = secrets.token_urlsafe(32)
            PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=1)
            )
            
            # Envoyer email avec lien de reset
            from .emails import send_password_reset_email
            try:
                send_password_reset_email(user, token)
            except Exception as e:
                logger.error(f"Erreur envoi email reset: {e}")
        except User.DoesNotExist:
            pass  # Ne pas révéler si l'email existe
        
        # Délai artificiel pour prévenir timing attack
        # Toujours prendre au moins 200ms pour répondre
        elapsed = time.time() - start_time
        if elapsed < 0.2:
            time.sleep(0.2 - elapsed)
        
        return Response({
            'message': 'Si cet email existe, vous recevrez un lien de réinitialisation.'
        })


@extend_schema(
    summary="Confirmation de réinitialisation de mot de passe",
    description="""
    Confirme la réinitialisation du mot de passe avec un token valide.
    
    **Sécurité :**
    - Token à usage unique
    - Token valide 1 heure
    - Email de confirmation envoyé
    """,
    tags=["Authentication"],
    request=PasswordResetConfirmSerializer,
    responses={
        200: OpenApiResponse(description="Mot de passe réinitialisé avec succès"),
        400: OpenApiResponse(description="Token invalide ou expiré"),
    }
)
class PasswordResetConfirmView(APIView):
    """
    Confirmation de réinitialisation de mot de passe
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]
    serializer_class = PasswordResetConfirmSerializer  # Pour drf-spectacular

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            token_obj = PasswordResetToken.objects.get(
                token=serializer.validated_data['token'],
                used=False,
                expires_at__gt=timezone.now()
            )
        except PasswordResetToken.DoesNotExist:
            return Response(
                {'token': 'Token invalide ou expiré.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = token_obj.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        token_obj.used = True
        token_obj.save()
        
        # Envoyer email de confirmation
        from .emails import send_password_changed_email
        try:
            send_password_changed_email(user)
        except Exception as e:
            logger.error(f"Erreur envoi email confirmation: {e}")
        
        return Response({'message': 'Mot de passe réinitialisé avec succès.'})


class VerifyEmailView(APIView):
    """
    Vérification d'email
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        
        try:
            token_obj = EmailVerificationToken.objects.get(
                token=token,
                used=False,
                expires_at__gt=timezone.now()
            )
        except EmailVerificationToken.DoesNotExist:
            return Response(
                {'token': 'Token invalide ou expiré.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = token_obj.user
        user.email_verified = True
        user.save()
        
        token_obj.used = True
        token_obj.save()
        
        # Envoyer email de bienvenue
        from .emails import send_welcome_email
        try:
            send_welcome_email(user)
        except Exception as e:
            logger.error(f"Erreur envoi email bienvenue: {e}")
        
        return Response({'message': 'Email vérifié avec succès.'})
