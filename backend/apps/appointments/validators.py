"""
Fonctions de validation pour les rendez-vous.
"""
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment


def validate_appointment_slot(date, time, exclude_appointment_id=None):
    """
    Valide qu'un créneau est disponible.
    
    Args:
        date: Date du créneau
        time: Heure du créneau
        exclude_appointment_id: ID du RDV à exclure de la vérification (pour modifications)
    
    Returns:
        True si le créneau est disponible
    
    Raises:
        ValidationError: Si le créneau n'est pas disponible
    """
    # Vérifier que le créneau n'est pas déjà pris
    existing = Appointment.objects.filter(
        date=date,
        time=time,
        status__in=[
            'pending', 
            'confirmed', 
            'awaiting_patient_response',
            'awaiting_admin_response',
            'modification_pending'
        ]
    )
    
    if exclude_appointment_id:
        existing = existing.exclude(id=exclude_appointment_id)
    
    if existing.exists():
        raise ValidationError("Ce créneau n'est plus disponible")
    
    # Vérifier que le créneau est dans le futur
    appointment_datetime = timezone.make_aware(
        datetime.combine(date, time)
    )
    if appointment_datetime <= timezone.now():
        raise ValidationError("Le créneau doit être dans le futur")
    
    # Vérifier que le créneau est dans les horaires d'ouverture (8h-18h)
    if time.hour < 8 or time.hour >= 18:
        raise ValidationError("Le créneau doit être entre 8h00 et 18h00")
    
    return True


def validate_24h_delay(appointment):
    """
    Valide que le délai de 24h est respecté pour modification/annulation.
    
    Args:
        appointment: Instance du RDV à vérifier
    
    Returns:
        True si le délai est respecté
    
    Raises:
        ValidationError: Si le délai n'est pas respecté
    """
    appointment_datetime = timezone.make_aware(
        datetime.combine(appointment.date, appointment.time)
    )
    now = timezone.now()
    time_until_appointment = appointment_datetime - now
    
    if time_until_appointment <= timedelta(hours=24):
        raise ValidationError(
            "Impossible de modifier/annuler moins de 24h avant le rendez-vous. "
            "Veuillez contacter la clinique au 06 XXX XX XX."
        )
    
    return True


def validate_appointment_status_transition(current_status, new_status, actor_type):
    """
    Valide qu'une transition de statut est autorisée.
    
    Args:
        current_status: Statut actuel du RDV
        new_status: Nouveau statut demandé
        actor_type: Type d'acteur (patient/admin/system)
    
    Returns:
        True si la transition est autorisée
    
    Raises:
        ValidationError: Si la transition n'est pas autorisée
    """
    # Définir les transitions autorisées
    allowed_transitions = {
        'patient': {
            'pending': ['cancelled'],  # Patient peut annuler sa demande
            'confirmed': ['modification_pending', 'cancelled'],  # Patient peut modifier/annuler
            'awaiting_patient_response': ['confirmed', 'rejected_by_patient', 'awaiting_admin_response'],
            'modification_pending': ['cancelled'],
        },
        'admin': {
            'pending': ['confirmed', 'rejected', 'awaiting_patient_response'],
            'awaiting_admin_response': ['confirmed', 'rejected', 'awaiting_patient_response'],
            'modification_pending': ['confirmed', 'rejected'],
            'confirmed': ['cancelled', 'completed', 'no_show'],
        },
        'system': {
            # Le système peut faire toutes les transitions
            'pending': ['confirmed', 'rejected', 'cancelled', 'awaiting_patient_response'],
            'confirmed': ['completed', 'no_show', 'cancelled'],
            'awaiting_patient_response': ['confirmed', 'rejected_by_patient', 'cancelled'],
            'awaiting_admin_response': ['confirmed', 'rejected', 'cancelled'],
            'modification_pending': ['confirmed', 'rejected', 'cancelled'],
        }
    }
    
    # Vérifier si la transition est autorisée
    if actor_type not in allowed_transitions:
        raise ValidationError(f"Type d'acteur invalide: {actor_type}")
    
    if current_status not in allowed_transitions[actor_type]:
        raise ValidationError(
            f"Le statut '{current_status}' ne peut pas être modifié par {actor_type}"
        )
    
    if new_status not in allowed_transitions[actor_type][current_status]:
        raise ValidationError(
            f"Transition de '{current_status}' vers '{new_status}' non autorisée pour {actor_type}"
        )
    
    return True
