from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
from apps.users.phone_validators import validate_congo_phone


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
    """Rendez-vous médical."""
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('En attente')
        CONFIRMED = 'confirmed', _('Confirmé')
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
    patient_email = models.EmailField(_('email'))
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
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    notes_patient = models.TextField(_('notes patient'), blank=True)
    notes_staff = models.TextField(_('notes internes'), blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(_('raison annulation'), blank=True)
    
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)

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
                condition=models.Q(status__in=['pending', 'confirmed']),
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
