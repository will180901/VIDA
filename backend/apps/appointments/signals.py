"""
Signals pour la traçabilité automatique des modifications de RDV.
"""
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Appointment, AppointmentHistory

User = get_user_model()

# Stockage temporaire des anciennes valeurs
_appointment_old_values = {}


@receiver(pre_save, sender=Appointment)
def capture_old_values(sender, instance, **kwargs):
    """
    Capture les valeurs avant modification pour comparaison.
    """
    if instance.pk:  # Seulement pour les mises à jour, pas les créations
        try:
            old_instance = Appointment.objects.get(pk=instance.pk)
            
            # Liste des champs à tracer
            tracked_fields = [
                'patient_first_name', 'patient_last_name', 'patient_email', 'patient_phone',
                'date', 'time', 'consultation_type', 'status',
                'reason', 'notes_patient', 'notes_staff',
                'admin_message', 'patient_message', 'rejection_reason', 'cancellation_reason',
                'proposed_date', 'proposed_time', 'proposed_consultation_type'
            ]
            
            # Stocker les anciennes valeurs
            old_values = {}
            for field in tracked_fields:
                value = getattr(old_instance, field, None)
                if value is not None:
                    # Convertir les dates/times en string pour JSON
                    if hasattr(value, 'isoformat'):
                        old_values[field] = value.isoformat()
                    else:
                        old_values[field] = str(value)
            
            # Stocker temporairement avec l'ID de l'instance
            _appointment_old_values[instance.pk] = old_values
            
        except Appointment.DoesNotExist:
            pass


@receiver(post_save, sender=Appointment)
def track_appointment_changes(sender, instance, created, **kwargs):
    """
    Enregistre automatiquement toutes les modifications dans l'historique.
    """
    # Ne pas tracer les créations (déjà géré ailleurs)
    if created:
        return
    
    # Récupérer les anciennes valeurs
    old_values = _appointment_old_values.get(instance.pk, {})
    
    if not old_values:
        return
    
    # Liste des champs à tracer
    tracked_fields = [
        'patient_first_name', 'patient_last_name', 'patient_email', 'patient_phone',
        'date', 'time', 'consultation_type', 'status',
        'reason', 'notes_patient', 'notes_staff',
        'admin_message', 'patient_message', 'rejection_reason', 'cancellation_reason',
        'proposed_date', 'proposed_time', 'proposed_consultation_type'
    ]
    
    # Détecter les changements
    changes_detected = {}
    new_values = {}
    
    for field in tracked_fields:
        new_value = getattr(instance, field, None)
        old_value_str = old_values.get(field)
        
        # Convertir la nouvelle valeur en string
        if new_value is not None:
            if hasattr(new_value, 'isoformat'):
                new_value_str = new_value.isoformat()
            else:
                new_value_str = str(new_value)
        else:
            new_value_str = None
        
        # Détecter les changements
        if old_value_str != new_value_str:
            changes_detected[field] = {
                'old': old_value_str,
                'new': new_value_str
            }
            new_values[field] = new_value_str
    
    # Créer l'entrée d'historique si des changements ont été détectés
    if changes_detected:
        # Déterminer l'acteur et le type d'acteur
        actor = instance.last_modified_by
        actor_type = 'system'
        
        if actor:
            if actor.role in ['admin', 'staff', 'doctor']:
                actor_type = 'admin'
            elif actor.role == 'patient':
                actor_type = 'patient'
        
        history_data = {
            'appointment': instance,
            'action_type': 'modified',
            'actor': actor,
            'actor_type': actor_type,
            'changes_data': changes_detected,
        }
        
        # Remplir les champs legacy pour compatibilité
        if 'date' in changes_detected:
            # Récupérer l'ancienne date depuis old_values
            if 'date' in old_values:
                from datetime import datetime
                try:
                    history_data['old_date'] = datetime.fromisoformat(old_values['date']).date()
                except:
                    history_data['old_date'] = None
            history_data['new_date'] = instance.date
        
        if 'time' in changes_detected:
            # Récupérer l'ancienne heure depuis old_values
            if 'time' in old_values:
                from datetime import datetime, time as dt_time
                try:
                    # Parser le format HH:MM:SS
                    time_parts = old_values['time'].split(':')
                    history_data['old_time'] = dt_time(
                        int(time_parts[0]), 
                        int(time_parts[1]), 
                        int(time_parts[2]) if len(time_parts) > 2 else 0
                    )
                except:
                    history_data['old_time'] = None
            history_data['new_time'] = instance.time
        
        if 'consultation_type' in changes_detected:
            history_data['old_consultation_type'] = old_values.get('consultation_type', '')
            history_data['new_consultation_type'] = new_values.get('consultation_type', '')
        
        if 'status' in changes_detected:
            history_data['old_status'] = old_values.get('status', '')
            history_data['new_status'] = new_values.get('status', '')
        
        AppointmentHistory.objects.create(**history_data)
    
    # Nettoyer le stockage temporaire
    if instance.pk in _appointment_old_values:
        del _appointment_old_values[instance.pk]


@receiver(post_save, sender=Appointment)
def create_patient_from_completed_appointment(sender, instance, created, **kwargs):
    """
    Crée un dossier patient automatiquement lors de la première consultation complétée.
    
    Un Patient est créé uniquement quand :
    1. L'appointment est de type 'consultation' (générale, spécialisée ou suivi)
    2. Le statut est 'completed'
    3. Aucun Patient n'existe déjà pour cet utilisateur (via email, téléphone ou user linked)
    """
    # Importer ici pour éviter les imports circulaires
    from apps.users.models import Patient
    from django.db.models import Q
    
    # Vérifier que c'est une consultation (types valides)
    valid_consultation_types = ['generale', 'specialisee', 'suivi']
    if instance.consultation_type not in valid_consultation_types:
        return
    
    # Vérifier que le statut est "completed"
    if instance.status != 'completed':
        return
    
    # Récupérer les informations du patient depuis l'appointment
    email = instance.patient_email or (instance.patient.email if instance.patient else None)
    phone = instance.patient_phone or (instance.patient.phone if instance.patient else None)
    
    # Vérifier si le patient existe déjà (via user linked, email ou téléphone)
    patient_exists = Patient.objects.filter(
        Q(user=instance.patient) |
        Q(email=email) |
        Q(phone=phone)
    ).exists()
    
    if patient_exists:
        return
    
    # Récupérer ou créer le User associé
    user = instance.patient
    if not user and email:
        # Chercher un user basé sur l'email
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(email=email).first()
    
    # Préparer les données
    first_name = instance.patient_first_name or (user.first_name if user else '')
    last_name = instance.patient_last_name or (user.last_name if user else '')
    phone = instance.patient_phone or (user.phone if user else '')
    email = instance.patient_email or (user.email if user else None)
    
    # Récupérer date_of_birth et gender depuis le user si disponibles
    date_of_birth = user.date_of_birth if user else None
    gender = user.gender if user else ''
    address = user.address if user else ''
    
    # Créer le patient
    patient = Patient.objects.create(
        user=user,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        email=email,
        date_of_birth=date_of_birth,
        gender=gender,
        address=address,
        first_consultation_date=instance.date,
    )
    
    # Optionnellement, mettre à jour l'appointment avec la référence au patient
    # Note: Cette ligne est optionnelle car le patient est déjà lié via user
    # instance.patient = patient.user
    # instance.save(update_fields=['patient'])


@receiver(post_save, sender=Appointment)
def link_appointment_to_medical_record(sender, instance, created, **kwargs):
    """
    Lie l'appointment au dossier médical et crée le dossier si nécessaire.
    """
    from apps.users.models import MedicalRecord, Patient
    from django.db.models import Q
    from django.utils import timezone
    
    # Skip if not a consultation or not completed
    if instance.appointment_type not in ['generale', 'specialisee', 'suivi']:
        return
    
    if instance.status != 'completed':
        return
    
    # Get or create patient
    patient = Patient.objects.filter(
        Q(user=instance.patient) |
        Q(email=instance.patient_email) |
        Q(phone=instance.patient_phone)
    ).first()
    
    if not patient:
        return
    
    # Get or create medical record
    medical_record, record_created = MedicalRecord.objects.get_or_create(
        patient=patient,
        defaults={
            'created_by': instance.last_modified_by,
            'consultation_date': instance.date,
        }
    )
    
    # Link appointment to medical record
    if instance.medical_record != medical_record:
        instance.medical_record = medical_record
        instance.save(update_fields=['medical_record'])
