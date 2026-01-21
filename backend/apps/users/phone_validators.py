"""
Validateurs pour numéros de téléphone
Validation spécifique pour le Congo (Brazzaville)
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_congo_phone(value):
    """
    Valide un numéro de téléphone congolais
    
    Formats acceptés :
    - 06 XXX XX XX (mobile)
    - 05 XXX XX XX (mobile)
    - 04 XXX XX XX (mobile)
    - 222 XX XX XX (fixe Brazzaville)
    - Avec ou sans espaces
    - Avec ou sans préfixe +242 ou 00242
    
    Args:
        value: Numéro de téléphone à valider
    
    Raises:
        ValidationError: Si le numéro n'est pas valide
    """
    if not value:
        return  # Champ optionnel
    
    # Nettoyer le numéro (enlever espaces, tirets, parenthèses)
    cleaned = re.sub(r'[\s\-\(\)]', '', value)
    
    # Enlever le préfixe international si présent
    if cleaned.startswith('+242'):
        cleaned = cleaned[4:]
    elif cleaned.startswith('00242'):
        cleaned = cleaned[5:]
    elif cleaned.startswith('242'):
        cleaned = cleaned[3:]
    
    # Vérifier le format
    # Mobile: 06, 05, 04 suivi de 7 chiffres
    # Fixe: 222 suivi de 6 chiffres
    mobile_pattern = r'^0[456]\d{7}$'
    fixe_pattern = r'^222\d{6}$'
    
    if not (re.match(mobile_pattern, cleaned) or re.match(fixe_pattern, cleaned)):
        raise ValidationError(
            _('Numéro de téléphone invalide. Format attendu : 06 XXX XX XX, 05 XXX XX XX, 04 XXX XX XX ou 222 XX XX XX'),
            code='invalid_phone'
        )


def validate_international_phone(value):
    """
    Valide un numéro de téléphone international (format E.164)
    
    Format accepté : +[code pays][numéro]
    Exemple : +242061234567
    
    Args:
        value: Numéro de téléphone à valider
    
    Raises:
        ValidationError: Si le numéro n'est pas valide
    """
    if not value:
        return  # Champ optionnel
    
    # Nettoyer le numéro
    cleaned = re.sub(r'[\s\-\(\)]', '', value)
    
    # Format E.164 : + suivi de 7 à 15 chiffres
    pattern = r'^\+\d{7,15}$'
    
    if not re.match(pattern, cleaned):
        raise ValidationError(
            _('Numéro de téléphone international invalide. Format attendu : +[code pays][numéro] (ex: +242061234567)'),
            code='invalid_international_phone'
        )


def normalize_congo_phone(value):
    """
    Normalise un numéro de téléphone congolais au format international
    
    Args:
        value: Numéro de téléphone à normaliser
    
    Returns:
        Numéro normalisé au format +242XXXXXXXXX
    """
    if not value:
        return value
    
    # Nettoyer le numéro
    cleaned = re.sub(r'[\s\-\(\)]', '', value)
    
    # Enlever le préfixe international si présent
    if cleaned.startswith('+242'):
        return cleaned
    elif cleaned.startswith('00242'):
        return '+' + cleaned[2:]
    elif cleaned.startswith('242'):
        return '+' + cleaned
    else:
        # Ajouter le préfixe +242
        return f'+242{cleaned}'
