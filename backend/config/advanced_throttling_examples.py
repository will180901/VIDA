"""
Exemples d'utilisation du rate limiting avancé
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, throttle_classes
from config.advanced_throttling import (
    CombinedRateThrottle,
    StrictIPThrottle,
    PerEndpointThrottle,
    DynamicRateThrottle,
    BurstProtectionThrottle,
    add_to_blacklist,
    remove_from_blacklist,
    get_throttle_status,
)


# =============================================================================
# Exemple 1 : Vue avec rate limiting combiné (IP + User)
# =============================================================================
class DashboardView(APIView):
    """
    Vue dashboard avec rate limiting combiné
    200 requêtes/heure par IP ou par utilisateur
    """
    throttle_classes = [CombinedRateThrottle]
    
    def get(self, request):
        return Response({'message': 'Dashboard data'})


# =============================================================================
# Exemple 2 : Vue avec rate limiting strict par IP
# =============================================================================
class LoginView(APIView):
    """
    Vue login avec rate limiting strict par IP
    50 requêtes/heure par IP (même si utilisateur change)
    """
    throttle_classes = [StrictIPThrottle]
    
    def post(self, request):
        # Logique de login
        return Response({'message': 'Login successful'})


# =============================================================================
# Exemple 3 : Vue avec rate limiting par endpoint
# =============================================================================
class ReportView(APIView):
    """
    Vue avec rate limiting spécifique à cet endpoint
    """
    throttle_classes = [PerEndpointThrottle]
    throttle_rate = '10/hour'  # Limite personnalisée
    
    def get(self, request):
        # Génération de rapport
        return Response({'message': 'Report generated'})


# =============================================================================
# Exemple 4 : Vue avec rate limiting dynamique
# =============================================================================
class SearchView(APIView):
    """
    Vue avec rate limiting qui s'adapte au comportement
    Réduit la limite si comportement suspect
    """
    throttle_classes = [DynamicRateThrottle]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        # Logique de recherche
        return Response({'results': []})


# =============================================================================
# Exemple 5 : Vue avec protection burst
# =============================================================================
class APIEndpointView(APIView):
    """
    Vue avec protection contre les bursts
    20 requêtes/minute maximum
    """
    throttle_classes = [BurstProtectionThrottle]
    
    def get(self, request):
        return Response({'data': 'API response'})


# =============================================================================
# Exemple 6 : Vue avec plusieurs throttles
# =============================================================================
class SecureView(APIView):
    """
    Vue avec plusieurs niveaux de throttling
    """
    throttle_classes = [
        BurstProtectionThrottle,  # Protection burst
        CombinedRateThrottle,     # Limite globale
    ]
    
    def post(self, request):
        return Response({'message': 'Secure operation'})


# =============================================================================
# Exemple 7 : Décorateur pour fonction view
# =============================================================================
@api_view(['GET'])
@throttle_classes([CombinedRateThrottle])
def simple_view(request):
    """Vue simple avec rate limiting"""
    return Response({'message': 'Hello'})


# =============================================================================
# Exemple 8 : Gestion manuelle de la blacklist
# =============================================================================
class AdminBlacklistView(APIView):
    """
    Vue admin pour gérer la blacklist
    """
    
    def post(self, request):
        """Ajouter à la blacklist"""
        identifier = request.data.get('identifier')
        duration = request.data.get('duration', 3600)
        
        if identifier:
            add_to_blacklist(identifier, duration)
            return Response({'message': f'{identifier} blacklisted for {duration}s'})
        
        return Response({'error': 'identifier required'}, status=400)
    
    def delete(self, request):
        """Retirer de la blacklist"""
        identifier = request.data.get('identifier')
        
        if identifier:
            remove_from_blacklist(identifier)
            return Response({'message': f'{identifier} removed from blacklist'})
        
        return Response({'error': 'identifier required'}, status=400)


# =============================================================================
# Exemple 9 : Vérifier le statut de throttling
# =============================================================================
class ThrottleStatusView(APIView):
    """
    Vue pour vérifier le statut de throttling d'un utilisateur
    """
    
    def get(self, request):
        """Récupère le statut de throttling"""
        # Identifier l'utilisateur
        if request.user.is_authenticated:
            identifier = f'user_{request.user.pk}'
        else:
            identifier = request.META.get('REMOTE_ADDR')
        
        status = get_throttle_status(identifier)
        
        return Response({
            'identifier': identifier,
            'requests': status['requests'],
            'limit': status['limit'],
            'remaining': status['remaining'],
            'reset_time': status['reset_time'],
        })


# =============================================================================
# Exemple 10 : Vue avec throttling conditionnel
# =============================================================================
class ConditionalThrottleView(APIView):
    """
    Vue avec throttling qui dépend de conditions
    """
    
    def get_throttles(self):
        """Retourne les throttles selon les conditions"""
        # Throttling plus strict pour les requêtes POST
        if self.request.method == 'POST':
            return [StrictIPThrottle()]
        
        # Throttling normal pour GET
        return [CombinedRateThrottle()]
    
    def get(self, request):
        return Response({'message': 'GET request'})
    
    def post(self, request):
        return Response({'message': 'POST request'})


# =============================================================================
# Exemple 11 : Middleware personnalisé pour auto-blacklist
# =============================================================================
class AutoBlacklistMiddleware:
    """
    Middleware qui blacklist automatiquement après X violations
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Si throttled (429)
        if response.status_code == 429:
            # Incrémenter le compteur de violations
            identifier = self.get_identifier(request)
            violations_key = f'throttle_violations:{identifier}'
            
            from django.core.cache import cache
            violations = cache.get(violations_key, 0)
            violations += 1
            cache.set(violations_key, violations, 3600)  # 1 heure
            
            # Si plus de 5 violations, blacklist pour 1 heure
            if violations >= 5:
                add_to_blacklist(identifier, 3600)
                
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(
                    f"Auto-blacklisted {identifier} after {violations} violations"
                )
        
        return response
    
    def get_identifier(self, request):
        """Récupère l'identifier (IP ou user_id)"""
        if request.user.is_authenticated:
            return f'user_{request.user.pk}'
        
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


# =============================================================================
# Exemple 12 : Vue avec rate limiting par rôle
# =============================================================================
class RoleBasedThrottleView(APIView):
    """
    Vue avec throttling différent selon le rôle
    """
    
    def get_throttles(self):
        """Throttling selon le rôle de l'utilisateur"""
        if self.request.user.is_authenticated:
            # Staff : pas de throttling
            if self.request.user.is_staff:
                return []
            
            # Utilisateurs premium : limite haute
            if hasattr(self.request.user, 'is_premium') and self.request.user.is_premium:
                throttle = CombinedRateThrottle()
                throttle.rate = '500/hour'
                return [throttle]
        
        # Utilisateurs normaux : limite standard
        return [CombinedRateThrottle()]
    
    def get(self, request):
        return Response({'message': 'Role-based throttling'})
