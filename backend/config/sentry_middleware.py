"""
Middleware Sentry pour enrichir le contexte des erreurs
"""
from config.sentry import set_user_context, add_breadcrumb


class SentryContextMiddleware:
    """
    Middleware pour ajouter le contexte utilisateur et des breadcrumbs à Sentry
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Ajouter le contexte utilisateur si authentifié
        if hasattr(request, 'user') and request.user.is_authenticated:
            set_user_context(
                user_id=request.user.id,
                email=request.user.email if hasattr(request.user, 'email') else None,
                username=str(request.user)
            )
        
        # Ajouter un breadcrumb pour la requête
        add_breadcrumb(
            message=f"{request.method} {request.path}",
            category='request',
            level='info',
            data={
                'method': request.method,
                'url': request.build_absolute_uri(),
                'query_string': request.META.get('QUERY_STRING', ''),
            }
        )
        
        response = self.get_response(request)
        
        # Ajouter un breadcrumb pour la réponse
        add_breadcrumb(
            message=f"Response {response.status_code}",
            category='response',
            level='info' if response.status_code < 400 else 'warning',
            data={
                'status_code': response.status_code,
            }
        )
        
        return response
    
    def process_exception(self, request, exception):
        """
        Capturer les exceptions avec contexte enrichi
        """
        # Ajouter un breadcrumb pour l'exception
        add_breadcrumb(
            message=f"Exception: {exception.__class__.__name__}",
            category='exception',
            level='error',
            data={
                'exception_type': exception.__class__.__name__,
                'exception_message': str(exception),
            }
        )
        
        # L'exception sera automatiquement capturée par Sentry
        return None
