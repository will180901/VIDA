"""
Tâches Celery pour l'app users
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def cleanup_expired_tokens():
    """
    Nettoie les tokens expirés (email verification, password reset)
    Exécuté quotidiennement
    """
    from .models import EmailVerificationToken, PasswordResetToken
    
    now = timezone.now()
    
    # Supprimer les tokens de vérification email expirés
    email_tokens_deleted = EmailVerificationToken.objects.filter(
        expires_at__lt=now
    ).delete()[0]
    
    # Supprimer les tokens de reset password expirés
    password_tokens_deleted = PasswordResetToken.objects.filter(
        expires_at__lt=now
    ).delete()[0]
    
    logger.info(
        f"Nettoyage tokens: {email_tokens_deleted} email tokens, "
        f"{password_tokens_deleted} password tokens supprimés"
    )
    
    return {
        'email_tokens_deleted': email_tokens_deleted,
        'password_tokens_deleted': password_tokens_deleted
    }


@shared_task
def cleanup_blacklisted_tokens():
    """
    Nettoie les tokens JWT blacklistés expirés
    Exécuté quotidiennement
    """
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
    from django.conf import settings
    
    # Calculer la date d'expiration basée sur REFRESH_TOKEN_LIFETIME
    expiration_date = timezone.now() - settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
    
    # Supprimer les tokens expirés
    deleted_count = OutstandingToken.objects.filter(
        expires_at__lt=expiration_date
    ).delete()[0]
    
    logger.info(f"Nettoyage JWT: {deleted_count} tokens blacklistés supprimés")
    
    return {'tokens_deleted': deleted_count}


@shared_task
def send_verification_email(user_id, token):
    """
    Envoie un email de vérification à l'utilisateur
    TODO: Implémenter l'envoi d'email
    """
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    try:
        user = User.objects.get(id=user_id)
        
        # TODO: Implémenter l'envoi d'email avec le token
        # verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        # send_mail(...)
        
        logger.info(f"Email de vérification envoyé à {user.email}")
        return {'success': True, 'email': user.email}
    
    except User.DoesNotExist:
        logger.error(f"Utilisateur {user_id} non trouvé pour envoi email")
        return {'success': False, 'error': 'User not found'}


@shared_task
def send_password_reset_email(user_id, token):
    """
    Envoie un email de réinitialisation de mot de passe
    TODO: Implémenter l'envoi d'email
    """
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    try:
        user = User.objects.get(id=user_id)
        
        # TODO: Implémenter l'envoi d'email avec le token
        # reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        # send_mail(...)
        
        logger.info(f"Email de reset password envoyé à {user.email}")
        return {'success': True, 'email': user.email}
    
    except User.DoesNotExist:
        logger.error(f"Utilisateur {user_id} non trouvé pour reset password")
        return {'success': False, 'error': 'User not found'}


@shared_task
def backup_database():
    """
    Effectue un backup automatique de la base de données
    Exécuté quotidiennement à 2h du matin
    """
    import subprocess
    import os
    from pathlib import Path
    from datetime import datetime
    from django.conf import settings
    
    # Configuration
    backup_dir = os.getenv('BACKUP_DIR', '/var/backups/vida')
    retention_days = int(os.getenv('BACKUP_RETENTION_DAYS', '30'))
    
    # Créer le répertoire si nécessaire
    Path(backup_dir).mkdir(parents=True, exist_ok=True)
    
    # Récupérer la configuration DB
    db_config = settings.DATABASES['default']
    db_name = db_config['NAME']
    db_user = db_config['USER']
    db_password = db_config['PASSWORD']
    db_host = db_config.get('HOST', 'localhost')
    db_port = db_config.get('PORT', '5432')
    
    # Nom du fichier
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = os.path.join(backup_dir, f'vida_db_{timestamp}.sql.gz')
    
    try:
        # Commande pg_dump
        cmd = [
            'pg_dump',
            '-h', db_host,
            '-p', str(db_port),
            '-U', db_user,
            '-d', db_name,
            '--format=plain',
            '--no-owner',
            '--no-acl',
        ]
        
        # Exécuter avec compression
        env = os.environ.copy()
        env['PGPASSWORD'] = db_password
        
        with open(backup_file, 'wb') as f:
            pg_dump = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env
            )
            
            gzip = subprocess.Popen(
                ['gzip'],
                stdin=pg_dump.stdout,
                stdout=f,
                stderr=subprocess.PIPE
            )
            
            pg_dump.stdout.close()
            gzip.communicate()
            
            if gzip.returncode != 0:
                raise Exception("Erreur lors de la compression")
        
        # Vérifier la taille
        size = os.path.getsize(backup_file)
        size_mb = size / (1024 * 1024)
        
        # Nettoyer les anciens backups
        cutoff_date = datetime.now() - timedelta(days=retention_days)
        deleted_count = 0
        
        for filename in os.listdir(backup_dir):
            if filename.startswith('vida_db_') and filename.endswith('.sql.gz'):
                filepath = os.path.join(backup_dir, filename)
                file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
                
                if file_time < cutoff_date:
                    os.remove(filepath)
                    deleted_count += 1
        
        logger.info(f"Backup créé: {backup_file} ({size_mb:.2f} MB)")
        logger.info(f"Anciens backups supprimés: {deleted_count}")
        
        return {
            'backup_file': backup_file,
            'size_mb': round(size_mb, 2),
            'deleted_count': deleted_count
        }
        
    except Exception as e:
        logger.error(f"Erreur backup DB: {e}")
        if os.path.exists(backup_file):
            os.remove(backup_file)
        raise


@shared_task
def cleanup_old_audit_logs():
    """
    Nettoie les logs d'audit de plus de 90 jours
    Exécuté mensuellement
    """
    from .models_audit import AuditLog, LoginAttempt
    
    cutoff_date = timezone.now() - timedelta(days=90)
    
    # Supprimer les logs d'audit
    audit_deleted = AuditLog.objects.filter(timestamp__lt=cutoff_date).delete()[0]
    
    # Supprimer les tentatives de connexion
    login_deleted = LoginAttempt.objects.filter(timestamp__lt=cutoff_date).delete()[0]
    
    logger.info(f"Logs d'audit nettoyés: {audit_deleted} audit logs, {login_deleted} login attempts")
    
    return {
        'audit_logs_deleted': audit_deleted,
        'login_attempts_deleted': login_deleted
    }
