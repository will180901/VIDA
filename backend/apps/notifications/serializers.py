from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Notification
    
    Champs supplémentaires :
    - time_ago : Temps écoulé depuis la création (ex: "Il y a 5 minutes")
    - date_group : Groupe de date pour le groupement UI (ex: "Aujourd'hui")
    - patient_name : Nom du patient si RDV lié (pour affichage rapide)
    """
    
    time_ago = serializers.SerializerMethodField()
    date_group = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    appointment_date = serializers.SerializerMethodField()
    appointment_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'title',
            'message',
            'icon',
            'color',
            'action_url',
            'is_read',
            'read_at',
            'created_at',
            'time_ago',
            'date_group',
            'related_appointment',
            'patient_name',
            'appointment_date',
            'appointment_time',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'time_ago',
            'date_group',
            'patient_name',
            'appointment_date',
            'appointment_time',
        ]
    
    def get_time_ago(self, obj):
        """Retourner le temps écoulé"""
        return obj.get_time_ago()
    
    def get_date_group(self, obj):
        """Retourner le groupe de date"""
        return obj.get_date_group()
    
    def get_patient_name(self, obj):
        """Retourner le nom du patient si RDV lié"""
        if obj.related_appointment:
            return f"{obj.related_appointment.patient_first_name} {obj.related_appointment.patient_last_name}"
        return None
    
    def get_appointment_date(self, obj):
        """Retourner la date du RDV si lié"""
        if obj.related_appointment:
            return obj.related_appointment.date.strftime('%Y-%m-%d')
        return None
    
    def get_appointment_time(self, obj):
        """Retourner l'heure du RDV si lié"""
        if obj.related_appointment:
            return obj.related_appointment.time
        return None


class NotificationListSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour la liste des notifications
    Utilisé pour optimiser les performances (moins de champs)
    """
    
    time_ago = serializers.SerializerMethodField()
    date_group = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'title',
            'message',
            'icon',
            'color',
            'action_url',
            'is_read',
            'created_at',
            'time_ago',
            'date_group',
        ]
    
    def get_time_ago(self, obj):
        return obj.get_time_ago()
    
    def get_date_group(self, obj):
        return obj.get_date_group()


class NotificationCountSerializer(serializers.Serializer):
    """Serializer pour le count des notifications non lues"""
    
    unread_count = serializers.IntegerField()
    total_count = serializers.IntegerField()
