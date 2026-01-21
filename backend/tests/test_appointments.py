"""
Tests de gestion des rendez-vous
"""
import pytest
from datetime import datetime, timedelta, time as dt_time
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from apps.appointments.models import Appointment, AppointmentSlotLock
from apps.content_management.models import ClinicSchedule

User = get_user_model()


class AppointmentTestCase(TestCase):
    """Tests de création et gestion des rendez-vous"""
    
    def setUp(self):
        self.client = APIClient()
        self.appointments_url = reverse('appointment-list')
        
        # Créer un utilisateur
        self.user = User.objects.create_user(
            email='patient@example.com',
            password='TestPassword123!',
            first_name='Patient',
            last_name='Test'
        )
        
        # Créer un horaire de clinique (Lundi ouvert)
        ClinicSchedule.objects.create(
            day_of_week=0,  # Lundi
            is_open=True,
            morning_start=dt_time(8, 0),
            morning_end=dt_time(12, 0),
            afternoon_start=dt_time(14, 0),
            afternoon_end=dt_time(18, 0),
            slot_duration=30
        )
        
        # Date future pour les tests (prochain lundi)
        today = timezone.now().date()
        days_ahead = 0 - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        self.future_date = today + timedelta(days=days_ahead)
    
    def test_create_appointment_anonymous(self):
        """Test création de RDV par utilisateur anonyme"""
        data = {
            'patient_first_name': 'Jean',
            'patient_last_name': 'Dupont',
            'patient_email': 'jean.dupont@example.com',
            'patient_phone': '06 123 45 67',
            'date': self.future_date.isoformat(),
            'time': '10:00',
            'consultation_type': 'generale',
            'reason': 'Contrôle de routine'
        }
        
        response = self.client.post(self.appointments_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Appointment.objects.filter(patient_email='jean.dupont@example.com').exists())
    
    def test_create_appointment_authenticated(self):
        """Test création de RDV par utilisateur authentifié"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'patient_first_name': 'Patient',
            'patient_last_name': 'Test',
            'patient_email': 'patient@example.com',
            'patient_phone': '06 123 45 67',
            'date': self.future_date.isoformat(),
            'time': '10:00',
            'consultation_type': 'generale',
            'reason': 'Contrôle de routine'
        }
        
        response = self.client.post(self.appointments_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        appointment = Appointment.objects.get(id=response.data['id'])
        self.assertEqual(appointment.patient, self.user)
    
    def test_create_appointment_past_date(self):
        """Test création de RDV avec date passée"""
        past_date = timezone.now().date() - timedelta(days=1)
        
        data = {
            'patient_first_name': 'Jean',
            'patient_last_name': 'Dupont',
            'patient_email': 'jean.dupont@example.com',
            'patient_phone': '06 123 45 67',
            'date': past_date.isoformat(),
            'time': '10:00',
            'consultation_type': 'generale',
            'reason': 'Test'
        }
        
        response = self.client.post(self.appointments_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_appointment_duplicate_slot(self):
        """Test création de RDV sur créneau déjà réservé"""
        # Créer un premier RDV
        Appointment.objects.create(
            patient_first_name='Existing',
            patient_last_name='Patient',
            patient_email='existing@example.com',
            patient_phone='06 111 11 11',
            date=self.future_date,
            time=dt_time(10, 0),
            consultation_type='generale',
            status='confirmed'
        )
        
        # Essayer de créer un second RDV sur le même créneau
        data = {
            'patient_first_name': 'Jean',
            'patient_last_name': 'Dupont',
            'patient_email': 'jean.dupont@example.com',
            'patient_phone': '06 123 45 67',
            'date': self.future_date.isoformat(),
            'time': '10:00',
            'consultation_type': 'generale',
            'reason': 'Test'
        }
        
        response = self.client.post(self.appointments_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_cancel_appointment(self):
        """Test annulation de RDV"""
        self.client.force_authenticate(user=self.user)
        
        # Créer un RDV
        appointment = Appointment.objects.create(
            patient=self.user,
            patient_first_name='Patient',
            patient_last_name='Test',
            patient_email='patient@example.com',
            patient_phone='06 123 45 67',
            date=self.future_date,
            time=dt_time(10, 0),
            consultation_type='generale',
            status='confirmed'
        )
        
        cancel_url = reverse('appointment-cancel', kwargs={'pk': appointment.id})
        response = self.client.post(cancel_url, {'reason': 'Empêchement'}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, 'cancelled')
    
    def test_list_appointments_patient(self):
        """Test liste des RDV pour un patient"""
        self.client.force_authenticate(user=self.user)
        
        # Créer des RDV pour ce patient
        Appointment.objects.create(
            patient=self.user,
            patient_first_name='Patient',
            patient_last_name='Test',
            patient_email='patient@example.com',
            patient_phone='06 123 45 67',
            date=self.future_date,
            time=dt_time(10, 0),
            consultation_type='generale',
            status='confirmed'
        )
        
        # Créer un RDV pour un autre patient
        Appointment.objects.create(
            patient_first_name='Other',
            patient_last_name='Patient',
            patient_email='other@example.com',
            patient_phone='06 999 99 99',
            date=self.future_date,
            time=dt_time(11, 0),
            consultation_type='generale',
            status='confirmed'
        )
        
        response = self.client.get(self.appointments_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Le patient ne doit voir que ses propres RDV
        self.assertEqual(len(response.data['results']), 1)


class AvailableSlotsTestCase(TestCase):
    """Tests de récupération des créneaux disponibles"""
    
    def setUp(self):
        self.client = APIClient()
        self.slots_url = reverse('available-slots')
        
        # Créer un horaire de clinique (Lundi ouvert)
        ClinicSchedule.objects.create(
            day_of_week=0,  # Lundi
            is_open=True,
            morning_start=dt_time(8, 0),
            morning_end=dt_time(10, 0),
            afternoon_start=dt_time(14, 0),
            afternoon_end=dt_time(16, 0),
            slot_duration=30
        )
        
        # Date future (prochain lundi)
        today = timezone.now().date()
        days_ahead = 0 - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        self.future_date = today + timedelta(days=days_ahead)
    
    def test_get_available_slots(self):
        """Test récupération des créneaux disponibles"""
        response = self.client.get(self.slots_url, {'date': self.future_date.isoformat()})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('slots', response.data)
        # Doit avoir 4 créneaux matin (8h, 8h30, 9h, 9h30) + 4 après-midi (14h, 14h30, 15h, 15h30)
        self.assertEqual(len(response.data['slots']), 8)
    
    def test_get_slots_with_booked_appointment(self):
        """Test créneaux avec RDV déjà réservé"""
        # Créer un RDV
        Appointment.objects.create(
            patient_first_name='Test',
            patient_last_name='Patient',
            patient_email='test@example.com',
            patient_phone='06 123 45 67',
            date=self.future_date,
            time=dt_time(8, 0),
            consultation_type='generale',
            status='confirmed'
        )
        
        response = self.client.get(self.slots_url, {'date': self.future_date.isoformat()})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Le créneau 8h ne doit pas être disponible
        self.assertNotIn('08:00', response.data['slots'])
        self.assertEqual(len(response.data['slots']), 7)
    
    def test_get_slots_without_date(self):
        """Test récupération sans date"""
        response = self.client.get(self.slots_url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SlotLockTestCase(TestCase):
    """Tests de verrouillage de créneaux"""
    
    def setUp(self):
        self.client = APIClient()
        self.lock_url = reverse('lock-slot')
        
        # Date future
        self.future_date = timezone.now().date() + timedelta(days=7)
    
    def test_lock_slot_success(self):
        """Test verrouillage de créneau réussi"""
        data = {
            'date': self.future_date.isoformat(),
            'time': '10:00'
        }
        
        response = self.client.post(self.lock_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('expires_at', response.data)
        self.assertTrue(AppointmentSlotLock.objects.filter(
            date=self.future_date,
            time=dt_time(10, 0)
        ).exists())
    
    def test_lock_slot_already_locked(self):
        """Test verrouillage d'un créneau déjà verrouillé"""
        # Créer un lock existant
        AppointmentSlotLock.objects.create(
            date=self.future_date,
            time=dt_time(10, 0),
            locked_by='other_user',
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        data = {
            'date': self.future_date.isoformat(),
            'time': '10:00'
        }
        
        response = self.client.post(self.lock_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
    
    def test_unlock_slot(self):
        """Test déverrouillage de créneau"""
        # Créer un lock
        data = {
            'date': self.future_date.isoformat(),
            'time': '10:00'
        }
        self.client.post(self.lock_url, data, format='json')
        
        # Déverrouiller
        response = self.client.delete(self.lock_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
