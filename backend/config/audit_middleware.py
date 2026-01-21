"""
Middleware pour l'audit trail automatique
"""
import json
import logging
from django.utils.deprecation import MiddlewareMixin
from apps.users.models_audit import AuditLog, LoginAttempt

logger = logging.getLogger(__name__)


class AuditMiddleware(MiddlewareMixin):
    """
    Middleware pour logger automatiquement certaines actions
    """
    
    # Actions à logger automatiquement
    LOGGED_PATHS = {
        '/api/v1/auth/login/': 'login',
        '/api/v1/auth/logout/': 'logout',
        '/api/v1/auth/register/': 'register',
        '/api/v1/auth/change-password/': 'password_change',
        '/api/v1/auth/password-reset/': 'password_reset',
        '/api/v1/appointments/': 'appointment',
    }
    
    # Méthodes à logger
    LOGGED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
    
    def process_response(self, request, response):
        """Logger les actions après la réponse"""
        
        # Ne logger que certaines méthodes
        if request.method not in self.LOGGED_METHODS:
            return response
        
        # Ne logger que certains chemins
        path = request.path
        action_type = None
        
        for logged_path, action in self.LOGGED_PATHS.items():
            if path.startswith(logged_path):
                action_type = action
                break
        
        if not action_type:
            return response
        
        # Logger uniquement les succès (2xx, 3xx)
        if 200 <= response.status_code < 400:
            try:
                self._log_action(request, response, action_type)
            except Exception as e:
                logger.error(f"Erreur lors du logging d'audit: {e}")
        
        return response
    
    def _log_action(self, request, response, action_type):
        """Créer un log d'audit"""
        
        user = request.user if hasattr(request, 'user') and request.user.is_authenticated else None
        
        # Déterminer l'action spécifique
        action = action_type
        description = f"{request.method} {request.path}"
        level = 'info'
        
        # Actions spécifiques
        if action_type == 'login':
            action = 'login'
            description = 'Connexion réussie'
            self._log_login_attempt(request, success=True)
            
        elif action_type == 'logout':
            action = 'logout'
            description = 'Déconnexion'
            
        elif action_type == 'register':
            action = 'register'
            description = 'Inscription d\'un nouveau compte'
            
        elif action_type == 'password_change':
            action = 'password_change'
            description = 'Changement de mot de passe'
            level = 'warning'
            
        elif action_type == 'password_reset':
            action = 'password_reset'
            description = 'Demande de réinitialisation de mot de passe'
            level = 'warning'
            
        elif action_type == 'appointment':
            if request.method == 'POST':
                action = 'appointment_create'
                description = 'Création d\'un rendez-vous'
            elif request.method == 'DELETE':
                action = 'appointment_cancel'
                description = 'Annulation d\'un rendez-vous'
            elif request.method in ['PUT', 'PATCH']:
                action = 'update'
                description = 'Modification d\'un rendez-vous'
        
        # Créer le log
        AuditLog.log(
            action=action,
            user=user,
            description=description,
            level=level,
            request=request,
            status_code=response.status_code
        )
    
    def _log_login_attempt(self, request, success=True, failure_reason=''):
        """Logger une tentative de connexion"""
        try:
            # Récupérer l'email depuis le body
            username = ''
            if hasattr(request, 'data'):
                username = request.data.get('email', '')
            elif request.body:
                try:
                    data = json.loads(request.body)
                    username = data.get('email', '')
                except:
                    pass
            
            LoginAttempt.objects.create(
                username=username,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                success=success,
                failure_reason=failure_reason
            )
        except Exception as e:
            logger.error(f"Erreur lors du logging de tentative de connexion: {e}")
    
    @staticmethod
    def _get_client_ip(request):
        """Récupérer l'IP réelle du client"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class FailedLoginMiddleware(MiddlewareMixin):
    """
    Middleware pour logger les échecs de connexion
    """
    
    def process_response(self, request, response):
        """Logger les échecs de connexion"""
        
        # Uniquement pour /api/v1/auth/login/
        if not request.path.startswith('/api/v1/auth/login/'):
            return response
        
        # Uniquement pour POST
        if request.method != 'POST':
            return response
        
        # Logger les échecs (4xx)
        if 400 <= response.status_code < 500:
            try:
                self._log_failed_login(request, response)
            except Exception as e:
                logger.error(f"Erreur lors du logging d'échec de connexion: {e}")
        
        return response
    
    def _log_failed_login(self, request, response):
        """Logger un échec de connexion"""
        
        # Récupérer l'email
        username = ''
        if hasattr(request, 'data'):
            username = request.data.get('email', '')
        elif request.body:
            try:
                data = json.loads(request.body)
                username = data.get('email', '')
            except:
                pass
        
        # Déterminer la raison
        failure_reason = 'Identifiants invalides'
        if response.status_code == 400:
            failure_reason = 'Requête invalide'
        elif response.status_code == 429:
            failure_reason = 'Trop de tentatives (rate limiting)'
        
        # Créer le log de tentative
        LoginAttempt.objects.create(
            username=username,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            success=False,
            failure_reason=failure_reason
        )
        
        # Créer le log d'audit
        AuditLog.log(
            action='failed_login',
            description=f'Échec de connexion pour {username}',
            level='warning',
            request=request,
            username=username,
            failure_reason=failure_reason
        )
    
    @staticmethod
    def _get_client_ip(request):
        """Récupérer l'IP réelle du client"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
