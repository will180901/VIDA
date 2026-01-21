from django.db import models
from django.utils.translation import gettext_lazy as _
from config.json_validators import validate_json_field


def validate_content_image(file):
    """Valide les images uploadées pour le contenu"""
    from .validators import validate_image_file
    validate_image_file(file)


def validate_contact_phone(value):
    """Valide le téléphone dans le formulaire de contact"""
    from apps.users.phone_validators import validate_congo_phone
    validate_congo_phone(value)


def validate_opening_hours_json(value):
    """Valide le champ opening_hours JSON"""
    validate_json_field(value, 'opening_hours', max_depth=3, max_size=50)


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class ClinicSetting(models.Model):
    name = models.CharField(max_length=100, default="Centre Médical VIDA")
    address = models.TextField(default="08 Bis rue Mboko, Moungali, Brazzaville, Congo")
    phone_primary = models.CharField(max_length=20, default="06 569 12 35")
    phone_secondary = models.CharField(max_length=20, default="05 745 36 88")
    whatsapp = models.CharField(max_length=20, default="242066934735")
    email = models.EmailField(default="centremedvida@gmail.com")
    
    # DEPRECATED: Ces champs sont conservés pour compatibilité mais ne sont plus utilisés
    # Utiliser ConsultationFee à la place
    fee_general = models.DecimalField(
        max_digits=10, 
        decimal_places=0, 
        default=15000,
        help_text="DEPRECATED: Utiliser ConsultationFee"
    )
    fee_specialized = models.DecimalField(
        max_digits=10, 
        decimal_places=0, 
        default=25000,
        help_text="DEPRECATED: Utiliser ConsultationFee"
    )
    
    opening_hours = models.JSONField(
        default=dict,
        validators=[validate_opening_hours_json]
    )
    about_text = models.TextField(blank=True)
    rccm = models.CharField(max_length=50, blank=True, default="B13-0506")
    niu = models.CharField(max_length=50, blank=True, default="M2300009961883")

    class Meta:
        verbose_name = "Paramètre de la Clinique"
        verbose_name_plural = "Paramètres de la Clinique"

    def __str__(self):
        return self.name


class ConsultationFee(models.Model):
    """
    Tarifs des consultations - Gestion dynamique des prix
    """
    CONSULTATION_TYPE_CHOICES = [
        ('generale', 'Consultation générale'),
        ('specialisee', 'Consultation spécialisée'),
        ('suivi', 'Consultation de suivi'),
        ('urgence', 'Urgence'),
    ]
    
    consultation_type = models.CharField(
        max_length=20,
        choices=CONSULTATION_TYPE_CHOICES,
        unique=True,
        verbose_name="Type de consultation"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        verbose_name="Prix (FCFA)",
        help_text="Prix en Francs CFA"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description",
        help_text="Description optionnelle du type de consultation"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Actif",
        help_text="Désactiver pour masquer ce type de consultation"
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Ordre d'affichage"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'consultation_type']
        verbose_name = "Tarif de consultation"
        verbose_name_plural = "Tarifs des consultations"
    
    def __str__(self):
        return f"{self.get_consultation_type_display()} - {self.price} FCFA"
    
    @classmethod
    def get_price(cls, consultation_type):
        """Récupère le prix d'un type de consultation"""
        try:
            fee = cls.objects.get(consultation_type=consultation_type, is_active=True)
            return float(fee.price)
        except cls.DoesNotExist:
            # Valeurs par défaut si non configuré
            defaults = {
                'generale': 15000,
                'specialisee': 25000,
                'suivi': 10000,
                'urgence': 30000,
            }
            return defaults.get(consultation_type, 0)
    
    @classmethod
    def get_all_active_fees(cls):
        """Récupère tous les tarifs actifs"""
        return cls.objects.filter(is_active=True).order_by('order', 'consultation_type')

class HeroSlide(TimeStampedModel):
    title = models.CharField(max_length=200)
    subtitle = models.TextField()
    image = models.ImageField(upload_to="hero/", validators=[validate_content_image])
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = "Slide Hero"
        verbose_name_plural = "Slides Hero"

    def __str__(self):
        return self.title

class MedicalService(TimeStampedModel):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    details = models.TextField()
    image = models.ImageField(upload_to="services/", validators=[validate_content_image])
    icon_name = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = "Service Médical"
        verbose_name_plural = "Services Médicaux"

    def __str__(self):
        return self.title

class SocialLink(TimeStampedModel):
    PLATFORM_CHOICES = [
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
        ('whatsapp', 'WhatsApp'),
        ('linkedin', 'LinkedIn'),
        ('tiktok', 'TikTok'),
        ('youtube', 'YouTube'),
    ]
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    url = models.URLField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = "Lien Social"
        verbose_name_plural = "Liens Sociaux"

    def __str__(self):
        return self.get_platform_display()

class FAQ(TimeStampedModel):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self):
        return self.question

class ClinicSchedule(models.Model):
    DAY_CHOICES = [
        (0, 'Lundi'),
        (1, 'Mardi'),
        (2, 'Mercredi'),
        (3, 'Jeudi'),
        (4, 'Vendredi'),
        (5, 'Samedi'),
        (6, 'Dimanche'),
    ]
    
    day_of_week = models.IntegerField(choices=DAY_CHOICES, unique=True)
    is_open = models.BooleanField(default=True)
    morning_start = models.TimeField(null=True, blank=True)
    morning_end = models.TimeField(null=True, blank=True)
    afternoon_start = models.TimeField(null=True, blank=True)
    afternoon_end = models.TimeField(null=True, blank=True)
    slot_duration = models.IntegerField(default=30, help_text="Durée créneau en minutes")

    class Meta:
        ordering = ['day_of_week']
        verbose_name = "Horaire"
        verbose_name_plural = "Horaires"

    def __str__(self):
        return f"{self.get_day_of_week_display()} - {'Ouvert' if self.is_open else 'Fermé'}"

class ClinicHoliday(models.Model):
    date = models.DateField(unique=True)
    name = models.CharField(max_length=100)
    is_recurring = models.BooleanField(default=False, help_text="Se répète chaque année")

    class Meta:
        ordering = ['date']
        verbose_name = "Jour férié"
        verbose_name_plural = "Jours fériés"

    def __str__(self):
        return f"{self.name} ({self.date})"

class ContactMessage(TimeStampedModel):
    """Messages sent through contact form"""
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(
        max_length=20, 
        blank=True,
        validators=[validate_contact_phone],
        help_text=_('Format: 06 XXX XX XX, 05 XXX XX XX, 04 XXX XX XX ou 222 XX XX XX')
    )
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    replied_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Message de contact"
        verbose_name_plural = "Messages de contact"
    
    def __str__(self):
        return f"{self.name} - {self.subject}"

class WhyVidaReason(TimeStampedModel):
    """Reasons to choose VIDA clinic"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon_name = models.CharField(max_length=50)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = "Raison de choisir VIDA"
        verbose_name_plural = "Raisons de choisir VIDA"
    
    def __str__(self):
        return self.title
