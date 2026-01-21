"""
Validateurs de mot de passe personnalisés pour VIDA
Sécurité renforcée : majuscule, minuscule, chiffre, caractère spécial
"""

import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.conf import settings


class VIDAPasswordValidator:
    """
    Validateur de mot de passe VIDA avec exigences strictes :
    - Minimum 12 caractères
    - Au moins 1 majuscule
    - Au moins 1 minuscule
    - Au moins 1 chiffre
    - Au moins 1 caractère spécial
    """
    
    def __init__(self):
        self.min_length = getattr(settings, 'PASSWORD_MIN_LENGTH', 12)
        self.require_uppercase = getattr(settings, 'PASSWORD_REQUIRE_UPPERCASE', True)
        self.require_lowercase = getattr(settings, 'PASSWORD_REQUIRE_LOWERCASE', True)
        self.require_digit = getattr(settings, 'PASSWORD_REQUIRE_DIGIT', True)
        self.require_special = getattr(settings, 'PASSWORD_REQUIRE_SPECIAL', True)
    
    def validate(self, password, user=None):
        errors = []
        
        # Longueur minimale
        if len(password) < self.min_length:
            errors.append(
                _('Le mot de passe doit contenir au moins %(min_length)d caractères.') 
                % {'min_length': self.min_length}
            )
        
        # Majuscule
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append(_('Le mot de passe doit contenir au moins une lettre majuscule.'))
        
        # Minuscule
        if self.require_lowercase and not re.search(r'[a-z]', password):
            errors.append(_('Le mot de passe doit contenir au moins une lettre minuscule.'))
        
        # Chiffre
        if self.require_digit and not re.search(r'\d', password):
            errors.append(_('Le mot de passe doit contenir au moins un chiffre.'))
        
        # Caractère spécial
        if self.require_special and not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;\'`~]', password):
            errors.append(_('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...).'))
        
        if errors:
            raise ValidationError(errors)
    
    def get_help_text(self):
        help_texts = [
            _('Votre mot de passe doit contenir au moins %(min_length)d caractères') % {'min_length': self.min_length},
        ]
        
        if self.require_uppercase:
            help_texts.append(_('une lettre majuscule'))
        if self.require_lowercase:
            help_texts.append(_('une lettre minuscule'))
        if self.require_digit:
            help_texts.append(_('un chiffre'))
        if self.require_special:
            help_texts.append(_('un caractère spécial'))
        
        return ', '.join(help_texts) + '.'


def calculate_password_strength(password):
    """
    Calcule la force d'un mot de passe (0-100)
    Retourne un score et un label
    """
    score = 0
    
    # Longueur (max 30 points)
    length = len(password)
    if length >= 12:
        score += 30
    elif length >= 8:
        score += 20
    elif length >= 6:
        score += 10
    
    # Majuscules (10 points)
    if re.search(r'[A-Z]', password):
        score += 10
    
    # Minuscules (10 points)
    if re.search(r'[a-z]', password):
        score += 10
    
    # Chiffres (15 points)
    if re.search(r'\d', password):
        score += 15
    
    # Caractères spéciaux (20 points)
    special_count = len(re.findall(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;\'`~]', password))
    if special_count >= 2:
        score += 20
    elif special_count == 1:
        score += 10
    
    # Diversité (15 points)
    unique_chars = len(set(password))
    if unique_chars >= length * 0.7:
        score += 15
    elif unique_chars >= length * 0.5:
        score += 10
    elif unique_chars >= length * 0.3:
        score += 5
    
    # Déterminer le label
    if score >= 80:
        label = 'Très fort'
        color = 'success'
    elif score >= 60:
        label = 'Fort'
        color = 'success'
    elif score >= 40:
        label = 'Moyen'
        color = 'warning'
    elif score >= 20:
        label = 'Faible'
        color = 'error'
    else:
        label = 'Très faible'
        color = 'error'
    
    return {
        'score': min(score, 100),
        'label': label,
        'color': color
    }
