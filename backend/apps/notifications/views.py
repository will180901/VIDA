from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Notification
from .serializers import (
    NotificationSerializer,
    NotificationListSerializer,
    NotificationCountSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les notifications
    
    Endpoints :
    - GET /notifications/ : Liste des notifications de l'utilisateur connecté
    - GET /notifications/{id}/ : Détail d'une notification
    - PATCH /notifications/{id}/ : Modifier une notification (is_read)
    - DELETE /notifications/{id}/ : Supprimer une notification
    - GET /notifications/count/ : Count des notifications non lues
    - POST /notifications/{id}/mark-as-read/ : Marquer comme lu
    - POST /notifications/{id}/mark-as-unread/ : Marquer comme non lu
    - POST /notifications/mark-all-as-read/ : Marquer toutes comme lues
    - DELETE /notifications/delete-all-read/ : Supprimer toutes les lues
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """
        Retourner uniquement les notifications de l'utilisateur connecté
        
        Filtres disponibles :
        - is_read : true/false
        - type : type de notification
        - date_from : date de début (YYYY-MM-DD)
        - date_to : date de fin (YYYY-MM-DD)
        """
        queryset = Notification.objects.filter(user=self.request.user)
        
        # Filtre par statut de lecture
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
        
        # Filtre par type
        notification_type = self.request.query_params.get('type', None)
        if notification_type:
            queryset = queryset.filter(type=notification_type)
        
        # Filtre par date
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset.select_related('related_appointment')
    
    def get_serializer_class(self):
        """Utiliser un serializer simplifié pour la liste"""
        if self.action == 'list':
            return NotificationListSerializer
        return NotificationSerializer
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        """
        Retourner le count des notifications non lues
        
        GET /notifications/count/
        
        Response:
        {
            "unread_count": 5,
            "total_count": 42
        }
        """
        user = request.user
        unread_count = Notification.objects.filter(user=user, is_read=False).count()
        total_count = Notification.objects.filter(user=user).count()
        
        serializer = NotificationCountSerializer({
            'unread_count': unread_count,
            'total_count': total_count
        })
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Marquer une notification comme lue
        
        POST /notifications/{id}/mark-as-read/
        
        Response:
        {
            "id": 1,
            "is_read": true,
            "read_at": "2026-01-30T10:30:00Z"
        }
        """
        notification = self.get_object()
        notification.mark_as_read()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """
        Marquer une notification comme non lue
        
        POST /notifications/{id}/mark-as-unread/
        
        Response:
        {
            "id": 1,
            "is_read": false,
            "read_at": null
        }
        """
        notification = self.get_object()
        notification.mark_as_unread()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        Marquer toutes les notifications comme lues
        
        POST /notifications/mark-all-as-read/
        
        Response:
        {
            "message": "5 notification(s) marquée(s) comme lue(s)",
            "count": 5
        }
        """
        count = Notification.mark_all_as_read(request.user)
        
        return Response({
            'message': f'{count} notification(s) marquée(s) comme lue(s)',
            'count': count
        })
    
    @action(detail=False, methods=['delete'])
    def delete_all_read(self, request):
        """
        Supprimer toutes les notifications lues
        
        DELETE /notifications/delete-all-read/
        
        Response:
        {
            "message": "10 notification(s) supprimée(s)",
            "count": 10
        }
        """
        count, _ = Notification.delete_all_read(request.user)
        
        return Response({
            'message': f'{count} notification(s) supprimée(s)',
            'count': count
        })
    
    def destroy(self, request, *args, **kwargs):
        """
        Supprimer une notification
        
        DELETE /notifications/{id}/
        
        Response: 204 No Content
        """
        notification = self.get_object()
        notification.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
