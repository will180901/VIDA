"""
Signals pour la création automatique de notifications

Ce module écoute les événements sur les rendez-vous et crée automatiquement
des notifications pour les admins et patients.

Événements écoutés :
- Nouveau RDV → Notification admin
- RDV confirmé → Notification patient
- RDV refusé → Notification patient
- RDV annulé → Notification admin + patient
- RDV modifié → Notification admin + patient
- Contre-proposition → Notification patient
- Proposition acceptée → Notification admin
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.appointments.models import Appointment
from .models import Notification

User = get_user_model()


def get_admin_users():
    """Retourner tous les utilisateurs admin"""
    return User.objects.filter(is_staff=True, is_active=True)


def notify_admins(notification_type, title, message, action_url='', related_appointment=None):
    """
    Créer une notification pour tous les admins
    
    Args:
        notification_type: Type de notification
        title: Titre de la notification
        message: Message détaillé
        action_url: URL de redirection
        related_appointment: Rendez-vous lié
    """
    admins = get_admin_users()
    
    for admin in admins:
        Notification.create_notification(
            user=admin,
            notification_type=notification_type,
            title=title,
            message=message,
            action_url=action_url,
            related_appointment=related_appointment
        )


def notify_patient(patient, notification_type, title, message, action_url='', related_appointment=None):
    """
    Créer une notification pour un patient
    
    Args:
        patient: Utilisateur patient
        notification_type: Type de notification
        title: Titre de la notification
        message: Message détaillé
        action_url: URL de redirection
        related_appointment: Rendez-vous lié
    """
    if patient and patient.is_active:
        Notification.create_notification(
            user=patient,
            notification_type=notification_type,
            title=title,
            message=message,
            action_url=action_url,
            related_appointment=related_appointment
        )


@receiver(post_save, sender=Appointment)
def appointment_post_save_notification(sender, instance, created, **kwargs):
    """
    Signal déclenché après la sauvegarde d'un rendez-vous
    
    Crée des notifications selon le statut du RDV :
    - Nouveau RDV (pending) → Notification admin
    - RDV confirmé → Notification patient
    - RDV refusé → Notification patient
    - RDV annulé → Notification admin + patient
    """
    
    # 1. NOUVEAU RENDEZ-VOUS (créé par le patient)
    if created and instance.status == 'pending':
        notify_admins(
            notification_type='new_appointment',
            title='Nouveau rendez-vous',
            message=f'{instance.patient_first_name} {instance.patient_last_name} a demandé un rendez-vous le {instance.date.strftime("%d/%m/%Y")} à {instance.time}.',
            action_url=f'/admin/appointments/{instance.id}',
            related_appointment=instance
        )
    
    # 2. RENDEZ-VOUS CONFIRMÉ (par l'admin)
    elif not created and instance.status == 'confirmed':
        # Vérifier si le statut vient de changer
        old_instance = Appointment.objects.filter(pk=instance.pk).first()
        if old_instance and old_instance.status != 'confirmed':
            # Notifier le patient si il a un compte
            if instance.patient:
                notify_patient(
                    patient=instance.patient,
                    notification_type='appointment_confirmed',
                    title='Rendez-vous confirmé',
                    message=f'Votre rendez-vous du {instance.date.strftime("%d/%m/%Y")} à {instance.time} a été confirmé.',
                    action_url=f'/patient/appointments/{instance.id}',
                    related_appointment=instance
                )
    
    # 3. RENDEZ-VOUS REFUSÉ (par l'admin)
    elif not created and instance.status == 'rejected':
        # Notifier le patient si il a un compte
        if instance.patient:
            notify_patient(
                patient=instance.patient,
                notification_type='appointment_rejected',
                title='Rendez-vous refusé',
                message=f'Votre demande de rendez-vous du {instance.date.strftime("%d/%m/%Y")} à {instance.time} a été refusée. Raison : {instance.rejection_reason or "Non spécifiée"}',
                action_url=f'/patient/appointments/{instance.id}',
                related_appointment=instance
            )
    
    # 4. RENDEZ-VOUS ANNULÉ
    elif not created and instance.status == 'cancelled':
        # Notifier l'admin
        notify_admins(
            notification_type='appointment_cancelled',
            title='Rendez-vous annulé',
            message=f'Le rendez-vous de {instance.patient_first_name} {instance.patient_last_name} du {instance.date.strftime("%d/%m/%Y")} à {instance.time} a été annulé.',
            action_url=f'/admin/appointments/{instance.id}',
            related_appointment=instance
        )
        
        # Notifier le patient si il a un compte
        if instance.patient:
            notify_patient(
                patient=instance.patient,
                notification_type='appointment_cancelled',
                title='Rendez-vous annulé',
                message=f'Votre rendez-vous du {instance.date.strftime("%d/%m/%Y")} à {instance.time} a été annulé.',
                action_url=f'/patient/appointments/{instance.id}',
                related_appointment=instance
            )
    
    # 5. CONTRE-PROPOSITION (admin propose une alternative)
    elif not created and instance.status == 'awaiting_patient_response':
        # Notifier le patient si il a un compte
        if instance.patient:
            notify_patient(
                patient=instance.patient,
                notification_type='counter_proposal',
                title='Nouvelle proposition de rendez-vous',
                message=f'L\'administrateur vous propose un nouveau créneau : {instance.proposed_date.strftime("%d/%m/%Y")} à {instance.proposed_time}.',
                action_url=f'/patient/appointments/{instance.id}',
                related_appointment=instance
            )
    
    # 6. PROPOSITION ACCEPTÉE (patient accepte la contre-proposition)
    elif not created and instance.status == 'confirmed' and instance.proposed_date:
        # Notifier l'admin
        notify_admins(
            notification_type='proposal_accepted',
            title='Proposition acceptée',
            message=f'{instance.patient_first_name} {instance.patient_last_name} a accepté votre proposition de rendez-vous du {instance.date.strftime("%d/%m/%Y")} à {instance.time}.',
            action_url=f'/admin/appointments/{instance.id}',
            related_appointment=instance
        )
    
    # 7. PROPOSITION REJETÉE (patient rejette la contre-proposition)
    elif not created and instance.status == 'rejected' and instance.proposed_date:
        # Notifier l'admin
        notify_admins(
            notification_type='proposal_rejected',
            title='Proposition rejetée',
            message=f'{instance.patient_first_name} {instance.patient_last_name} a rejeté votre proposition de rendez-vous.',
            action_url=f'/admin/appointments/{instance.id}',
            related_appointment=instance
        )
    
    # 8. MODIFICATION DE RENDEZ-VOUS (patient modifie son RDV)
    elif not created and instance.status == 'modification_pending':
        # Notifier l'admin
        notify_admins(
            notification_type='appointment_modified',
            title='Demande de modification',
            message=f'{instance.patient_first_name} {instance.patient_last_name} a demandé une modification de son rendez-vous.',
            action_url=f'/admin/appointments/{instance.id}',
            related_appointment=instance
        )


# Signal pour détecter les changements de date/heure (modification admin)
@receiver(pre_save, sender=Appointment)
def appointment_pre_save_notification(sender, instance, **kwargs):
    """
    Signal déclenché AVANT la sauvegarde d'un rendez-vous
    
    Détecte les modifications de date/heure par l'admin et notifie le patient
    """
    
    # Ignorer si c'est une création
    if instance.pk is None:
        return
    
    try:
        # Récupérer l'ancienne version
        old_instance = Appointment.objects.get(pk=instance.pk)
        
        # Vérifier si la date ou l'heure a changé
        date_changed = old_instance.date != instance.date
        time_changed = old_instance.time != instance.time
        
        # Si modification par l'admin (pas de changement de statut vers modification_pending)
        if (date_changed or time_changed) and instance.status != 'modification_pending':
            # Notifier le patient si il a un compte
            if instance.patient:
                notify_patient(
                    patient=instance.patient,
                    notification_type='appointment_modified',
                    title='Rendez-vous modifié',
                    message=f'Votre rendez-vous a été modifié. Nouvelle date : {instance.date.strftime("%d/%m/%Y")} à {instance.time}.',
                    action_url=f'/patient/appointments/{instance.id}',
                    related_appointment=instance
                )
    
    except Appointment.DoesNotExist:
        # L'instance n'existe pas encore (création)
        pass
