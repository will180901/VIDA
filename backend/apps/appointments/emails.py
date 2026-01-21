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



# ============================================================================
# NOUVELLES FONCTIONS POUR WORKFLOW BIDIRECTIONNEL
# ============================================================================

def send_proposal_email(appointment):
    """
    Envoie un email de proposition d'alternative au patient
    
    Args:
        appointment: Instance Appointment avec proposed_date et proposed_time
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # Contexte pour le template
        context = {
            'appointment': appointment,
            'site_name': 'VIDA',
            'frontend_url': settings.FRONTEND_URL,
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/appointment_proposal.html', context)
        plain_message = strip_tags(html_message)
        
        # Envoyer l'email
        send_mail(
            subject=f'Proposition de rendez-vous - VIDA',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de proposition envoyé à {appointment.patient_email}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email proposition: {e}")
        return False


def send_counter_proposal_email(appointment):
    """
    Envoie un email à l'admin quand le patient contre-propose
    
    Args:
        appointment: Instance Appointment avec proposed_date et proposed_time
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # Contexte pour le template
        context = {
            'appointment': appointment,
            'site_name': 'VIDA',
            'admin_url': settings.FRONTEND_URL,
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/appointment_counter_proposal.html', context)
        plain_message = strip_tags(html_message)
        
        # Email de la clinique pour notifications admin
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'centremedvida@gmail.com')
        
        # Envoyer l'email
        send_mail(
            subject=f'Contre-proposition de {appointment.patient_full_name}',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de contre-proposition envoyé à l'admin pour RDV {appointment.id}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email contre-proposition: {e}")
        return False


def send_modification_request_email(appointment):
    """
    Envoie un email à l'admin quand le patient demande une modification
    
    Args:
        appointment: Instance Appointment avec proposed_date et proposed_time
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # Contexte pour le template
        context = {
            'appointment': appointment,
            'site_name': 'VIDA',
            'admin_url': settings.FRONTEND_URL,
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/appointment_modification_request.html', context)
        plain_message = strip_tags(html_message)
        
        # Email de la clinique pour notifications admin
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'centremedvida@gmail.com')
        
        # Envoyer l'email
        send_mail(
            subject=f'Demande de modification - {appointment.patient_full_name}',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de demande de modification envoyé à l'admin pour RDV {appointment.id}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email demande modification: {e}")
        return False


def send_rejection_email(appointment):
    """
    Envoie un email de refus au patient
    
    Args:
        appointment: Instance Appointment avec rejection_reason
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # Contexte pour le template
        context = {
            'appointment': appointment,
            'site_name': 'VIDA',
            'frontend_url': settings.FRONTEND_URL,
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/appointment_rejected.html', context)
        plain_message = strip_tags(html_message)
        
        # Envoyer l'email
        send_mail(
            subject=f'Rendez-vous refusé - VIDA',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de refus envoyé à {appointment.patient_email}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email refus: {e}")
        return False


def send_rejection_by_patient_email(appointment):
    """
    Envoie un email à l'admin quand le patient refuse une proposition
    
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
            'admin_url': settings.FRONTEND_URL,
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/appointment_rejected_by_patient.html', context)
        plain_message = strip_tags(html_message)
        
        # Email de la clinique pour notifications admin
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'centremedvida@gmail.com')
        
        # Envoyer l'email
        send_mail(
            subject=f'Proposition refusée - {appointment.patient_full_name}',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de refus patient envoyé à l'admin pour RDV {appointment.id}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email refus patient: {e}")
        return False


def send_proposal_accepted_email(appointment):
    """
    Envoie un email à l'admin quand le patient accepte une proposition
    
    Args:
        appointment: Instance Appointment
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # Réutiliser le template de confirmation mais pour l'admin
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'centremedvida@gmail.com')
        
        # Envoyer un email simple à l'admin
        message = f"""
        Le patient {appointment.patient_full_name} a accepté la proposition de rendez-vous.
        
        Nouveau rendez-vous confirmé :
        - Date : {appointment.date.strftime("%d/%m/%Y")}
        - Heure : {appointment.time.strftime("%H:%M")}
        - Type : {appointment.get_consultation_type_display()}
        
        Patient : {appointment.patient_full_name}
        Email : {appointment.patient_email}
        Téléphone : {appointment.patient_phone}
        """
        
        send_mail(
            subject=f'Proposition acceptée - {appointment.patient_full_name}',
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            fail_silently=False,
        )
        
        logger.info(f"Email d'acceptation envoyé à l'admin pour RDV {appointment.id}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email acceptation: {e}")
        return False
