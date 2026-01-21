from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment, AppointmentSlotLock
from apps.users.sanitizers import sanitize_text_input
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Rendez-vous consultation générale',
            value={
                'patient_first_name': 'Marie',
                'patient_last_name': 'Martin',
                'patient_email': 'marie.martin@example.com',
                'patient_phone': '06 123 45 67',
                'date': '2026-02-15',
                'time': '10:00',
                'consultation_type': 'generale',
                'reason': 'Contrôle de routine'
            },
            request_only=True,
        ),
        OpenApiExample(
            'Rendez-vous urgence',
            value={
                'patient_first_name': 'Paul',
                'patient_last_name': 'Dubois',
                'patient_email': 'paul.dubois@example.com',
                'patient_phone': '05 987 65 43',
                'date': '2026-02-10',
                'time': '14:30',
                'consultation_type': 'urgence',
                'reason': 'Douleur oculaire intense'
            },
            request_only=True,
        ),
    ]
)
class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'patient_first_name', 'patient_last_name', 'patient_email', 'patient_phone',
            'date', 'time', 'consultation_type', 'reason'
        ]

    def validate_patient_first_name(self, value):
        """Sanitize first name pour prévenir XSS"""
        return sanitize_text_input(value)
    
    def validate_patient_last_name(self, value):
        """Sanitize last name pour prévenir XSS"""
        return sanitize_text_input(value)
    
    def validate_reason(self, value):
        """Sanitize reason pour prévenir XSS"""
        return sanitize_text_input(value)
    
    def validate_patient_email(self, value):
        """Normalize email"""
        return value.strip().lower()

    def validate(self, attrs):
        appointment_datetime = datetime.combine(attrs['date'], attrs['time'])
        if timezone.make_aware(appointment_datetime) <= timezone.now():
            raise serializers.ValidationError("Le créneau doit être dans le futur.")
        
        existing = Appointment.objects.filter(
            date=attrs['date'],
            time=attrs['time'],
            status__in=['pending', 'confirmed']
        ).exists()
        if existing:
            raise serializers.ValidationError("Ce créneau n'est plus disponible.")
        
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['patient'] = request.user
        return super().create(validated_data)


class AppointmentSerializer(serializers.ModelSerializer):
    patient_full_name = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    consultation_type_display = serializers.CharField(source='get_consultation_type_display', read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_first_name', 'patient_last_name', 
            'patient_email', 'patient_phone', 'patient_full_name',
            'date', 'time', 'consultation_type', 'consultation_type_display',
            'reason', 'status', 'status_display', 'is_upcoming',
            'notes_patient', 'created_at', 'confirmed_at'
        ]
        read_only_fields = ['id', 'patient', 'created_at', 'confirmed_at']


class AppointmentStaffSerializer(AppointmentSerializer):
    """Serializer avec champs supplémentaires pour le staff."""
    class Meta(AppointmentSerializer.Meta):
        fields = AppointmentSerializer.Meta.fields + [
            'notes_staff', 'cancelled_at', 'cancellation_reason',
            'reminder_sent', 'reminder_sent_at'
        ]


class AvailableSlotsSerializer(serializers.Serializer):
    date = serializers.DateField()
    slots = serializers.ListField(child=serializers.TimeField())


class SlotLockSerializer(serializers.Serializer):
    date = serializers.DateField()
    time = serializers.TimeField()
