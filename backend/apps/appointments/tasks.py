"""
Tâches Celery pour l'app appointments
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def cleanup_expired_slot_locks():
    """
    Nettoie les verrouillages de créneaux expirés
    Exécuté toutes les 15 minutes
    """
    from .models import AppointmentSlotLock
    
    now = timezone.now()
    
    # Supprimer les locks expirés
    deleted_count = AppointmentSlotLock.objects.filter(
        expires_at__lt=now
    ).delete()[0]
    
    if deleted_count > 0:
        logger.info(f"Nettoyage locks: {deleted_count} verrouillages expirés supprimés")
    
    return {'locks_deleted': deleted_count}


@shared_task
def send_appointment_reminders():
    """
    Envoie des rappels pour les RDV du lendemain
    Exécuté quotidiennement à 18h
    """
    from .models import Appointment
    from .emails import send_appointment_reminder
    
    # RDV de demain
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    appointments = Appointment.objects.filter(
        date=tomorrow,
        status__in=['pending', 'confirmed'],
        reminder_sent=False
    ).select_related('patient')
    
    sent_count = 0
    error_count = 0
    
    for appointment in appointments:
        try:
            # Envoyer email de rappel
            if send_appointment_reminder(appointment):
                appointment.reminder_sent = True
                appointment.reminder_sent_at = timezone.now()
                appointment.save(update_fields=['reminder_sent', 'reminder_sent_at'])
                sent_count += 1
            else:
                error_count += 1
        except Exception as e:
            logger.error(f"Erreur envoi rappel RDV {appointment.id}: {e}")
            error_count += 1
    
    logger.info(f"Rappels RDV: {sent_count} envoyés, {error_count} erreurs")
    
    return {
        'reminders_sent': sent_count,
        'errors': error_count
    }


@shared_task
def mark_past_appointments_completed():
    """
    Marque automatiquement les RDV passés comme terminés
    Exécuté quotidiennement à minuit
    """
    from .models import Appointment
    
    yesterday = timezone.now().date() - timedelta(days=1)
    
    # Marquer les RDV confirmés du passé comme terminés
    updated_count = Appointment.objects.filter(
        date__lte=yesterday,
        status='confirmed'
    ).update(status='completed')
    
    # Marquer les RDV en attente du passé comme no-show
    noshow_count = Appointment.objects.filter(
        date__lte=yesterday,
        status='pending'
    ).update(status='no_show')
    
    logger.info(
        f"Mise à jour RDV passés: {updated_count} terminés, {noshow_count} no-show"
    )
    
    return {
        'completed': updated_count,
        'no_show': noshow_count
    }
