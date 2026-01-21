"""
Validation hCaptcha pour protection anti-bot
"""
import requests
from django.conf import settings
from rest_framework import serializers


def verify_hcaptcha(token, remote_ip=None):
    """
    Vérifie un token hCaptcha auprès de l'API hCaptcha
    
    Args:
        token: Token hCaptcha depuis le frontend
        remote_ip: IP de l'utilisateur (optionnel)
    
    Returns:
        bool: True si valide, False sinon
    
    Raises:
        serializers.ValidationError: Si token invalide ou manquant
    """
    if not token:
        raise serializers.ValidationError({
            'captcha': 'Le CAPTCHA est requis.'
        })
    
    # En développement, si HCAPTCHA_SECRET_KEY n'est pas défini, skip la validation
    secret_key = getattr(settings, 'HCAPTCHA_SECRET_KEY', None)
    if not secret_key:
        # Mode dev : accepter tout
        if settings.DEBUG:
            return True
        raise serializers.ValidationError({
            'captcha': 'Configuration CAPTCHA manquante.'
        })
    
    # Appel API hCaptcha
    data = {
        'secret': secret_key,
        'response': token,
    }
    
    if remote_ip:
        data['remoteip'] = remote_ip
    
    try:
        response = requests.post(
            'https://hcaptcha.com/siteverify',
            data=data,
            timeout=5
        )
        result = response.json()
        
        if result.get('success'):
            return True
        
        # Erreurs spécifiques
        error_codes = result.get('error-codes', [])
        if 'missing-input-response' in error_codes:
            raise serializers.ValidationError({
                'captcha': 'Le CAPTCHA est requis.'
            })
        elif 'invalid-input-response' in error_codes:
            raise serializers.ValidationError({
                'captcha': 'Le CAPTCHA est invalide ou expiré.'
            })
        elif 'timeout-or-duplicate' in error_codes:
            raise serializers.ValidationError({
                'captcha': 'Le CAPTCHA a expiré. Veuillez réessayer.'
            })
        else:
            raise serializers.ValidationError({
                'captcha': 'Échec de la vérification CAPTCHA.'
            })
    
    except requests.RequestException:
        # En cas d'erreur réseau, on accepte (pour ne pas bloquer les utilisateurs)
        if settings.DEBUG:
            return True
        raise serializers.ValidationError({
            'captcha': 'Erreur de vérification CAPTCHA. Veuillez réessayer.'
        })


class HCaptchaMixin:
    """
    Mixin pour ajouter la validation hCaptcha à un serializer
    """
    
    def validate(self, attrs):
        attrs = super().validate(attrs)
        
        # Récupérer le token depuis le contexte de la requête
        request = self.context.get('request')
        if request:
            captcha_token = request.data.get('h-captcha-response') or request.data.get('captcha')
            remote_ip = request.META.get('REMOTE_ADDR')
            
            # Vérifier le CAPTCHA
            verify_hcaptcha(captcha_token, remote_ip)
        
        return attrs
