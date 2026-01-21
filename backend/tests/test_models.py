"""
Tests des modèles
"""
import pytest
from datetime import datetime, timedelta, time as dt_time
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError

from apps.appointments.models import Appointment, AppointmentSlotLock
from apps.content_management.models import ClinicSchedule, ClinicHoliday, ContactMessage

User = get_user_model()


class UserModelTestCase(TestCase):
    """Tests du modèle User"""
    
    def test_create_user(self):
        """Test création d'utilisateur"""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
        
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('TestPassword123!'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
    
    def test_create_superuser(self):
        """Test création de superutilisateur"""
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='AdminPassword123!',
            first_name='Admin',
            last_name='User'
        )
        
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
    
    def test_user_email_normalization(self):
        """Test normalisation de l'email"""
        user = User.objects.create_user(
            email='Test@EXAMPLE.COM',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
        
        self.assertEqual(user.email, 'Test@example.com')
    
    def test_user_get_full_name(self):
        """Test méthode get_full_name"""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Jean',
            last_name='Dupont'
        )
        
        self.assertEqual(user.get_full_name(), 'Jean Dupont')
    
    def test_user_str_representation(self):
        """Test représentation string"""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
        
        self.assertEqual(str(user), 'test@example.com')


class AppointmentModelTestCase(TestCase):
    """Tests du modèle Appointment"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='patient@example.com',
            password='TestPassword123!',
            first_name='Patient',
            last_name='Test'
        )
        
        self.future_date = timezone.now().date() + timedelta(days=7)
    
    def test_create_appointment(self):
        """Test création de rendez-vous"""
        appointment = Appointment.objects.create(
            patient=self.user,
            patient_first_name='Patient',
            patient_last_name='Test',
            patient_email='patient@example.com',
            patient_phone='06 123 45 67',
            date=self.future_date,
            time=dt_time(10, 0),
            consultation_type='generale',
            reason='Contrôle de routine'
        )
        
        self.assertEqual(appointment.status, 'pending')
        self.assertIsNone(appointment.confirmed_at)
    
    def test_appointment_patient_full_name(self):
        """Test propriété patient_full_name"""
        appointment = Appointment.objects.create(
            patient_first_name='Jean',
            patient_last_name='Dupont',
            patient_email='jean.dupont@example.com',
            patient_phone='06 123 45 67',
            date=self.future_date,
            time=dt_time(10, 0),
            consultation_type='generale'
        )
        
        self.assertEqual(appointment.patient_full_name, 'Jean Dupont')
    
    def test_appointment_is_upcoming(self):
        """Test propriété is_upcoming"""
        # RDV futur
        future_appointment = Appointment.objects.create(
            patient_first_name='Test',
            patient_last_name='User',
            patient_email='test@example.com',
            patient_phone='06 123 45 67',
            date=self.future_date,
            time=dt_time(10, 0),
            consultation_type='generale',
            status='confirmed'
        )
        
        self.assertTrue(future_appointment.is_upcoming)
        
        # RDV passé
        past_date = timezone.now().date() - timedelta(days=7)
        past_appointment = Appointment.objects.create(
            patient_first_name='Test',
            patient_last_name='User',
            patient_email='test@example.com',
            patient_phone='06 123 45 67',
            date=past_date,
            time=dt_time(10, 0),
            consultation_type='generale',
            status='completed'
        )
        
        self.assertFalse(past_appointment.is_upcoming)
    
    def test_appointment_str_representation(self):
        """Test représentation string"""
        appointment = Appointment.objects.create(
            patient_first_name='Jean',
            patient_last_name='Dupont',
            patient_email='jean.dupont@example.com',
            patient_phone='06 123 45 67',
            date=self.future_date,
            time=dt_time(10, 0),
            consultation_type='generale'
        )
        
        expected = f"Jean Dupont - {self.future_date} 10:00"
        self.assertEqual(str(appointment), expected)


class AppointmentSlotLockTestCase(TestCase):
    """Tests du modèle AppointmentSlotLock"""
    
    def setUp(self):
        self.future_date = timezone.now().date() + timedelta(days=7)
    
    def test_create_slot_lock(self):
        """Test création de verrouillage"""
        lock = AppointmentSlotLock.objects.create(
            date=self.future_date,
            time=dt_time(10, 0),
            locked_by='user_123',
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        self.assertEqual(lock.date, self.future_date)
        self.assertEqual(lock.time, dt_time(10, 0))
    
    def test_slot_lock_is_expired(self):
        """Test vérification d'expiration"""
        # Lock expiré
        expired_lock = AppointmentSlotLock.objects.create(
            date=self.future_date,
            time=dt_time(10, 0),
            locked_by='user_123',
            expires_at=timezone.now() - timedelta(minutes=1)
        )
        
        self.assertTrue(expired_lock.is_expired)
        
        # Lock valide
        valid_lock = AppointmentSlotLock.objects.create(
            date=self.future_date,
            time=dt_time(11, 0),
            locked_by='user_456',
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        self.assertFalse(valid_lock.is_expired)


class ClinicScheduleTestCase(TestCase):
    """Tests du modèle ClinicSchedule"""
    
    def test_create_schedule(self):
        """Test création d'horaire"""
        schedule = ClinicSchedule.objects.create(
            day_of_week=0,  # Lundi
            is_open=True,
            morning_start=dt_time(8, 0),
            morning_end=dt_time(12, 0),
            afternoon_start=dt_time(14, 0),
            afternoon_end=dt_time(18, 0),
            slot_duration=30
        )
        
        self.assertEqual(schedule.day_of_week, 0)
        self.assertTrue(schedule.is_open)
    
    def test_schedule_str_representation(self):
        """Test représentation string"""
        schedule = ClinicSchedule.objects.create(
            day_of_week=0,
            is_open=True,
            morning_start=dt_time(8, 0),
            morning_end=dt_time(12, 0),
            slot_duration=30
        )
        
        self.assertIn('Lundi', str(schedule))


class ContactMessageTestCase(TestCase):
    """Tests du modèle ContactMessage"""
    
    def test_create_contact_message(self):
        """Test création de message de contact"""
        message = ContactMessage.objects.create(
            name='Jean Dupont',
            email='jean.dupont@example.com',
            phone='06 123 45 67',
            subject='Demande de renseignements',
            message='Bonjour, je souhaiterais obtenir des informations.'
        )
        
        self.assertFalse(message.is_read)
        self.assertIsNone(message.replied_at)
    
    def test_contact_message_str_representation(self):
        """Test représentation string"""
        message = ContactMessage.objects.create(
            name='Jean Dupont',
            email='jean.dupont@example.com',
            subject='Test',
            message='Message de test'
        )
        
        self.assertIn('Jean Dupont', str(message))
        self.assertIn('Test', str(message))
