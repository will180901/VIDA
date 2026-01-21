"""
Configuration des timeouts pour protéger contre les requêtes longues
"""
import signal
from functools import wraps
from django.conf import settings
from django.core.exceptions import MiddlewareNotUsed
from rest_framework.exceptions import APIException
from rest_framework import status


class RequestTimeoutError(APIException):
    """Exception levée quand une requête dépasse le timeout"""
    status_code = status.HTTP_408_REQUEST_TIMEOUT
    default_detail = 'La requête a pris trop de temps à traiter.'
    default_code = 'request_timeout'


class TimeoutMiddleware:
    """
    Middleware pour limiter le temps d'exécution des requêtes
    
    Configuration dans settings.py :
        REQUEST_TIMEOUT = 30  # secondes (défaut: 30)
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.timeout = getattr(settings, 'REQUEST_TIMEOUT', 30)
        
        # Vérifier si signal.alarm est disponible (Unix uniquement)
        if not hasattr(signal, 'alarm'):
            # Sur Windows, désactiver ce middleware
            raise MiddlewareNotUsed(
                "TimeoutMiddleware nécessite signal.alarm (Unix uniquement). "
                "Utilisez un serveur de production avec gunicorn/uwsgi."
            )
    
    def __call__(self, request):
        # Définir le handler de timeout
        def timeout_handler(signum, frame):
            raise RequestTimeoutError()
        
        # Configurer l'alarme
        old_handler = signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(self.timeout)
        
        try:
            response = self.get_response(request)
        finally:
            # Annuler l'alarme et restaurer l'ancien handler
            signal.alarm(0)
            signal.signal(signal.SIGALRM, old_handler)
        
        return response


def timeout_decorator(seconds=30):
    """
    Décorateur pour limiter le temps d'exécution d'une fonction
    
    Usage:
        @timeout_decorator(10)
        def my_slow_function():
            # Code qui peut prendre du temps
            pass
    
    Note: Fonctionne uniquement sur Unix (signal.alarm)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Vérifier si signal.alarm est disponible
            if not hasattr(signal, 'alarm'):
                # Sur Windows, exécuter sans timeout
                return func(*args, **kwargs)
            
            def timeout_handler(signum, frame):
                raise TimeoutError(f"La fonction {func.__name__} a dépassé le timeout de {seconds}s")
            
            # Configurer l'alarme
            old_handler = signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(seconds)
            
            try:
                result = func(*args, **kwargs)
            finally:
                # Annuler l'alarme et restaurer l'ancien handler
                signal.alarm(0)
                signal.signal(signal.SIGALRM, old_handler)
            
            return result
        
        return wrapper
    return decorator


# Configuration des timeouts pour différents types d'opérations
TIMEOUT_CONFIGS = {
    # Timeouts pour requêtes HTTP externes (requests library)
    'http': {
        'connect': 5,  # Timeout de connexion (secondes)
        'read': 30,    # Timeout de lecture (secondes)
    },
    
    # Timeouts pour requêtes DB
    'database': {
        'default': 30,  # Timeout par défaut (secondes)
        'long_query': 60,  # Pour les requêtes complexes
    },
    
    # Timeouts pour tâches Celery
    'celery': {
        'soft': 300,   # Soft timeout (5 minutes)
        'hard': 600,   # Hard timeout (10 minutes)
    },
    
    # Timeouts pour API
    'api': {
        'default': 30,  # Timeout par défaut pour requêtes API
        'upload': 120,  # Timeout pour uploads
        'report': 60,   # Timeout pour génération de rapports
    },
}


def get_timeout(category, key='default'):
    """
    Récupérer un timeout configuré
    
    Usage:
        timeout = get_timeout('http', 'connect')  # 5
        timeout = get_timeout('api', 'upload')    # 120
    """
    return TIMEOUT_CONFIGS.get(category, {}).get(key, 30)


def configure_requests_timeout():
    """
    Configure les timeouts par défaut pour la bibliothèque requests
    
    À appeler dans settings.py ou apps.py
    """
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    
    # Configuration des retries avec timeout
    retry_strategy = Retry(
        total=3,  # 3 tentatives
        backoff_factor=1,  # Attendre 1s, 2s, 4s entre les tentatives
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS", "POST"]
    )
    
    adapter = HTTPAdapter(max_retries=retry_strategy)
    
    # Créer une session par défaut avec timeouts
    session = requests.Session()
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    # Définir les timeouts par défaut
    original_request = session.request
    
    def request_with_timeout(*args, **kwargs):
        if 'timeout' not in kwargs:
            kwargs['timeout'] = (
                get_timeout('http', 'connect'),
                get_timeout('http', 'read')
            )
        return original_request(*args, **kwargs)
    
    session.request = request_with_timeout
    
    return session


# Session requests avec timeouts configurés
default_session = configure_requests_timeout()


def make_request(method, url, **kwargs):
    """
    Faire une requête HTTP avec timeout automatique
    
    Usage:
        response = make_request('GET', 'https://api.example.com/data')
        response = make_request('POST', 'https://api.example.com/data', json={'key': 'value'})
    """
    if 'timeout' not in kwargs:
        kwargs['timeout'] = (
            get_timeout('http', 'connect'),
            get_timeout('http', 'read')
        )
    
    return default_session.request(method, url, **kwargs)


class DatabaseTimeoutMixin:
    """
    Mixin pour ajouter un timeout aux requêtes DB dans les vues
    
    Usage:
        class MyView(DatabaseTimeoutMixin, APIView):
            db_timeout = 10  # secondes
            
            def get(self, request):
                # Les requêtes DB auront un timeout de 10s
                pass
    """
    
    db_timeout = None  # À définir dans la classe fille
    
    def dispatch(self, request, *args, **kwargs):
        from django.db import connection
        
        timeout = self.db_timeout or get_timeout('database', 'default')
        
        # Configurer le timeout pour PostgreSQL
        if connection.vendor == 'postgresql':
            with connection.cursor() as cursor:
                cursor.execute(f"SET statement_timeout = {timeout * 1000}")  # millisecondes
        
        # Configurer le timeout pour MySQL
        elif connection.vendor == 'mysql':
            with connection.cursor() as cursor:
                cursor.execute(f"SET SESSION max_execution_time = {timeout * 1000}")  # millisecondes
        
        # SQLite n'a pas de timeout natif, utiliser le timeout de connexion
        elif connection.vendor == 'sqlite':
            connection.connection.timeout = timeout
        
        return super().dispatch(request, *args, **kwargs)


def with_db_timeout(timeout=30):
    """
    Décorateur pour ajouter un timeout aux requêtes DB
    
    Usage:
        @with_db_timeout(10)
        def my_view(request):
            # Les requêtes DB auront un timeout de 10s
            pass
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            from django.db import connection
            
            # Configurer le timeout selon le SGBD
            if connection.vendor == 'postgresql':
                with connection.cursor() as cursor:
                    cursor.execute(f"SET statement_timeout = {timeout * 1000}")
            
            elif connection.vendor == 'mysql':
                with connection.cursor() as cursor:
                    cursor.execute(f"SET SESSION max_execution_time = {timeout * 1000}")
            
            elif connection.vendor == 'sqlite':
                connection.connection.timeout = timeout
            
            return func(*args, **kwargs)
        
        return wrapper
    return decorator
