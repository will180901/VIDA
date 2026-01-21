from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment, AppointmentSlotLock, AppointmentHistory, AppointmentProposal, AppointmentRequest
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
    patient_email = serializers.EmailField(required=False, allow_blank=True)
    
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
        """Normalize email if provided"""
        if value:
            return value.strip().lower()
        return value

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
    can_be_modified = serializers.SerializerMethodField()
    can_be_cancelled = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_first_name', 'patient_last_name', 
            'patient_email', 'patient_phone', 'patient_full_name',
            'date', 'time', 'consultation_type', 'consultation_type_display',
            'reason', 'status', 'status_display', 'is_upcoming',
            'notes_patient', 'created_at', 'confirmed_at',
            'can_be_modified', 'can_be_cancelled',
            'rejection_reason', 'admin_message', 'patient_message',
            'proposed_date', 'proposed_time', 'proposed_consultation_type'
        ]
        read_only_fields = ['id', 'patient', 'created_at', 'confirmed_at']
    
    def get_can_be_modified(self, obj):
        """Vérifie si le patient peut modifier le RDV (24h avant)."""
        return obj.can_be_modified_by_patient()
    
    def get_can_be_cancelled(self, obj):
        """Vérifie si le patient peut annuler le RDV (24h avant)."""
        return obj.can_be_cancelled_by_patient()


class AppointmentStaffSerializer(AppointmentSerializer):
    """Serializer avec champs supplémentaires pour le staff."""
    class Meta(AppointmentSerializer.Meta):
        fields = AppointmentSerializer.Meta.fields + [
            'notes_staff', 'cancelled_at', 'cancellation_reason',
            'reminder_sent', 'reminder_sent_at', 'created_by', 'last_modified_by',
            'responded_at', 'proposal_sent_at'
        ]


class AvailableSlotsSerializer(serializers.Serializer):
    date = serializers.DateField()
    slots = serializers.ListField(child=serializers.TimeField())


class SlotLockSerializer(serializers.Serializer):
    date = serializers.DateField()
    time = serializers.TimeField()



# ============================================================================
# NOUVEAUX SERIALIZERS POUR WORKFLOW BIDIRECTIONNEL
# ============================================================================

class AppointmentHistorySerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des modifications."""
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    actor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AppointmentHistory
        fields = [
            'id', 'appointment', 'action_type', 'action_type_display',
            'actor', 'actor_name', 'actor_type', 'patient_name',
            'old_date', 'old_time', 'old_consultation_type', 'old_status',
            'new_date', 'new_time', 'new_consultation_type', 'new_status',
            'changes_data',  # ✅ Nouveau champ JSON
            'message', 'reason', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_actor_name(self, obj):
        """Retourne le nom de l'acteur selon le contexte."""
        request = self.context.get('request')
        
        if obj.actor:
            # Si l'acteur est un admin/staff
            if obj.actor_type in ['admin', 'staff']:
                # Pour le patient, masquer le nom de l'admin
                if request and request.user.role == 'patient':
                    return "Centre VIDA"
                # Pour l'admin, afficher le nom complet
                else:
                    return f"{obj.actor.first_name} {obj.actor.last_name}".strip() or obj.actor.email
            
            # Si l'acteur est un patient
            elif obj.actor_type == 'patient':
                return f"{obj.actor.first_name} {obj.actor.last_name}".strip() or obj.actor.email
        
        return "Système"
    
    def get_patient_name(self, obj):
        """Retourne le nom du patient lié au RDV."""
        appointment = obj.appointment
        return f"{appointment.patient_first_name} {appointment.patient_last_name}".strip()


class AppointmentProposalSerializer(serializers.ModelSerializer):
    """Serializer pour les propositions de modification."""
    proposal_type_display = serializers.CharField(source='get_proposal_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    proposed_by_name = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = AppointmentProposal
        fields = [
            'id', 'appointment', 'proposal_type', 'proposal_type_display',
            'status', 'status_display',
            'proposed_date', 'proposed_time', 'proposed_consultation_type',
            'message', 'proposed_by', 'proposed_by_name',
            'created_at', 'expires_at', 'responded_at', 'response_message',
            'is_expired'
        ]
        read_only_fields = ['id', 'created_at', 'responded_at']
    
    def get_proposed_by_name(self, obj):
        """Retourne le nom de la personne qui a proposé."""
        if obj.proposed_by:
            return f"{obj.proposed_by.first_name} {obj.proposed_by.last_name}".strip() or obj.proposed_by.email
        return None


class AppointmentRespondSerializer(serializers.Serializer):
    """Serializer pour la réponse admin à une demande de RDV."""
    action = serializers.ChoiceField(choices=['accept', 'reject', 'propose'], required=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    proposed_date = serializers.DateField(required=False, allow_null=True)
    proposed_time = serializers.TimeField(required=False, allow_null=True)
    proposed_consultation_type = serializers.CharField(required=False, allow_blank=True)
    admin_message = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        action = attrs.get('action')
        
        # Si reject, la raison est obligatoire
        if action == 'reject':
            if not attrs.get('rejection_reason'):
                raise serializers.ValidationError({
                    'rejection_reason': 'La raison du refus est obligatoire.'
                })
        
        # Si propose, date et heure sont obligatoires
        if action == 'propose':
            if not attrs.get('proposed_date') or not attrs.get('proposed_time'):
                raise serializers.ValidationError({
                    'proposed_date': 'La date et l\'heure proposées sont obligatoires.',
                    'proposed_time': 'La date et l\'heure proposées sont obligatoires.'
                })
            
            # Vérifier que le créneau proposé est dans le futur
            proposed_datetime = datetime.combine(attrs['proposed_date'], attrs['proposed_time'])
            if timezone.make_aware(proposed_datetime) <= timezone.now():
                raise serializers.ValidationError({
                    'proposed_date': 'Le créneau proposé doit être dans le futur.'
                })
            
            # Vérifier disponibilité du créneau
            appointment_id = self.context.get('appointment_id')
            existing = Appointment.objects.filter(
                date=attrs['proposed_date'],
                time=attrs['proposed_time'],
                status__in=['pending', 'confirmed', 'awaiting_patient_response', 
                           'awaiting_admin_response', 'modification_pending']
            ).exclude(id=appointment_id).exists()
            
            if existing:
                raise serializers.ValidationError({
                    'proposed_date': 'Ce créneau n\'est pas disponible.'
                })
        
        return attrs


class AppointmentAcceptSerializer(serializers.Serializer):
    """Serializer pour accepter une proposition."""
    proposal_id = serializers.IntegerField(required=True)
    
    def validate_proposal_id(self, value):
        """Vérifie que la proposition existe et est en attente."""
        try:
            proposal = AppointmentProposal.objects.get(id=value)
            if proposal.status != 'pending':
                raise serializers.ValidationError('Cette proposition n\'est plus en attente.')
            if proposal.is_expired():
                raise serializers.ValidationError('Cette proposition a expiré.')
            return value
        except AppointmentProposal.DoesNotExist:
            raise serializers.ValidationError('Proposition introuvable.')


class AppointmentRejectSerializer(serializers.Serializer):
    """Serializer pour refuser une proposition."""
    proposal_id = serializers.IntegerField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate_proposal_id(self, value):
        """Vérifie que la proposition existe et est en attente."""
        try:
            proposal = AppointmentProposal.objects.get(id=value)
            if proposal.status != 'pending':
                raise serializers.ValidationError('Cette proposition n\'est plus en attente.')
            return value
        except AppointmentProposal.DoesNotExist:
            raise serializers.ValidationError('Proposition introuvable.')


class AppointmentCounterProposeSerializer(serializers.Serializer):
    """Serializer pour contre-proposer une date."""
    proposed_date = serializers.DateField(required=True)
    proposed_time = serializers.TimeField(required=True)
    patient_message = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        # Vérifier que le créneau proposé est dans le futur
        proposed_datetime = datetime.combine(attrs['proposed_date'], attrs['proposed_time'])
        if timezone.make_aware(proposed_datetime) <= timezone.now():
            raise serializers.ValidationError({
                'proposed_date': 'Le créneau proposé doit être dans le futur.'
            })
        
        # Vérifier disponibilité du créneau
        appointment_id = self.context.get('appointment_id')
        existing = Appointment.objects.filter(
            date=attrs['proposed_date'],
            time=attrs['proposed_time'],
            status__in=['pending', 'confirmed', 'awaiting_patient_response', 
                       'awaiting_admin_response', 'modification_pending']
        ).exclude(id=appointment_id).exists()
        
        if existing:
            raise serializers.ValidationError({
                'proposed_date': 'Ce créneau n\'est pas disponible.'
            })
        
        return attrs


class AppointmentModifySerializer(serializers.Serializer):
    """Serializer pour modifier un RDV confirmé."""
    new_date = serializers.DateField(required=True)
    new_time = serializers.TimeField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        appointment = self.context.get('appointment')
        
        # Vérifier le délai de 24h
        if not appointment.can_be_modified_by_patient():
            raise serializers.ValidationError(
                "Impossible de modifier moins de 24h avant le rendez-vous. "
                "Veuillez contacter la clinique au 06 XXX XX XX."
            )
        
        # Vérifier que le nouveau créneau est dans le futur
        new_datetime = datetime.combine(attrs['new_date'], attrs['new_time'])
        if timezone.make_aware(new_datetime) <= timezone.now():
            raise serializers.ValidationError({
                'new_date': 'Le nouveau créneau doit être dans le futur.'
            })
        
        # Vérifier disponibilité du nouveau créneau
        existing = Appointment.objects.filter(
            date=attrs['new_date'],
            time=attrs['new_time'],
            status__in=['pending', 'confirmed', 'awaiting_patient_response', 
                       'awaiting_admin_response', 'modification_pending']
        ).exclude(id=appointment.id).exists()
        
        if existing:
            raise serializers.ValidationError({
                'new_date': 'Ce créneau n\'est pas disponible.'
            })
        
        return attrs


class AppointmentCancelSerializer(serializers.Serializer):
    """Serializer pour annuler un RDV."""
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        appointment = self.context.get('appointment')
        
        # Vérifier le délai de 24h
        if not appointment.can_be_cancelled_by_patient():
            raise serializers.ValidationError(
                "Impossible d'annuler moins de 24h avant le rendez-vous. "
                "Veuillez contacter la clinique au 06 XXX XX XX."
            )
        
        return attrs


# ============================================================================
# APPOINTMENT REQUEST SERIALIZERS
# ============================================================================

class AppointmentRequestSerializer(serializers.ModelSerializer):
    """Serializer pour créer une demande de rendez-vous sans compte."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = AppointmentRequest
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'email',
            'access_code', 'preferred_date', 'preferred_time_slot',
            'service', 'notes', 'status', 'status_display',
            'expires_at', 'is_expired', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'access_code', 'status', 'expires_at', 'created_at', 'updated_at']
    
    def validate_first_name(self, value):
        """Sanitize first name pour prévenir XSS"""
        return sanitize_text_input(value)
    
    def validate_last_name(self, value):
        """Sanitize last name pour prévenir XSS"""
        return sanitize_text_input(value)
    
    def validate_preferred_date(self, value):
        """Valide que la date est dans le futur."""
        from django.core.exceptions import ValidationError
        from django.utils.translation import gettext_lazy as _
        from datetime import date
        
        if value < date.today():
            raise ValidationError(
                _('La date préférée ne peut pas être dans le passé.')
            )
        return value


class AppointmentRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour créer une demande de RDV."""
    
    class Meta:
        model = AppointmentRequest
        fields = [
            'first_name', 'last_name', 'phone', 'email',
            'preferred_date', 'preferred_time_slot', 'service', 'notes'
        ]
    
    def validate_first_name(self, value):
        return sanitize_text_input(value)
    
    def validate_last_name(self, value):
        return sanitize_text_input(value)
    
    def validate_phone(self, value):
        """Valide le numéro de téléphone congolais."""
        from apps.users.phone_validators import validate_congo_phone
        from django.core.exceptions import ValidationError
        try:
            validate_congo_phone(value)
        except ValidationError:
            raise serializers.ValidationError(
                "Format de téléphone invalide. Utilisez le format: 06 XXX XX XX, 05 XXX XX XX, 04 XXX XX XX ou 222 XX XX XX"
            )
        return value


class AppointmentRequestValidateSerializer(serializers.Serializer):
    """Serializer pour valider une demande avec le code d'accès."""
    access_code = serializers.CharField(max_length=10, required=True)
    
    def validate_access_code(self, value):
        """Vérifie que le code existe et n'est pas expiré."""
        try:
            appointment_request = AppointmentRequest.objects.get(access_code=value.upper())
            if appointment_request.is_expired():
                raise serializers.ValidationError(
                    "Ce code d'accès a expiré. Veuillez soumettre une nouvelle demande."
                )
            self.appointment_request = appointment_request
        except AppointmentRequest.DoesNotExist:
            raise serializers.ValidationError(
                "Code d'accès invalide."
            )
        return value.upper()
