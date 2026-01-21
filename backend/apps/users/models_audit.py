"""
Modèles pour l'audit trail (traçabilité des actions)
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from config.json_validators import validate_json_field

User = get_user_model()


def validate_audit_changes_json(value):
    """Valide le champ changes JSON"""
    validate_json_field(value, 'changes', max_depth=5, max_size=100)


def validate_audit_extra_data_json(value):
    """Valide le champ extra_data JSON"""
    validate_json_field(value, 'extra_data', max_depth=5, max_size=100)


class AuditLog(models.Model):
    """
    Log d'audit pour tracer toutes les actions importantes
    """
    
    ACTION_CHOICES = [
        # Authentification
        ('login', 'Connexion'),
        ('logout', 'Déconnexion'),
        ('register', 'Inscription'),
        ('password_change', 'Changement de mot de passe'),
        ('password_reset', 'Réinitialisation de mot de passe'),
        ('email_verify', 'Vérification email'),
        
        # CRUD
        ('create', 'Création'),
        ('read', 'Lecture'),
        ('update', 'Modification'),
        ('delete', 'Suppression'),
        
        # Rendez-vous
        ('appointment_create', 'Création de RDV'),
        ('appointment_cancel', 'Annulation de RDV'),
        ('appointment_confirm', 'Confirmation de RDV'),
        ('slot_lock', 'Verrouillage de créneau'),
        
        # Sécurité
        ('failed_login', 'Échec de connexion'),
        ('permission_denied', 'Accès refusé'),
        ('suspicious_activity', 'Activité suspecte'),
        
        # Système
        ('backup', 'Backup'),
        ('restore', 'Restauration'),
        ('config_change', 'Changement de configuration'),
    ]
    
    LEVEL_CHOICES = [
        ('debug', 'Debug'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    
    # Qui
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        help_text="Utilisateur ayant effectué l'action"
    )
    username = models.CharField(
        max_length=255,
        blank=True,
        help_text="Nom d'utilisateur (conservé même si user supprimé)"
    )
    
    # Quoi
    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
        db_index=True,
        help_text="Type d'action effectuée"
    )
    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default='info',
        db_index=True,
        help_text="Niveau de gravité"
    )
    
    # Sur quoi (Generic Foreign Key)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Type d'objet concerné"
    )
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="ID de l'objet concerné"
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Détails
    description = models.TextField(
        help_text="Description de l'action"
    )
    changes = models.JSONField(
        null=True,
        blank=True,
        help_text="Détails des changements (avant/après)",
        validators=[validate_audit_changes_json]
    )
    
    # Contexte
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Adresse IP de l'utilisateur"
    )
    user_agent = models.CharField(
        max_length=500,
        blank=True,
        help_text="User-Agent du navigateur"
    )
    request_path = models.CharField(
        max_length=500,
        blank=True,
        help_text="Chemin de la requête"
    )
    request_method = models.CharField(
        max_length=10,
        blank=True,
        help_text="Méthode HTTP (GET, POST, etc.)"
    )
    
    # Métadonnées
    extra_data = models.JSONField(
        null=True,
        blank=True,
        help_text="Données supplémentaires",
        validators=[validate_audit_extra_data_json]
    )
    
    # Quand
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Date et heure de l'action"
    )
    
    class Meta:
        db_table = 'audit_log'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['level', '-timestamp']),
            models.Index(fields=['ip_address', '-timestamp']),
        ]
        verbose_name = 'Log d\'audit'
        verbose_name_plural = 'Logs d\'audit'
    
    def __str__(self):
        user_str = self.username or 'Anonyme'
        return f"{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')} - {user_str} - {self.get_action_display()}"
    
    @classmethod
    def log(cls, action, user=None, description='', level='info', 
            content_object=None, changes=None, request=None, **extra_data):
        """
        Méthode helper pour créer un log d'audit
        
        Usage:
            AuditLog.log(
                action='login',
                user=request.user,
                description='Connexion réussie',
                request=request
            )
        """
        log_data = {
            'action': action,
            'level': level,
            'description': description,
            'changes': changes,
            'extra_data': extra_data if extra_data else None,
        }
        
        # Utilisateur
        if user and user.is_authenticated:
            log_data['user'] = user
            log_data['username'] = str(user)
        
        # Objet concerné
        if content_object:
            log_data['content_type'] = ContentType.objects.get_for_model(content_object)
            log_data['object_id'] = content_object.pk
        
        # Contexte de la requête
        if request:
            log_data['ip_address'] = cls._get_client_ip(request)
            log_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:500]
            log_data['request_path'] = request.path[:500]
            log_data['request_method'] = request.method
        
        return cls.objects.create(**log_data)
    
    @staticmethod
    def _get_client_ip(request):
        """Récupérer l'IP réelle du client (même derrière un proxy)"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class LoginAttempt(models.Model):
    """
    Historique des tentatives de connexion (succès et échecs)
    Complément à django-axes pour analyse
    """
    
    username = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Email/username utilisé"
    )
    ip_address = models.GenericIPAddressField(
        db_index=True,
        help_text="Adresse IP"
    )
    user_agent = models.CharField(
        max_length=500,
        blank=True,
        help_text="User-Agent"
    )
    
    success = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Tentative réussie ou non"
    )
    failure_reason = models.CharField(
        max_length=255,
        blank=True,
        help_text="Raison de l'échec"
    )
    
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )
    
    class Meta:
        db_table = 'login_attempt'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['username', '-timestamp']),
            models.Index(fields=['ip_address', '-timestamp']),
            models.Index(fields=['success', '-timestamp']),
        ]
        verbose_name = 'Tentative de connexion'
        verbose_name_plural = 'Tentatives de connexion'
    
    def __str__(self):
        status = '✅' if self.success else '❌'
        return f"{status} {self.username} - {self.ip_address} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
