import secrets
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailVerificationToken, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        token = secrets.token_urlsafe(32)
        EmailVerificationToken.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'message': 'Inscription réussie. Vérifiez votre email.'
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Mot de passe incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Mot de passe modifié avec succès.'})


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
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
        except User.DoesNotExist:
            pass
        
        return Response({
            'message': 'Si cet email existe, vous recevrez un lien de réinitialisation.'
        })


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

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
        
        return Response({'message': 'Mot de passe réinitialisé avec succès.'})


class VerifyEmailView(APIView):
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
        
        return Response({'message': 'Email vérifié avec succès.'})
