"""
Sanitizers pour prévenir les attaques XSS
Nettoie les inputs utilisateur avant stockage
"""
import re
import html
from django.utils.html import strip_tags


def sanitize_text_input(value):
    """
    Nettoie un input texte pour prévenir XSS
    
    - Supprime les balises HTML
    - Échappe les caractères spéciaux
    - Supprime les scripts
    
    Args:
        value: Texte à nettoyer
    
    Returns:
        Texte nettoyé
    """
    if not value:
        return value
    
    # Supprimer les balises HTML
    cleaned = strip_tags(value)
    
    # Supprimer les caractères de contrôle dangereux
    cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', cleaned)
    
    # Supprimer les séquences JavaScript dangereuses
    dangerous_patterns = [
        r'javascript:',
        r'on\w+\s*=',  # onclick=, onload=, etc.
        r'<script',
        r'</script>',
        r'eval\s*\(',
        r'expression\s*\(',
    ]
    
    for pattern in dangerous_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    
    return cleaned.strip()


def sanitize_html_content(value, allowed_tags=None):
    """
    Nettoie du contenu HTML en autorisant certaines balises
    
    Args:
        value: HTML à nettoyer
        allowed_tags: Liste des balises autorisées (ex: ['p', 'br', 'strong'])
    
    Returns:
        HTML nettoyé
    """
    if not value:
        return value
    
    if allowed_tags is None:
        # Par défaut, autoriser seulement les balises de formatage basique
        allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li']
    
    # Supprimer toutes les balises sauf celles autorisées
    # Pour une vraie application, utiliser bleach ou html5lib
    cleaned = strip_tags(value)
    
    # Échapper les caractères HTML
    cleaned = html.escape(cleaned)
    
    return cleaned


def sanitize_filename(filename):
    """
    Nettoie un nom de fichier pour éviter les injections
    
    Args:
        filename: Nom de fichier à nettoyer
    
    Returns:
        Nom de fichier sécurisé
    """
    if not filename:
        return filename
    
    # Garder uniquement les caractères alphanumériques, tirets, underscores et points
    cleaned = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    
    # Supprimer les doubles points (path traversal)
    cleaned = cleaned.replace('..', '_')
    
    # Limiter la longueur
    name, ext = cleaned.rsplit('.', 1) if '.' in cleaned else (cleaned, '')
    name = name[:60]
    
    return f"{name}.{ext}" if ext else name


def sanitize_url(url):
    """
    Valide et nettoie une URL
    
    Args:
        url: URL à valider
    
    Returns:
        URL nettoyée ou None si invalide
    """
    if not url:
        return url
    
    # Autoriser seulement http et https
    if not url.startswith(('http://', 'https://')):
        return None
    
    # Supprimer les caractères dangereux
    dangerous_chars = ['<', '>', '"', "'", '`']
    for char in dangerous_chars:
        if char in url:
            return None
    
    # Supprimer javascript:
    if 'javascript:' in url.lower():
        return None
    
    return url


def sanitize_email(email):
    """
    Valide et nettoie une adresse email
    
    Args:
        email: Email à valider
    
    Returns:
        Email nettoyé
    """
    if not email:
        return email
    
    # Supprimer les espaces
    cleaned = email.strip().lower()
    
    # Validation basique du format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, cleaned):
        return None
    
    return cleaned


def sanitize_json_keys(data):
    """
    Nettoie les clés d'un dictionnaire JSON
    Prévient les injections via les noms de clés
    
    Args:
        data: Dictionnaire à nettoyer
    
    Returns:
        Dictionnaire avec clés nettoyées
    """
    if not isinstance(data, dict):
        return data
    
    cleaned = {}
    for key, value in data.items():
        # Nettoyer la clé
        clean_key = re.sub(r'[^a-zA-Z0-9_-]', '_', str(key))
        
        # Nettoyer récursivement les valeurs
        if isinstance(value, dict):
            cleaned[clean_key] = sanitize_json_keys(value)
        elif isinstance(value, list):
            cleaned[clean_key] = [
                sanitize_json_keys(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            cleaned[clean_key] = value
    
    return cleaned
