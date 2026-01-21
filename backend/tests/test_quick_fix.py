"""
Tests rapides corrigés pour validation
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta, time as dt_time
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.content_management.models import ClinicSchedule

User = get_user_model()


class QuickAuthTestCase(TestCase):
    """Tests d'authentification rapides"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
    
    def test_user_creation(self):
        """Test création d'utilisateur"""
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.check_password('TestPassword123!'))
    
    def test_profile_access(self):
        """Test accès au profil"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/auth/profile/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')


class QuickAppointmentTestCase(TestCase):
    """Tests de rendez-vous rapides"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Créer horaire
        ClinicSchedule.objects.create(
            day_of_week=0,
            is_open=True,
            morning_start=dt_time(8, 0),
            morning_end=dt_time(12, 0),
            slot_duration=30
        )
        
        self.future_date = timezone.now().date() + timedelta(days=7)
    
    def test_appointment_creation(self):
        """Test création de RDV"""
        appointment = Appointment.objects.create(
            patient_first_name='Test',
            patient_last_name='User',
            patient_email='test@example.com',
            patient_phone='06 123 45 67',
            date=self.future_date,
            time=dt_time(10, 0),
            consultation_type='generale'
        )
        
        self.assertEqual(appointment.status, 'pending')
        self.assertEqual(appointment.patient_full_name, 'Test User')
    
    def test_get_available_slots(self):
        """Test récupération des créneaux"""
        response = self.client.get(
            '/api/v1/appointments/slots/',
            {'date': self.future_date.isoformat()}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('slots', response.data)


class QuickSecurityTestCase(TestCase):
    """Tests de sécurité rapides"""
    
    def test_password_hashing(self):
        """Test hachage des mots de passe"""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
        
        # Le mot de passe ne doit pas être stocké en clair
        self.assertNotEqual(user.password, 'TestPassword123!')
        # Mais doit être vérifiable
        self.assertTrue(user.check_password('TestPassword123!'))
    
    def test_jwt_settings(self):
        """Test configuration JWT"""
        from django.conf import settings
        
        self.assertTrue(settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'])
        self.assertTrue(settings.SIMPLE_JWT['ROTATE_REFRESH_TOKENS'])
        self.assertTrue(settings.SIMPLE_JWT['BLACKLIST_AFTER_ROTATION'])
