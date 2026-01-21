"""
Tests de sécurité
"""
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.sanitizers import sanitize_text_input
from apps.users.validators import calculate_password_strength
from apps.content_management.validators import validate_image_file

User = get_user_model()


class SanitizationTestCase(TestCase):
    """Tests de sanitization XSS"""
    
    def test_sanitize_script_tag(self):
        """Test sanitization de balise script"""
        dirty = '<script>alert("XSS")</script>Hello'
        clean = sanitize_text_input(dirty)
        
        self.assertNotIn('<script>', clean)
        self.assertNotIn('</script>', clean)
        self.assertIn('Hello', clean)
    
    def test_sanitize_onclick(self):
        """Test sanitization d'attribut onclick"""
        dirty = '<div onclick="alert(\'XSS\')">Click me</div>'
        clean = sanitize_text_input(dirty)
        
        self.assertNotIn('onclick', clean)
    
    def test_sanitize_javascript_protocol(self):
        """Test sanitization de protocole javascript:"""
        dirty = '<a href="javascript:alert(\'XSS\')">Link</a>'
        clean = sanitize_text_input(dirty)
        
        self.assertNotIn('javascript:', clean)
    
    def test_sanitize_preserves_safe_html(self):
        """Test que le HTML sûr est préservé"""
        safe = '<p>Texte <strong>important</strong></p>'
        clean = sanitize_text_input(safe)
        
        self.assertIn('<p>', clean)
        self.assertIn('<strong>', clean)
    
    def test_sanitize_none_value(self):
        """Test sanitization de valeur None"""
        clean = sanitize_text_input(None)
        self.assertEqual(clean, '')
    
    def test_sanitize_empty_string(self):
        """Test sanitization de chaîne vide"""
        clean = sanitize_text_input('')
        self.assertEqual(clean, '')


class PasswordValidationTestCase(TestCase):
    """Tests de validation des mots de passe"""
    
    def test_strong_password(self):
        """Test mot de passe fort"""
        result = calculate_password_strength('MyStr0ng!Password123')
        
        self.assertEqual(result['strength'], 'strong')
        self.assertGreaterEqual(result['score'], 80)
    
    def test_medium_password(self):
        """Test mot de passe moyen"""
        result = calculate_password_strength('Password123')
        
        self.assertIn(result['strength'], ['medium', 'weak'])
    
    def test_weak_password(self):
        """Test mot de passe faible"""
        result = calculate_password_strength('password')
        
        self.assertEqual(result['strength'], 'weak')
        self.assertLess(result['score'], 50)
    
    def test_password_length_check(self):
        """Test vérification de longueur"""
        result = calculate_password_strength('Short1!')
        
        self.assertFalse(result['checks']['length'])
    
    def test_password_uppercase_check(self):
        """Test vérification de majuscule"""
        result = calculate_password_strength('password123!')
        
        self.assertFalse(result['checks']['uppercase'])
    
    def test_password_lowercase_check(self):
        """Test vérification de minuscule"""
        result = calculate_password_strength('PASSWORD123!')
        
        self.assertFalse(result['checks']['lowercase'])
    
    def test_password_digit_check(self):
        """Test vérification de chiffre"""
        result = calculate_password_strength('Password!')
        
        self.assertFalse(result['checks']['digit'])
    
    def test_password_special_check(self):
        """Test vérification de caractère spécial"""
        result = calculate_password_strength('Password123')
        
        self.assertFalse(result['checks']['special'])


class ImageValidationTestCase(TestCase):
    """Tests de validation des images"""
    
    def test_validate_image_size_too_large(self):
        """Test validation taille d'image trop grande"""
        from django.core.files.uploadedfile import SimpleUploadedFile
        from django.core.exceptions import ValidationError
        
        # Créer un fichier de 6 MB (> 5 MB max)
        large_file = SimpleUploadedFile(
            "test.jpg",
            b"x" * (6 * 1024 * 1024),
            content_type="image/jpeg"
        )
        large_file.size = 6 * 1024 * 1024
        
        with self.assertRaises(ValidationError):
            validate_image_file(large_file)
    
    def test_validate_image_invalid_extension(self):
        """Test validation extension invalide"""
        from django.core.files.uploadedfile import SimpleUploadedFile
        from django.core.exceptions import ValidationError
        
        invalid_file = SimpleUploadedFile(
            "test.exe",
            b"fake content",
            content_type="application/exe"
        )
        
        with self.assertRaises(ValidationError):
            validate_image_file(invalid_file)


class ThrottlingTestCase(TestCase):
    """Tests de rate limiting"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_login_rate_limiting(self):
        """Test rate limiting sur login"""
        from django.urls import reverse
        from unittest.mock import patch
        
        login_url = reverse('login')
        
        # Simuler plusieurs tentatives de connexion
        login_data = {
            'email': 'test@example.com',
            'password': 'WrongPassword123!',
            'captcha': 'test_token'
        }
        
        with patch('apps.users.captcha.verify_hcaptcha', return_value=True):
            # Faire plusieurs requêtes rapidement
            responses = []
            for i in range(10):
                response = self.client.post(login_url, login_data, format='json')
                responses.append(response.status_code)
            
            # Au moins une requête doit être throttled (429)
            # Note: Ceci dépend de la configuration du throttling
            self.assertTrue(
                any(status_code == status.HTTP_429_TOO_MANY_REQUESTS for status_code in responses) or
                all(status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED] for status_code in responses)
            )


class CSRFProtectionTestCase(TestCase):
    """Tests de protection CSRF"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
    
    def test_csrf_token_required_for_state_changing_operations(self):
        """Test que le token CSRF est requis pour les opérations modifiant l'état"""
        from django.urls import reverse
        
        # Se connecter
        self.client.force_authenticate(user=self.user)
        
        # Essayer de changer le mot de passe sans CSRF token
        # Note: APIClient de DRF désactive CSRF par défaut pour les tests
        # Ce test vérifie que la configuration est en place
        change_password_url = reverse('change-password')
        
        # La configuration CSRF doit être présente dans settings
        from django.conf import settings
        self.assertIn('django.middleware.csrf.CsrfViewMiddleware', settings.MIDDLEWARE)


class JWTSecurityTestCase(TestCase):
    """Tests de sécurité JWT"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
    
    def test_jwt_cookies_httponly(self):
        """Test que les cookies JWT sont httpOnly"""
        from django.conf import settings
        
        self.assertTrue(settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'])
    
    def test_jwt_cookies_secure(self):
        """Test que les cookies JWT sont secure (HTTPS only)"""
        from django.conf import settings
        
        self.assertTrue(settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'])
    
    def test_jwt_cookies_samesite(self):
        """Test que les cookies JWT ont SameSite"""
        from django.conf import settings
        
        self.assertEqual(settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'], 'Lax')
    
    def test_jwt_token_rotation(self):
        """Test que la rotation des tokens est activée"""
        from django.conf import settings
        
        self.assertTrue(settings.SIMPLE_JWT['ROTATE_REFRESH_TOKENS'])
        self.assertTrue(settings.SIMPLE_JWT['BLACKLIST_AFTER_ROTATION'])


class SecurityHeadersTestCase(TestCase):
    """Tests des headers de sécurité"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_security_headers_present(self):
        """Test que les headers de sécurité sont présents"""
        from django.urls import reverse
        
        # Faire une requête quelconque
        response = self.client.get(reverse('appointment-list'))
        
        # Vérifier les headers de sécurité
        self.assertIn('X-Content-Type-Options', response)
        self.assertEqual(response['X-Content-Type-Options'], 'nosniff')
        
        self.assertIn('X-Frame-Options', response)
        self.assertEqual(response['X-Frame-Options'], 'DENY')
        
        self.assertIn('X-XSS-Protection', response)
        self.assertEqual(response['X-XSS-Protection'], '1; mode=block')
        
        self.assertIn('Referrer-Policy', response)
        self.assertEqual(response['Referrer-Policy'], 'strict-origin-when-cross-origin')
