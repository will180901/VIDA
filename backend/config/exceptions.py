"""
Gestion personnalisée des exceptions pour l'API VIDA
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.exceptions import Throttled, ValidationError, PermissionDenied, NotAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404

logger = logging.getLogger('django.security')


def custom_exception_handler(exc, context):
    """
    Gestionnaire d'exceptions personnalisé pour des messages plus clairs
    et logging des erreurs de sécurité
    """
    response = exception_handler(exc, context)
    
    # Récupérer les infos de la requête
    request = context.get('request')
    view = context.get('view')
    
    if isinstance(exc, Throttled):
        # Message personnalisé pour le rate limiting
        wait_time = exc.wait
        
        if wait_time:
            if wait_time < 60:
                wait_message = f"{int(wait_time)} secondes"
            elif wait_time < 3600:
                wait_message = f"{int(wait_time / 60)} minutes"
            else:
                wait_message = f"{int(wait_time / 3600)} heures"
            
            custom_response_data = {
                'error': 'Trop de requêtes',
                'detail': f'Vous avez dépassé la limite de requêtes autorisées. Veuillez réessayer dans {wait_message}.',
                'retry_after': int(wait_time)
            }
        else:
            custom_response_data = {
                'error': 'Trop de requêtes',
                'detail': 'Vous avez dépassé la limite de requêtes autorisées. Veuillez réessayer plus tard.',
            }
        
        response.data = custom_response_data
        
        # Logger les tentatives de rate limiting
        if request:
            logger.warning(
                f"Rate limit dépassé: {request.path} depuis {request.META.get('REMOTE_ADDR')}",
                extra={'ip': request.META.get('REMOTE_ADDR'), 'path': request.path}
            )
    
    elif isinstance(exc, PermissionDenied):
        # Logger les tentatives d'accès non autorisé
        if request:
            user = getattr(request, 'user', 'anonymous')
            logger.warning(
                f"Accès refusé: {request.path} par {user}",
                extra={
                    'ip': request.META.get('REMOTE_ADDR'),
                    'user': str(user),
                    'path': request.path
                }
            )
    
    elif isinstance(exc, NotAuthenticated):
        # Message personnalisé pour authentification requise
        if response:
            response.data = {
                'error': 'Authentification requise',
                'detail': 'Vous devez être connecté pour accéder à cette ressource.'
            }
    
    elif isinstance(exc, ValidationError):
        # Formater les erreurs de validation de manière cohérente
        if response:
            response.data = {
                'error': 'Erreur de validation',
                'detail': response.data
            }
    
    elif isinstance(exc, (ObjectDoesNotExist, Http404)):
        # Message personnalisé pour ressources non trouvées
        return Response(
            {
                'error': 'Ressource non trouvée',
                'detail': 'La ressource demandée n\'existe pas.'
            },
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Gérer les erreurs 500 (erreurs serveur)
    elif response is None:
        # Erreur non gérée par DRF (erreur serveur)
        logger.error(
            f"Erreur serveur: {str(exc)}",
            exc_info=True,
            extra={
                'ip': request.META.get('REMOTE_ADDR') if request else None,
                'path': request.path if request else None,
                'user': str(getattr(request, 'user', 'anonymous')) if request else None
            }
        )
        
        # En production, ne pas révéler les détails de l'erreur
        from django.conf import settings
        if settings.DEBUG:
            detail = str(exc)
        else:
            detail = 'Une erreur interne est survenue. Veuillez réessayer plus tard.'
        
        return Response(
            {
                'error': 'Erreur serveur',
                'detail': detail
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response
