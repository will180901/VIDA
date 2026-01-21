"""
Rate limiting avancé (FIX #29)
Combine IP + utilisateur, whitelist/blacklist, alertes
"""
from rest_framework.throttling import SimpleRateThrottle, AnonRateThrottle, UserRateThrottle
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class IPAddressMixin:
    """Mixin pour récupérer l'IP réelle du client"""
    
    def get_client_ip(self, request):
        """Récupère l'IP réelle même derrière un proxy"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class WhitelistMixin:
    """Mixin pour gérer la whitelist"""
    
    def is_whitelisted(self, request):
        """Vérifie si l'IP ou l'utilisateur est en whitelist"""
        # Whitelist d'IPs
        whitelisted_ips = getattr(settings, 'THROTTLE_WHITELIST_IPS', [])
        client_ip = self.get_client_ip(request)
        
        if client_ip in whitelisted_ips:
            return True
        
        # Whitelist d'utilisateurs
        if request.user and request.user.is_authenticated:
            whitelisted_users = getattr(settings, 'THROTTLE_WHITELIST_USERS', [])
            if request.user.email in whitelisted_users or request.user.is_staff:
                return True
        
        return False


class BlacklistMixin:
    """Mixin pour gérer la blacklist"""
    
    def is_blacklisted(self, request):
        """Vérifie si l'IP ou l'utilisateur est en blacklist"""
        # Blacklist d'IPs
        blacklisted_ips = getattr(settings, 'THROTTLE_BLACKLIST_IPS', [])
        client_ip = self.get_client_ip(request)
        
        if client_ip in blacklisted_ips:
            logger.warning(
                f"Blacklisted IP attempted access: {client_ip}",
                extra={'ip': client_ip, 'path': request.path}
            )
            return True
        
        # Blacklist d'utilisateurs
        if request.user and request.user.is_authenticated:
            blacklisted_users = getattr(settings, 'THROTTLE_BLACKLIST_USERS', [])
            if request.user.email in blacklisted_users:
                logger.warning(
                    f"Blacklisted user attempted access: {request.user.email}",
                    extra={'user': request.user.email, 'path': request.path}
                )
                return True
        
        return False


class AlertMixin:
    """Mixin pour envoyer des alertes en cas de dépassement"""
    
    def send_alert(self, request, identifier):
        """Envoie une alerte si le rate limit est dépassé"""
        # Vérifier si une alerte a déjà été envoyée récemment
        alert_key = f'throttle_alert:{identifier}'
        if cache.get(alert_key):
            return  # Alerte déjà envoyée récemment
        
        # Marquer l'alerte comme envoyée (1 heure)
        cache.set(alert_key, True, 3600)
        
        # Logger l'alerte
        logger.warning(
            f"Rate limit exceeded: {identifier}",
            extra={
                'identifier': identifier,
                'path': request.path,
                'method': request.method,
                'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
                'ip': self.get_client_ip(request),
            }
        )
        
        # TODO: Envoyer une notification (email, Slack, etc.)
        # self.send_notification(identifier, request)


class CombinedRateThrottle(IPAddressMixin, WhitelistMixin, BlacklistMixin, AlertMixin, SimpleRateThrottle):
    """
    Rate limiting combiné : IP + Utilisateur
    
    Utilise l'IP pour les anonymes et l'user_id pour les authentifiés
    """
    scope = 'combined'
    
    def get_cache_key(self, request, view):
        # Vérifier whitelist
        if self.is_whitelisted(request):
            return None  # Pas de throttling
        
        # Vérifier blacklist
        if self.is_blacklisted(request):
            return 'blacklisted'  # Toujours throttlé
        
        # Identifier par user_id si authentifié, sinon par IP
        if request.user and request.user.is_authenticated:
            ident = f'user_{request.user.pk}'
        else:
            ident = self.get_client_ip(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
    
    def throttle_failure(self):
        """Appelé quand le rate limit est dépassé"""
        # Envoyer une alerte
        if hasattr(self, '_request'):
            identifier = self.get_ident()
            self.send_alert(self._request, identifier)
        
        return super().throttle_failure()
    
    def allow_request(self, request, view):
        """Override pour stocker la requête"""
        self._request = request
        return super().allow_request(request, view)


class StrictIPThrottle(IPAddressMixin, WhitelistMixin, BlacklistMixin, AlertMixin, SimpleRateThrottle):
    """
    Rate limiting strict par IP uniquement
    
    Utile pour les endpoints sensibles (login, register, etc.)
    """
    scope = 'strict_ip'
    
    def get_cache_key(self, request, view):
        # Vérifier whitelist
        if self.is_whitelisted(request):
            return None
        
        # Vérifier blacklist
        if self.is_blacklisted(request):
            return 'blacklisted'
        
        # Toujours utiliser l'IP
        ident = self.get_client_ip(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
    
    def throttle_failure(self):
        if hasattr(self, '_request'):
            identifier = self.get_ident()
            self.send_alert(self._request, identifier)
        return super().throttle_failure()
    
    def allow_request(self, request, view):
        self._request = request
        return super().allow_request(request, view)


class PerEndpointThrottle(IPAddressMixin, WhitelistMixin, BlacklistMixin, SimpleRateThrottle):
    """
    Rate limiting par endpoint
    
    Permet de définir des limites différentes par endpoint
    """
    
    def get_cache_key(self, request, view):
        # Vérifier whitelist
        if self.is_whitelisted(request):
            return None
        
        # Vérifier blacklist
        if self.is_blacklisted(request):
            return 'blacklisted'
        
        # Identifier par user_id ou IP
        if request.user and request.user.is_authenticated:
            ident = f'user_{request.user.pk}'
        else:
            ident = self.get_client_ip(request)
        
        # Inclure le path dans la clé
        endpoint = request.path.replace('/', '_')
        
        return f'throttle_endpoint:{endpoint}:{ident}'
    
    def get_rate(self):
        """Récupère le rate depuis la vue ou utilise le défaut"""
        if hasattr(self, 'view') and hasattr(self.view, 'throttle_rate'):
            return self.view.throttle_rate
        return self.rate


class DynamicRateThrottle(IPAddressMixin, WhitelistMixin, BlacklistMixin, SimpleRateThrottle):
    """
    Rate limiting dynamique basé sur le comportement
    
    Réduit la limite si comportement suspect détecté
    """
    scope = 'dynamic'
    
    def get_cache_key(self, request, view):
        # Vérifier whitelist
        if self.is_whitelisted(request):
            return None
        
        # Vérifier blacklist
        if self.is_blacklisted(request):
            return 'blacklisted'
        
        # Identifier
        if request.user and request.user.is_authenticated:
            ident = f'user_{request.user.pk}'
        else:
            ident = self.get_client_ip(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
    
    def get_rate(self):
        """Ajuste le rate selon le comportement"""
        if not hasattr(self, '_request'):
            return self.rate
        
        request = self._request
        
        # Vérifier si comportement suspect
        if self.is_suspicious_behavior(request):
            # Réduire la limite de moitié
            rate, period = self.rate.split('/')
            reduced_rate = int(int(rate) / 2)
            return f'{reduced_rate}/{period}'
        
        return self.rate
    
    def is_suspicious_behavior(self, request):
        """Détecte un comportement suspect"""
        # Vérifier le nombre d'erreurs récentes
        if request.user and request.user.is_authenticated:
            ident = f'user_{request.user.pk}'
        else:
            ident = self.get_client_ip(request)
        
        error_key = f'throttle_errors:{ident}'
        error_count = cache.get(error_key, 0)
        
        # Si plus de 10 erreurs dans la dernière heure
        if error_count > 10:
            return True
        
        return False
    
    def allow_request(self, request, view):
        self._request = request
        return super().allow_request(request, view)


class BurstProtectionThrottle(IPAddressMixin, WhitelistMixin, BlacklistMixin, SimpleRateThrottle):
    """
    Protection contre les bursts (pics de requêtes)
    
    Limite très stricte sur une courte période
    """
    scope = 'burst'
    
    def get_cache_key(self, request, view):
        # Vérifier whitelist
        if self.is_whitelisted(request):
            return None
        
        # Vérifier blacklist
        if self.is_blacklisted(request):
            return 'blacklisted'
        
        # Identifier
        if request.user and request.user.is_authenticated:
            ident = f'user_{request.user.pk}'
        else:
            ident = self.get_client_ip(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


# Fonctions utilitaires

def add_to_blacklist(identifier, duration=3600):
    """
    Ajoute une IP ou un email à la blacklist temporaire
    
    Args:
        identifier: IP ou email
        duration: Durée en secondes (défaut: 1 heure)
    """
    key = f'blacklist_temp:{identifier}'
    cache.set(key, True, duration)
    logger.warning(f"Added to temporary blacklist: {identifier} for {duration}s")


def remove_from_blacklist(identifier):
    """Retire une IP ou un email de la blacklist temporaire"""
    key = f'blacklist_temp:{identifier}'
    cache.delete(key)
    logger.info(f"Removed from temporary blacklist: {identifier}")


def is_temporarily_blacklisted(identifier):
    """Vérifie si un identifier est temporairement blacklisté"""
    key = f'blacklist_temp:{identifier}'
    return cache.get(key, False)


def get_throttle_status(identifier):
    """
    Récupère le statut de throttling pour un identifier
    
    Returns:
        dict: {
            'requests': int,  # Nombre de requêtes
            'limit': int,     # Limite
            'remaining': int, # Requêtes restantes
            'reset_time': int # Timestamp de reset
        }
    """
    # Chercher dans le cache
    cache_key = f'throttle_combined:{identifier}'
    history = cache.get(cache_key, [])
    
    if not history:
        return {
            'requests': 0,
            'limit': 0,
            'remaining': 0,
            'reset_time': 0
        }
    
    # Calculer les stats
    import time
    now = time.time()
    
    # Filtrer les requêtes dans la fenêtre
    window = 3600  # 1 heure
    recent = [t for t in history if now - t < window]
    
    return {
        'requests': len(recent),
        'limit': 100,  # À récupérer depuis settings
        'remaining': max(0, 100 - len(recent)),
        'reset_time': int(min(recent) + window) if recent else 0
    }


def log_throttle_event(request, throttle_class, allowed):
    """
    Log un événement de throttling
    
    Args:
        request: Django request
        throttle_class: Classe de throttle
        allowed: Boolean, si la requête a été autorisée
    """
    logger.info(
        f"Throttle event: {throttle_class.__name__}",
        extra={
            'allowed': allowed,
            'path': request.path,
            'method': request.method,
            'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
            'ip': request.META.get('REMOTE_ADDR'),
        }
    )
