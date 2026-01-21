from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
from apps.users.phone_validators import validate_congo_phone
import uuid
import random
import string
from apps.content_management.models import MedicalService


def validate_appointment_date(value):
    """
    Valide que la date de RDV est valide
    - Pas dans le passé
    - Pas trop loin dans le futur (max 6 mois)
    """
    today = timezone.now().date()
    
    if value < today:
        raise ValidationError(
            _('La date du rendez-vous ne peut pas être dans le passé.')
        )
    
    max_future_date = today + timedelta(days=180)  # 6 mois
    if value > max_future_date:
        raise ValidationError(
            _('La date du rendez-vous ne peut pas être plus de 6 mois dans le futur.')
        )


def validate_appointment_time(value):
    """
    Valide que l'heure de RDV est dans les heures d'ouverture
    """
    # Heures d'ouverture : 8h-18h
    if value.hour < 8 or value.hour >= 18:
        raise ValidationError(
            _('L\'heure du rendez-vous doit être entre 8h00 et 18h00.')
        )


class Appointment(models.Model):
    """Rendez-vous médical avec gestion bidirectionnelle."""
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('En attente')
        CONFIRMED = 'confirmed', _('Confirmé')
        REJECTED = 'rejected', _('Refusé')
        AWAITING_PATIENT_RESPONSE = 'awaiting_patient_response', _('En attente patient')
        AWAITING_ADMIN_RESPONSE = 'awaiting_admin_response', _('En attente admin')
        REJECTED_BY_PATIENT = 'rejected_by_patient', _('Refusé par patient')
        MODIFICATION_PENDING = 'modification_pending', _('Modification en attente')
        CANCELLED = 'cancelled', _('Annulé')
        COMPLETED = 'completed', _('Terminé')
        NO_SHOW = 'no_show', _('Absent')
    
    class ConsultationType(models.TextChoices):
        GENERAL = 'generale', _('Consultation générale')
        SPECIALIZED = 'specialisee', _('Consultation spécialisée')
        FOLLOW_UP = 'suivi', _('Consultation de suivi')
        EMERGENCY = 'urgence', _('Urgence')
    
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        null=True,
        blank=True
    )
    
    patient_first_name = models.CharField(_('prénom'), max_length=100)
    patient_last_name = models.CharField(_('nom'), max_length=100)
    patient_email = models.EmailField(_('email'), blank=True)
    patient_phone = models.CharField(
        _('téléphone'), 
        max_length=20,
        validators=[validate_congo_phone]
    )
    
    date = models.DateField(_('date'), validators=[validate_appointment_date])
    time = models.TimeField(_('heure'), validators=[validate_appointment_time])
    consultation_type = models.CharField(
        _('type de consultation'),
        max_length=20,
        choices=ConsultationType.choices,
        default=ConsultationType.GENERAL
    )
    reason = models.TextField(_('motif'), blank=True)
    
    status = models.CharField(
        _('statut'),
        max_length=30,  # Augmenté pour les nouveaux statuts
        choices=Status.choices,
        default=Status.PENDING
    )
    notes_patient = models.TextField(_('notes patient'), blank=True)
    notes_staff = models.TextField(_('notes internes'), blank=True)
    
    # Nouveaux champs pour workflow bidirectionnel
    rejection_reason = models.TextField(_('raison du refus'), blank=True)
    admin_message = models.TextField(_('message admin'), blank=True)
    patient_message = models.TextField(_('message patient'), blank=True)
    
    # Champs pour propositions
    proposed_date = models.DateField(_('date proposée'), null=True, blank=True)
    proposed_time = models.TimeField(_('heure proposée'), null=True, blank=True)
    proposed_consultation_type = models.CharField(
        _('type proposé'),
        max_length=20,
        blank=True
    )
    
    # Métadonnées
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_appointments'
    )
    last_modified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='modified_appointments'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(_('raison annulation'), blank=True)
    
    # Nouveaux timestamps
    responded_at = models.DateTimeField(_('répondu le'), null=True, blank=True)
    proposal_sent_at = models.DateTimeField(_('proposition envoyée le'), null=True, blank=True)
    
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Lien vers le dossier médical
    medical_record = models.ForeignKey(
        'users.MedicalRecord',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments',
        verbose_name="Dossier médical"
    )

    class Meta:
        ordering = ['date', 'time']
        verbose_name = _('rendez-vous')
        verbose_name_plural = _('rendez-vous')
        indexes = [
            models.Index(fields=['date', 'time']),  # Recherche de créneaux
            models.Index(fields=['patient', 'date']),  # Recherche par patient
            models.Index(fields=['status', 'date']),  # Filtrage par statut
            models.Index(fields=['patient_email']),  # Recherche par email
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['date', 'time'],
                condition=models.Q(status__in=[
                    'pending', 
                    'confirmed', 
                    'awaiting_patient_response',
                    'awaiting_admin_response',
                    'modification_pending'
                ]),
                name='unique_active_appointment_slot'
            )
        ]

    def __str__(self):
        return f"RDV {self.patient_last_name} - {self.date} {self.time}"

    @property
    def patient_full_name(self):
        return f"{self.patient_first_name} {self.patient_last_name}"

    @property
    def is_upcoming(self):
        from django.utils import timezone
        from datetime import datetime
        appointment_datetime = datetime.combine(self.date, self.time)
        return timezone.make_aware(appointment_datetime) > timezone.now()
    
    def can_be_modified_by_patient(self):
        """Vérifie si le patient peut modifier le RDV (24h avant)."""
        if self.status != 'confirmed':
            return False
        
        appointment_datetime = timezone.make_aware(
            datetime.combine(self.date, self.time)
        )
        now = timezone.now()
        time_until_appointment = appointment_datetime - now
        
        return time_until_appointment > timedelta(hours=24)
    
    def can_be_cancelled_by_patient(self):
        """Vérifie si le patient peut annuler le RDV (24h avant)."""
        return self.can_be_modified_by_patient()


class AppointmentSlotLock(models.Model):
    """Verrouillage temporaire d'un créneau pendant la réservation."""
    date = models.DateField()
    time = models.TimeField()
    locked_by = models.CharField(max_length=100)
    locked_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        unique_together = ['date', 'time']
        verbose_name = _('verrouillage créneau')
        verbose_name_plural = _('verrouillages créneaux')

    def __str__(self):
        return f"Lock {self.date} {self.time} until {self.expires_at}"


class AppointmentHistory(models.Model):
    """Historique des modifications d'un rendez-vous."""
    
    class ActionType(models.TextChoices):
        CREATED = 'created', _('Créé')
        CONFIRMED = 'confirmed', _('Confirmé')
        REJECTED = 'rejected', _('Refusé')
        PROPOSAL_SENT = 'proposal_sent', _('Proposition envoyée')
        PROPOSAL_ACCEPTED = 'proposal_accepted', _('Proposition acceptée')
        PROPOSAL_REJECTED = 'proposal_rejected', _('Proposition refusée')
        COUNTER_PROPOSED = 'counter_proposed', _('Contre-proposition')
        MODIFIED = 'modified', _('Modifié')
        CANCELLED = 'cancelled', _('Annulé')
        COMPLETED = 'completed', _('Terminé')
        NO_SHOW = 'no_show', _('Absent')
    
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='history'
    )
    action_type = models.CharField(
        _('type d\'action'),
        max_length=30,
        choices=ActionType.choices
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='appointment_actions'
    )
    actor_type = models.CharField(
        _('type d\'acteur'),
        max_length=20,
        choices=[
            ('patient', 'Patient'),
            ('admin', 'Admin'),
            ('system', 'Système')
        ]
    )
    
    # Données avant modification
    old_date = models.DateField(null=True, blank=True)
    old_time = models.TimeField(null=True, blank=True)
    old_consultation_type = models.CharField(max_length=20, blank=True)
    old_status = models.CharField(max_length=30, blank=True)
    
    # Données après modification
    new_date = models.DateField(null=True, blank=True)
    new_time = models.TimeField(null=True, blank=True)
    new_consultation_type = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=30, blank=True)
    
    # ✅ NOUVEAU : Stockage JSON de TOUS les changements
    changes_data = models.JSONField(
        _('données des changements'),
        default=dict,
        blank=True,
        help_text=_('Stocke tous les changements de champs sous forme JSON')
    )
    
    # Message associé
    message = models.TextField(_('message'), blank=True)
    reason = models.TextField(_('raison'), blank=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('historique rendez-vous')
        verbose_name_plural = _('historiques rendez-vous')
        indexes = [
            models.Index(fields=['appointment', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_action_type_display()} - {self.appointment} - {self.created_at}"


class AppointmentProposal(models.Model):
    """Proposition de modification de rendez-vous."""
    
    class ProposalType(models.TextChoices):
        ADMIN_TO_PATIENT = 'admin_to_patient', _('Admin vers Patient')
        PATIENT_TO_ADMIN = 'patient_to_admin', _('Patient vers Admin')
    
    class ProposalStatus(models.TextChoices):
        PENDING = 'pending', _('En attente')
        ACCEPTED = 'accepted', _('Acceptée')
        REJECTED = 'rejected', _('Refusée')
        EXPIRED = 'expired', _('Expirée')
    
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='proposals'
    )
    proposal_type = models.CharField(
        _('type de proposition'),
        max_length=20,
        choices=ProposalType.choices
    )
    status = models.CharField(
        _('statut'),
        max_length=20,
        choices=ProposalStatus.choices,
        default=ProposalStatus.PENDING
    )
    
    # Proposition
    proposed_date = models.DateField(_('date proposée'))
    proposed_time = models.TimeField(_('heure proposée'))
    proposed_consultation_type = models.CharField(
        _('type proposé'),
        max_length=20,
        blank=True
    )
    message = models.TextField(_('message'), blank=True)
    
    # Métadonnées
    proposed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_proposals'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    responded_at = models.DateTimeField(null=True, blank=True)
    response_message = models.TextField(_('message de réponse'), blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('proposition rendez-vous')
        verbose_name_plural = _('propositions rendez-vous')
        indexes = [
            models.Index(fields=['appointment', '-created_at']),
            models.Index(fields=['status', 'expires_at']),
        ]
    
    def __str__(self):
        return f"Proposition {self.get_proposal_type_display()} - {self.appointment}"
    
    def is_expired(self):
        """Vérifie si la proposition a expiré."""
        return timezone.now() > self.expires_at and self.status == 'pending'


class AppointmentRequest(models.Model):
    """Demande de rendez-vous sans compte utilisateur."""
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmé'),
        ('cancelled', 'Annulé'),
        ('completed', 'Terminé'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField("Prénom", max_length=100)
    last_name = models.CharField("Nom", max_length=100)
    email = models.EmailField("Email", null=True, blank=True)
    phone = models.CharField("Téléphone", max_length=20)
    access_code = models.CharField("Code d'accès", max_length=10, unique=True)
    preferred_date = models.DateField("Date préférée")
    preferred_time_slot = models.CharField("Créneau horaire", max_length=50)
    service = models.ForeignKey(
        MedicalService,
        on_delete=models.CASCADE,
        related_name='appointment_requests'
    )
    notes = models.TextField("Notes", null=True, blank=True)
    status = models.CharField(
        "Statut",
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    expires_at = models.DateTimeField("Expire le")
    created_at = models.DateTimeField("Créé le", auto_now_add=True)
    updated_at = models.DateTimeField("Modifié le", auto_now=True)
    
    class Meta:
        verbose_name = "Demande de rendez-vous"
        verbose_name_plural = "Demandes de rendez-vous"
        ordering = ['-created_at']
    
    def generate_access_code(self):
        """Génère un code d'accès unique de 6 caractères."""
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return code
    
    def save(self, *args, **kwargs):
        if not self.access_code:
            self.access_code = self.generate_access_code()
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=48)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        """Vérifie si le code a expiré."""
        return timezone.now() > self.expires_at
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.access_code}"
