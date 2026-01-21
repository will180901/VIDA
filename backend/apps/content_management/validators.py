"""
Validateurs de fichiers pour uploads sécurisés
Validation du contenu réel (magic bytes) et non juste l'extension
"""
import os
from PIL import Image
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile


# Magic bytes des formats d'images autorisés
ALLOWED_IMAGE_MAGIC_BYTES = {
    b'\xFF\xD8\xFF': 'jpeg',  # JPEG
    b'\x89PNG\r\n\x1a\n': 'png',  # PNG
    b'RIFF': 'webp',  # WebP (commence par RIFF)
}

# Extensions autorisées
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}

# Taille maximale (5 MB)
MAX_FILE_SIZE = 5 * 1024 * 1024


def validate_image_file(file: UploadedFile) -> None:
    """
    Valide qu'un fichier uploadé est bien une image valide
    
    Vérifications :
    1. Taille du fichier
    2. Extension
    3. Magic bytes (signature du fichier)
    4. Validation avec Pillow (ouverture de l'image)
    5. Dimensions raisonnables
    
    Args:
        file: Fichier uploadé
    
    Raises:
        ValidationError: Si le fichier n'est pas valide
    """
    
    # 1. Vérifier la taille
    if file.size > MAX_FILE_SIZE:
        raise ValidationError(
            f'Le fichier est trop volumineux. Taille maximale : {MAX_FILE_SIZE / (1024*1024):.0f} MB.'
        )
    
    if file.size == 0:
        raise ValidationError('Le fichier est vide.')
    
    # 2. Vérifier l'extension
    file_ext = os.path.splitext(file.name)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f'Extension de fichier non autorisée. Extensions autorisées : {", ".join(ALLOWED_EXTENSIONS)}'
        )
    
    # 3. Vérifier les magic bytes (signature du fichier)
    file.seek(0)  # Revenir au début du fichier
    file_header = file.read(12)  # Lire les 12 premiers octets
    file.seek(0)  # Revenir au début
    
    is_valid_magic = False
    detected_format = None
    
    for magic_bytes, format_name in ALLOWED_IMAGE_MAGIC_BYTES.items():
        if file_header.startswith(magic_bytes):
            is_valid_magic = True
            detected_format = format_name
            break
    
    if not is_valid_magic:
        raise ValidationError(
            'Le fichier n\'est pas une image valide. Le contenu ne correspond pas à un format d\'image autorisé.'
        )
    
    # 4. Valider avec Pillow (tente d'ouvrir l'image)
    try:
        file.seek(0)
        image = Image.open(file)
        image.verify()  # Vérifie que l'image n'est pas corrompue
        
        # Rouvrir l'image car verify() ferme le fichier
        file.seek(0)
        image = Image.open(file)
        
        # 5. Vérifier les dimensions (max 10000x10000 pour éviter les attaques par décompression)
        width, height = image.size
        if width > 10000 or height > 10000:
            raise ValidationError(
                f'Les dimensions de l\'image sont trop grandes. Maximum : 10000x10000 pixels. Reçu : {width}x{height}'
            )
        
        if width < 10 or height < 10:
            raise ValidationError(
                f'Les dimensions de l\'image sont trop petites. Minimum : 10x10 pixels. Reçu : {width}x{height}'
            )
        
        # Vérifier que le format détecté par Pillow correspond au format attendu
        pillow_format = image.format.lower() if image.format else None
        if pillow_format not in ['jpeg', 'png', 'webp']:
            raise ValidationError(
                f'Format d\'image non autorisé : {pillow_format}. Formats autorisés : JPEG, PNG, WebP.'
            )
        
    except ValidationError:
        raise
    except Exception as e:
        raise ValidationError(
            f'Impossible de valider l\'image. Le fichier est peut-être corrompu ou n\'est pas une image valide. Erreur : {str(e)}'
        )
    
    finally:
        file.seek(0)  # Toujours revenir au début du fichier


def sanitize_filename(filename: str) -> str:
    """
    Nettoie un nom de fichier pour éviter les injections
    
    Args:
        filename: Nom de fichier original
    
    Returns:
        Nom de fichier nettoyé
    """
    # Garder uniquement les caractères alphanumériques, tirets, underscores et points
    import re
    
    # Séparer le nom et l'extension
    name, ext = os.path.splitext(filename)
    
    # Nettoyer le nom (garder seulement alphanum, -, _)
    clean_name = re.sub(r'[^a-zA-Z0-9_-]', '_', name)
    
    # Limiter la longueur
    clean_name = clean_name[:60]
    
    # Nettoyer l'extension
    clean_ext = ext.lower()
    
    return f"{clean_name}{clean_ext}"
