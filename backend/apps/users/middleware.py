"""
Middleware pour extraire JWT token depuis httpOnly cookie
"""
from django.conf import settings


class JWTCookieMiddleware:
    """
    Middleware qui extrait le JWT token depuis le cookie httpOnly
    et le place dans le header Authorization pour que DRF puisse l'utiliser
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Récupérer le token depuis le cookie
        access_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        
        # Si token présent et pas déjà d'Authorization header
        if access_token and not request.META.get('HTTP_AUTHORIZATION'):
            # Ajouter le token dans le header Authorization
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
        
        response = self.get_response(request)
        return response
