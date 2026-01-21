"""
Gestion des emails pour l'authentification
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_verification_email(user, token):
    """
    Envoie un email de vérification à l'utilisateur
    
    Args:
        user: Instance User
        token: Token de vérification
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # URL de vérification
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        verification_url = f"{frontend_url}/verify-email?token={token}"
        
        # Contexte pour le template
        context = {
            'user': user,
            'verification_url': verification_url,
            'site_name': 'VIDA',
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/verify_email.html', context)
        plain_message = strip_tags(html_message)
        
        # Envoyer l'email
        send_mail(
            subject='Vérifiez votre adresse email - VIDA',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de vérification envoyé à {user.email}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email vérification à {user.email}: {e}")
        return False


def send_password_reset_email(user, token):
    """
    Envoie un email de réinitialisation de mot de passe
    
    Args:
        user: Instance User
        token: Token de reset
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # URL de reset
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        reset_url = f"{frontend_url}/reset-password?token={token}"
        
        # Contexte pour le template
        context = {
            'user': user,
            'reset_url': reset_url,
            'site_name': 'VIDA',
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/password_reset.html', context)
        plain_message = strip_tags(html_message)
        
        # Envoyer l'email
        send_mail(
            subject='Réinitialisation de votre mot de passe - VIDA',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de reset password envoyé à {user.email}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email reset à {user.email}: {e}")
        return False


def send_password_changed_email(user):
    """
    Envoie un email de confirmation de changement de mot de passe
    
    Args:
        user: Instance User
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # Contexte pour le template
        context = {
            'user': user,
            'site_name': 'VIDA',
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/password_changed.html', context)
        plain_message = strip_tags(html_message)
        
        # Envoyer l'email
        send_mail(
            subject='Votre mot de passe a été modifié - VIDA',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de confirmation changement MDP envoyé à {user.email}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email confirmation à {user.email}: {e}")
        return False


def send_welcome_email(user):
    """
    Envoie un email de bienvenue après vérification
    
    Args:
        user: Instance User
    
    Returns:
        bool: True si envoyé avec succès
    """
    try:
        # Contexte pour le template
        context = {
            'user': user,
            'site_name': 'VIDA',
            'login_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/connexion",
        }
        
        # Générer le contenu HTML
        html_message = render_to_string('emails/welcome.html', context)
        plain_message = strip_tags(html_message)
        
        # Envoyer l'email
        send_mail(
            subject='Bienvenue sur VIDA !',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email de bienvenue envoyé à {user.email}")
        return True
    
    except Exception as e:
        logger.error(f"Erreur envoi email bienvenue à {user.email}: {e}")
        return False
