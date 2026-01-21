from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid

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


class Patient(models.Model):
    """
    Profil patient - créé uniquement après une première consultation.
    Un patient est une personne qui a déjà consulté au moins une fois.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='patient_profile',
        null=True,
        blank=True,
        verbose_name="Utilisateur associé"
    )
    
    # Coordonnées issues de la première demande
    first_name = models.CharField("Prénom", max_length=100)
    last_name = models.CharField("Nom", max_length=100)
    phone = models.CharField("Téléphone", max_length=20)
    email = models.EmailField("Email", null=True, blank=True)
    
    # Champs médicaux de base
    date_of_birth = models.DateField("Date de naissance", null=True, blank=True)
    gender = models.CharField(
        "Genre",
        max_length=10,
        choices=[('M', 'Masculin'), ('F', 'Féminin')],
        blank=True
    )
    address = models.TextField("Adresse", blank=True)
    
    # Références
    appointment_request = models.ForeignKey(
        'appointments.AppointmentRequest',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='patients',
        verbose_name="Demande de rendez-vous initiale"
    )
    
    # Dates
    first_consultation_date = models.DateField("Date de première consultation")
    created_at = models.DateTimeField("Créé le", auto_now_add=True)
    updated_at = models.DateTimeField("Modifié le", auto_now=True)
    
    class Meta:
        verbose_name = "Patient"
        verbose_name_plural = "Patients"
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# Import des modèles d'audit
from .models_audit import AuditLog, LoginAttempt


class Invoice(models.Model):
    """
    Facture liée à une consultation.
    """
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('issued', 'Émise'),
        ('paid', 'Payée'),
        ('cancelled', 'Annulée'),
        ('overdue', 'En retard'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(
        'MedicalRecord',
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    invoice_number = models.CharField(
        "Numéro de facture",
        max_length=50,
        unique=True
    )
    issue_date = models.DateField("Date d'émission", default=timezone.now)
    due_date = models.DateField("Date d'échéance")
    amount = models.DecimalField("Montant", max_digits=10, decimal_places=2)
    status = models.CharField(
        "Statut",
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    notes = models.TextField("Notes", null=True, blank=True)
    created_by = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='invoices_created'
    )
    created_at = models.DateTimeField("Créé le", auto_now_add=True)
    updated_at = models.DateTimeField("Modifié le", auto_now=True)
    
    class Meta:
        verbose_name = "Facture"
        verbose_name_plural = "Factures"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Facture #{self.invoice_number} - {self.amount} XAF"
    
    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Générer un numéro unique
            from datetime import date
            self.invoice_number = f"INV-{date.today().year}-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)


class Payment(models.Model):
    """
    Paiement lié à une facture.
    """
    METHOD_CHOICES = [
        ('cash', 'Espèces'),
        ('mobile_money', 'Mobile Money'),
        ('bank_transfer', 'Virement bancaire'),
        ('card', 'Carte bancaire'),
        ('insurance', 'Assurance'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('completed', 'Complété'),
        ('failed', 'Échoué'),
        ('refunded', 'Remboursé'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField("Montant", max_digits=10, decimal_places=2)
    payment_date = models.DateField("Date de paiement", default=timezone.now)
    payment_method = models.CharField(
        "Méthode de paiement",
        max_length=50,
        choices=METHOD_CHOICES
    )
    reference = models.CharField(
        "Référence",
        max_length=100,
        null=True,
        blank=True,
        help_text="Numéro de transaction, référence mobile money, etc."
    )
    status = models.CharField(
        "Statut",
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    notes = models.TextField("Notes", null=True, blank=True)
    created_by = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='payments_created'
    )
    created_at = models.DateTimeField("Créé le", auto_now_add=True)
    updated_at = models.DateTimeField("Modifié le", auto_now=True)
    
    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Paiement #{self.id} - {self.amount} XAF"


__all__ = ['User', 'EmailVerificationToken', 'PasswordResetToken', 'Patient', 'AuditLog', 'LoginAttempt', 'Invoice', 'Payment']
