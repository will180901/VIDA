from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from .phone_validators import validate_congo_phone


def validate_avatar(file):
    """Valide l'avatar uploadé"""
    from apps.content_management.validators import validate_image_file
    validate_image_file(file)


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('L\'email est obligatoire'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        PATIENT = 'patient', _('Patient')
        STAFF = 'staff', _('Personnel')
        DOCTOR = 'doctor', _('Médecin')
        ADMIN = 'admin', _('Administrateur')
    
    username = None
    email = models.EmailField(_('adresse email'), unique=True)
    phone = models.CharField(
        _('téléphone'), 
        max_length=20, 
        blank=True,
        validators=[validate_congo_phone],
        help_text=_('Format: 06 XXX XX XX, 05 XXX XX XX, 04 XXX XX XX ou 222 XX XX XX')
    )
    role = models.CharField(
        _('rôle'),
        max_length=20,
        choices=Role.choices,
        default=Role.PATIENT
    )
    
    date_of_birth = models.DateField(_('date de naissance'), null=True, blank=True)
    gender = models.CharField(
        _('genre'),
        max_length=10,
        choices=[('M', 'Masculin'), ('F', 'Féminin')],
        blank=True
    )
    address = models.TextField(_('adresse'), blank=True)
    emergency_contact = models.CharField(_('contact urgence'), max_length=100, blank=True)
    emergency_phone = models.CharField(
        _('téléphone urgence'), 
        max_length=20, 
        blank=True,
        validators=[validate_congo_phone],
        help_text=_('Format: 06 XXX XX XX, 05 XXX XX XX, 04 XXX XX XX ou 222 XX XX XX')
    )
    
    avatar = models.ImageField(
        upload_to='avatars/', 
        null=True, 
        blank=True,
        validators=[validate_avatar]
    )
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = _('utilisateur')
        verbose_name_plural = _('utilisateurs')
        indexes = [
            models.Index(fields=['email']),  # Recherche par email (déjà unique mais index explicite)
            models.Index(fields=['role']),  # Filtrage par rôle
            models.Index(fields=['email_verified']),  # Filtrage par vérification
        ]

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def is_patient(self):
        return self.role == self.Role.PATIENT
    
    @property
    def is_medical_staff(self):
        return self.role in [self.Role.STAFF, self.Role.DOCTOR, self.Role.ADMIN]


class EmailVerificationToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_tokens')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"Token for {self.user.email}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_tokens')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"Password reset for {self.user.email}"


# Import des modèles d'audit
from .models_audit import AuditLog, LoginAttempt

__all__ = ['User', 'EmailVerificationToken', 'PasswordResetToken', 'AuditLog', 'LoginAttempt']
