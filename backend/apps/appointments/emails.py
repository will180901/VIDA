"""
Gestion des emails pour les rendez-vous
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_appointment_confirmation(appointment):
    """
    Envoie un email de confirmation de rendez-vous
    
    Args:
        appointment: Instance Appointment
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # Contexte pour le template
        context = {
            'appointment': appointment,
            'site_name': 'VIDA',
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/appointment_confirmation.html', context)
        plain_message = strip_tags(html_message)
        
        # Envoyer l'email
        send_mail(
            subject=f'Confirmation de rendez-vous - {appointment.date.strftime("%d/%m/%Y")}',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de confirmation RDV envoyé à {appointment.patient_email}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email confirmation RDV: {e}")
        return False


def send_appointment_reminder(appointment):
    """
    Envoie un rappel de rendez-vous (J-1)
    
    Args:
        appointment: Instance Appointment
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # Contexte pour le template
        context = {
            'appointment': appointment,
            'site_name': 'VIDA',
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/appointment_reminder.html', context)
        plain_message = strip_tags(html_message)
        
        # Envoyer l'email
        send_mail(
            subject=f'Rappel : Rendez-vous demain à {appointment.time.strftime("%H:%M")}',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de rappel RDV envoyé à {appointment.patient_email}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email rappel RDV: {e}")
        return False


def send_appointment_cancellation(appointment, reason=''):
    """
    Envoie un email d'annulation de rendez-vous
    
    Args:
        appointment: Instance Appointment
        reason: Raison de l'annulation
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # Contexte pour le template
        context = {
            'appointment': appointment,
            'reason': reason,
            'site_name': 'VIDA',
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/appointment_cancellation.html', context)
        plain_message = strip_tags(html_message)
        
        # Envoyer l'email
        send_mail(
            subject=f'Annulation de rendez-vous - {appointment.date.strftime("%d/%m/%Y")}',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email d'annulation RDV envoyé à {appointment.patient_email}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email annulation RDV: {e}")
        return False
