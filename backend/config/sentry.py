"""
Configuration Sentry pour monitoring des erreurs
"""
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
import logging


def init_sentry(dsn: str, environment: str, debug: bool = False):
    """
    Initialiser Sentry avec les intégrations Django, Celery, Redis
    
    Args:
        dsn: Sentry DSN (Data Source Name)
        environment: Environnement (development, staging, production)
        debug: Mode debug (désactive Sentry si True)
    """
    
    if not dsn or debug:
        # Ne pas initialiser Sentry en développement ou si DSN absent
        return
    
    # Configuration du logging
    logging_integration = LoggingIntegration(
        level=logging.INFO,        # Capturer les logs INFO et supérieurs
        event_level=logging.ERROR  # Envoyer les ERROR comme événements
    )
    
    sentry_sdk.init(
        dsn=dsn,
        environment=environment,
        
        # Intégrations
        integrations=[
            DjangoIntegration(
                transaction_style='url',  # Grouper par URL
                middleware_spans=True,    # Tracer les middlewares
                signals_spans=True,       # Tracer les signaux Django
                cache_spans=True,         # Tracer les accès cache
            ),
            CeleryIntegration(
                monitor_beat_tasks=True,  # Monitorer les tâches périodiques
                exclude_beat_tasks=None,  # Ne pas exclure de tâches
            ),
            RedisIntegration(),
            logging_integration,
        ],
        
        # Taux d'échantillonnage des transactions (performance monitoring)
        traces_sample_rate=1.0 if environment == 'development' else 0.1,
        
        # Taux d'échantillonnage des profils
        profiles_sample_rate=1.0 if environment == 'development' else 0.1,
        
        # Envoyer les données utilisateur par défaut
        send_default_pii=False,  # Ne pas envoyer d'infos personnelles
        
        # Filtrer les données sensibles
        before_send=before_send_filter,
        
        # Ignorer certaines erreurs
        ignore_errors=[
            # Erreurs HTTP courantes
            'Http404',
            'PermissionDenied',
            
            # Erreurs de validation
            'ValidationError',
            
            # Erreurs de throttling
            'Throttled',
        ],
        
        # Configuration des breadcrumbs (fil d'Ariane)
        max_breadcrumbs=50,
        
        # Activer le tracing
        enable_tracing=True,
    )


def before_send_filter(event, hint):
    """
    Filtrer les événements avant envoi à Sentry
    Permet de nettoyer les données sensibles
    """
    
    # Filtrer les mots de passe des données de requête
    if 'request' in event:
        if 'data' in event['request']:
            data = event['request']['data']
            if isinstance(data, dict):
                # Masquer les champs sensibles
                sensitive_fields = [
                    'password', 'password_confirm', 'old_password', 
                    'new_password', 'token', 'secret', 'api_key',
                    'captcha', 'h-captcha-response'
                ]
                for field in sensitive_fields:
                    if field in data:
                        data[field] = '***FILTERED***'
    
    # Filtrer les cookies sensibles
    if 'request' in event and 'cookies' in event['request']:
        cookies = event['request']['cookies']
        if isinstance(cookies, dict):
            sensitive_cookies = [
                'vida_access_token', 'vida_refresh_token',
                'sessionid', 'csrftoken'
            ]
            for cookie in sensitive_cookies:
                if cookie in cookies:
                    cookies[cookie] = '***FILTERED***'
    
    # Filtrer les headers sensibles
    if 'request' in event and 'headers' in event['request']:
        headers = event['request']['headers']
        if isinstance(headers, dict):
            sensitive_headers = [
                'Authorization', 'Cookie', 'X-CSRFToken'
            ]
            for header in sensitive_headers:
                if header in headers:
                    headers[header] = '***FILTERED***'
    
    return event


def capture_message(message: str, level: str = 'info', **kwargs):
    """
    Capturer un message personnalisé dans Sentry
    
    Args:
        message: Message à capturer
        level: Niveau (debug, info, warning, error, fatal)
        **kwargs: Contexte additionnel
    """
    sentry_sdk.capture_message(message, level=level, **kwargs)


def capture_exception(exception: Exception, **kwargs):
    """
    Capturer une exception dans Sentry
    
    Args:
        exception: Exception à capturer
        **kwargs: Contexte additionnel
    """
    sentry_sdk.capture_exception(exception, **kwargs)


def set_user_context(user_id: int = None, email: str = None, username: str = None):
    """
    Définir le contexte utilisateur pour Sentry
    
    Args:
        user_id: ID de l'utilisateur
        email: Email de l'utilisateur (sera filtré si send_default_pii=False)
        username: Nom d'utilisateur
    """
    sentry_sdk.set_user({
        'id': user_id,
        'email': email,
        'username': username,
    })


def set_context(key: str, value: dict):
    """
    Ajouter un contexte personnalisé
    
    Args:
        key: Clé du contexte
        value: Valeur du contexte (dict)
    """
    sentry_sdk.set_context(key, value)


def add_breadcrumb(message: str, category: str = 'default', level: str = 'info', data: dict = None):
    """
    Ajouter un breadcrumb (fil d'Ariane)
    
    Args:
        message: Message du breadcrumb
        category: Catégorie (auth, query, navigation, etc.)
        level: Niveau (debug, info, warning, error)
        data: Données additionnelles
    """
    sentry_sdk.add_breadcrumb(
        message=message,
        category=category,
        level=level,
        data=data or {}
    )
