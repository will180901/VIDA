"""
Tests d'authentification et sécurité
"""
import pytest
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch

User = get_user_model()


class AuthenticationTestCase(TestCase):
    """Tests d'authentification"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        
        # Données de test
        self.valid_user_data = {
            'email': 'test@example.com',
            'password': 'TestPassword123!Secure',
            'password_confirm': 'TestPassword123!Secure',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '06 123 45 67',
            'captcha': 'test_captcha_token'
        }
    
    @patch('apps.users.captcha.verify_hcaptcha')
    def test_register_success(self, mock_captcha):
        """Test inscription réussie"""
        mock_captcha.return_value = True
        
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertTrue(User.objects.filter(email='test@example.com').exists())
    
    def test_register_password_mismatch(self):
        """Test inscription avec mots de passe différents"""
        data = self.valid_user_data.copy()
        data['password_confirm'] = 'DifferentPassword123!'
        
        with patch('apps.users.captcha.verify_hcaptcha', return_value=True):
            response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_weak_password(self):
        """Test inscription avec mot de passe faible"""
        data = self.valid_user_data.copy()
        data['password'] = 'weak'
        data['password_confirm'] = 'weak'
        
        with patch('apps.users.captcha.verify_hcaptcha', return_value=True):
            response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_duplicate_email(self):
        """Test inscription avec email déjà utilisé"""
        # Créer un utilisateur
        User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Existing',
            last_name='User'
        )
        
        with patch('apps.users.captcha.verify_hcaptcha', return_value=True):
            response = self.client.post(self.register_url, self.valid_user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    @patch('apps.users.captcha.verify_hcaptcha')
    def test_login_success(self, mock_captcha):
        """Test connexion réussie"""
        mock_captcha.return_value = True
        
        # Créer un utilisateur
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
        
        login_data = {
            'email': 'test@example.com',
            'password': 'TestPassword123!',
            'captcha': 'test_captcha_token'
        }
        
        response = self.client.post(self.login_url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        # Vérifier que les cookies sont définis
        self.assertIn('vida_access_token', response.cookies)
    
    def test_login_invalid_credentials(self):
        """Test connexion avec identifiants invalides"""
        User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
        
        login_data = {
            'email': 'test@example.com',
            'password': 'WrongPassword123!',
            'captcha': 'test_captcha_token'
        }
        
        with patch('apps.users.captcha.verify_hcaptcha', return_value=True):
            response = self.client.post(self.login_url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_login_without_captcha(self):
        """Test connexion sans CAPTCHA"""
        login_data = {
            'email': 'test@example.com',
            'password': 'TestPassword123!'
        }
        
        response = self.client.post(self.login_url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PasswordSecurityTestCase(TestCase):
    """Tests de sécurité des mots de passe"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='OldPassword123!',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)
        self.change_password_url = reverse('change-password')
    
    def test_change_password_success(self):
        """Test changement de mot de passe réussi"""
        data = {
            'old_password': 'OldPassword123!',
            'new_password': 'NewPassword123!Secure',
            'new_password_confirm': 'NewPassword123!Secure'
        }
        
        response = self.client.post(self.change_password_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérifier que le nouveau mot de passe fonctionne
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword123!Secure'))
    
    def test_change_password_wrong_old_password(self):
        """Test changement avec ancien mot de passe incorrect"""
        data = {
            'old_password': 'WrongPassword123!',
            'new_password': 'NewPassword123!Secure',
            'new_password_confirm': 'NewPassword123!Secure'
        }
        
        response = self.client.post(self.change_password_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_change_password_mismatch(self):
        """Test changement avec nouveaux mots de passe différents"""
        data = {
            'old_password': 'OldPassword123!',
            'new_password': 'NewPassword123!Secure',
            'new_password_confirm': 'DifferentPassword123!'
        }
        
        response = self.client.post(self.change_password_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProfileTestCase(TestCase):
    """Tests de gestion du profil"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User',
            phone='06 123 45 67'
        )
        self.client.force_authenticate(user=self.user)
        self.profile_url = reverse('profile')
    
    def test_get_profile(self):
        """Test récupération du profil"""
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
    
    def test_update_profile(self):
        """Test mise à jour du profil"""
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'phone': '06 987 65 43'
        }
        
        response = self.client.patch(self.profile_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.phone, '06 987 65 43')
    
    def test_profile_xss_protection(self):
        """Test protection XSS dans le profil"""
        data = {
            'first_name': '<script>alert("XSS")</script>',
            'last_name': 'Test'
        }
        
        response = self.client.patch(self.profile_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        # Vérifier que le script a été sanitizé
        self.assertNotIn('<script>', self.user.first_name)
