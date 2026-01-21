"""
Modèles pour les dossiers médicaux des patients
"""

from django.db import models
from django.core.validators import MinLengthValidator
from django.utils import timezone
import uuid
from .models import User


class MedicalRecord(models.Model):
    """
    Dossier médical d'un patient
    """
    
    BLOOD_GROUPS = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]
    
    patient = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='medical_record',
        verbose_name='Patient'
    )
    
    # Informations de base
    blood_group = models.CharField(
        max_length=3,
        choices=BLOOD_GROUPS,
        blank=True,
        null=True,
        verbose_name='Groupe sanguin'
    )
    
    # Allergies
    allergies = models.TextField(
        blank=True,
        verbose_name='Allergies connues',
        help_text='Liste des allergies (médicaments, aliments, etc.)'
    )
    
    # Antécédents médicaux
    medical_history = models.TextField(
        blank=True,
        verbose_name='Antécédents médicaux',
        help_text='Historique médical du patient'
    )
    
    # Pathologies chroniques
    chronic_conditions = models.TextField(
        blank=True,
        verbose_name='Pathologies chroniques',
        help_text='Maladies chroniques actuelles'
    )
    
    # Traitements en cours
    current_treatments = models.TextField(
        blank=True,
        verbose_name='Traitements en cours',
        help_text='Médicaments et traitements actuels'
    )
    
    # Informations ophtalmologiques spécifiques
    vision_left = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Acuité visuelle œil gauche'
    )
    
    vision_right = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Acuité visuelle œil droit'
    )
    
    intraocular_pressure_left = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Pression intraoculaire gauche (mmHg)'
    )
    
    intraocular_pressure_right = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Pression intraoculaire droite (mmHg)'
    )
    
    # Notes médicales
    medical_notes = models.TextField(
        blank=True,
        verbose_name='Notes médicales',
        help_text='Notes confidentielles du médecin'
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Modifié le')
    
    class Meta:
        verbose_name = 'Dossier médical'
        verbose_name_plural = 'Dossiers médicaux'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Dossier médical de {self.patient.get_full_name()}"


class PatientNote(models.Model):
    """
    Notes internes sur un patient (visibles uniquement par le personnel médical)
    """
    
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notes',
        verbose_name='Patient'
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='authored_notes',
        verbose_name='Auteur'
    )
    
    content = models.TextField(
        verbose_name='Contenu',
        validators=[MinLengthValidator(5)]
    )
    
    is_important = models.BooleanField(
        default=False,
        verbose_name='Important'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Modifié le')
    
    class Meta:
        verbose_name = 'Note patient'
        verbose_name_plural = 'Notes patients'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note de {self.author} sur {self.patient.get_full_name()}"


class PatientDocument(models.Model):
    """
    Documents médicaux d'un patient
    """
    
    DOCUMENT_CATEGORIES = [
        ('prescription', 'Ordonnance'),
        ('exam', 'Examen médical'),
        ('report', 'Compte-rendu'),
        ('invoice', 'Facture'),
        ('consent', 'Consentement'),
        ('other', 'Autre'),
    ]
    
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='Patient'
    )
    
    title = models.CharField(
        max_length=255,
        verbose_name='Titre'
    )
    
    category = models.CharField(
        max_length=20,
        choices=DOCUMENT_CATEGORIES,
        default='other',
        verbose_name='Catégorie'
    )
    
    file = models.FileField(
        upload_to='patient_documents/%Y/%m/',
        verbose_name='Fichier'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Description'
    )
    
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents',
        verbose_name='Uploadé par'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')
    
    class Meta:
        verbose_name = 'Document patient'
        verbose_name_plural = 'Documents patients'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.patient.get_full_name()}"
    
    @property
    def file_size(self):
        """Retourne la taille du fichier en Mo"""
        if self.file:
            return round(self.file.size / (1024 * 1024), 2)
        return 0
    
    @property
    def file_extension(self):
        """Retourne l'extension du fichier"""
        if self.file:
            return self.file.name.split('.')[-1].upper()
        return ''


class Pathology(models.Model):
    """
    Pathologie ophtalmologique avec code CIM-10.
    Stockage structuré pour permettre recherche et statistiques.
    """
    CATEGORY_CHOICES = [
        ('cornea', 'Maladies de la cornée'),
        ('lens', 'Maladies du cristallin'),
        ('uvea', 'Maladies de l\'uvée'),
        ('glaucoma', 'Glaucome'),
        ('retina', 'Maladies de la rétine'),
        ('optic_nerve', 'Maladies du nerf optique'),
        ('orbit', 'Maladies de l\'orbite'),
        ('refraction', 'Troubles de la réfraction'),
        ('amblyopia', 'Amblyopie'),
        ('diplopia', 'Diplopie'),
        ('other', 'Autre'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code_cim10 = models.CharField(
        "Code CIM-10",
        max_length=10,
        unique=True,
        help_text="Code selon la classification internationale des maladies"
    )
    name = models.CharField("Nom de la pathologie", max_length=200)
    category = models.CharField(
        "Catégorie",
        max_length=50,
        choices=CATEGORY_CHOICES
    )
    description = models.TextField("Description", null=True, blank=True)
    is_active = models.BooleanField("Active", default=True)
    created_at = models.DateTimeField("Créé le", auto_now_add=True)
    updated_at = models.DateTimeField("Modifié le", auto_now=True)
    
    class Meta:
        verbose_name = "Pathologie"
        verbose_name_plural = "Pathologies"
        ordering = ['code_cim10']
    
    def __str__(self):
        return f"{self.code_cim10} - {self.name}"


class OcularExamination(models.Model):
    """
    Examen ophtalmologique complet - 10 examens standardisés.
    """
    IOP_METHOD_CHOICES = [
        ('applanation', 'Tonométrie à applanation'),
        ('indentation', 'Tonométrie par indentation'),
        ('air_puff', 'Tonométrie à jet d\'air'),
        ('icare', 'Tonomètre ICare'),
    ]
    
    STEREOPSIS_CHOICES = [
        ('normal', 'Normale'),
        ('reduced', 'Réduite'),
        ('absent', 'Absente'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(
        'MedicalRecord',
        on_delete=models.CASCADE,
        related_name='ocular_examinations'
    )
    
    # === Acuité Visuelle de Loin ===
    av_od_loin = models.DecimalField(
        "AV OD Loin",
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Échelle Snellen (ex: 10/10)"
    )
    av_og_loin = models.DecimalField(
        "AV OG Loin",
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    av_od_loin_corrected = models.DecimalField(
        "AV OD Loin corrigée",
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    av_og_loin_corrected = models.DecimalField(
        "AV OG Loin corrigée",
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # === Acuité Visuelle de Près ===
    av_od_pres = models.DecimalField(
        "AV OD Près",
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Échelle Parinaud (ex: P2)"
    )
    av_og_pres = models.DecimalField(
        "AV OG Près",
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    av_od_pres_corrected = models.DecimalField(
        "AV OD Près corrigée",
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    av_og_pres_corrected = models.DecimalField(
        "AV OG Près corrigée",
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # === Réfraction ===
    refraction_od_sphere = models.DecimalField(
        "Réfraction OD Sphère",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="En dioptries (ex: -2.00)"
    )
    refraction_od_cylindre = models.DecimalField(
        "Réfraction OD Cylindre",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    refraction_od_axis = models.IntegerField(
        "Réfraction OD Axe",
        null=True,
        blank=True,
        help_text="En degrés (0-180)"
    )
    refraction_og_sphere = models.DecimalField(
        "Réfraction OG Sphère",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    refraction_og_cylindre = models.DecimalField(
        "Réfraction OG Cylindre",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    refraction_og_axis = models.IntegerField(
        "Réfraction OG Axe",
        null=True,
        blank=True
    )
    
    # === Tonométrie ===
    iop_od = models.DecimalField(
        "IOP OD",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="En mmHg (valeur normale: 10-21)"
    )
    iop_og = models.DecimalField(
        "IOP OG",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    iop_method = models.CharField(
        "Méthode de mesure",
        max_length=50,
        choices=IOP_METHOD_CHOICES,
        null=True,
        blank=True
    )
    
    # === Biomiscroscopie ===
    biomicroscopy_od = models.TextField(
        "Biomicroscopie OD",
        null=True,
        blank=True
    )
    biomicroscopy_og = models.TextField(
        "Biomicroscopie OG",
        null=True,
        blank=True
    )
    
    # === Fond d'œil ===
    fundus_od = models.TextField(
        "Fond d'œil OD",
        null=True,
        blank=True
    )
    fundus_og = models.TextField(
        "Fond d'œil OG",
        null=True,
        blank=True
    )
    
    # === Stéréopsie (Lang) ===
    stereopsis = models.CharField(
        "Stéréopsie",
        max_length=20,
        choices=STEREOPSIS_CHOICES,
        null=True,
        blank=True
    )
    
    # === Vision des couleurs (Ishihara) ===
    color_vision_od = models.BooleanField(
        "Anomalie vision couleurs OD",
        default=False
    )
    color_vision_og = models.BooleanField(
        "Anomalie vision couleurs OG",
        default=False
    )
    
    # === Motilité oculaire ===
    motility = models.TextField(
        "Motilité oculaire",
        null=True,
        blank=True
    )
    
    # === Test de Schirmer ===
    schirmer_od = models.DecimalField(
        "Schirmer OD",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="En mm/5min (valeur normale: >10)"
    )
    schirmer_og = models.DecimalField(
        "Schirmer OG",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # === Réflexe pupillaire ===
    pupillary_reflex_od = models.BooleanField(
        "Réflexe pupillaire OD normal",
        default=True
    )
    pupillary_reflex_og = models.BooleanField(
        "Réflexe pupillaire OG normal",
        default=True
    )
    
    # === Notes et métadonnées ===
    notes = models.TextField(
        "Notes additionnelles",
        null=True,
        blank=True
    )
    exam_date = models.DateField(
        "Date de l'examen",
        default=timezone.now
    )
    examiner = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='examinations_done'
    )
    created_at = models.DateTimeField("Créé le", auto_now_add=True)
    updated_at = models.DateTimeField("Modifié le", auto_now=True)
    
    class Meta:
        verbose_name = "Examen ophtalmologique"
        verbose_name_plural = "Examens ophtalmologiques"
        ordering = ['-exam_date']
    
    def __str__(self):
        return f"Examen du {self.exam_date} - Dossier #{self.medical_record.id}"


class Prescription(models.Model):
    """
    Ordonnance médicale liée à une consultation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(
        'MedicalRecord',
        on_delete=models.CASCADE,
        related_name='prescriptions'
    )
    prescription_date = models.DateField("Date", default=timezone.now)
    valid_until = models.DateField("Valide jusqu'au", null=True, blank=True)
    notes = models.TextField("Notes", null=True, blank=True)
    is_valid = models.BooleanField("Valide", default=True)
    prescriber = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='prescriptions_made'
    )
    created_at = models.DateTimeField("Créé le", auto_now_add=True)
    updated_at = models.DateTimeField("Modifié le", auto_now=True)
    
    class Meta:
        verbose_name = "Ordonnance"
        verbose_name_plural = "Ordonnances"
        ordering = ['-prescription_date']
    
    def __str__(self):
        return f"Ordonnance #{self.id} - {self.prescription_date}"


class PrescriptionItem(models.Model):
    """
    Item d'ordonnance - un médicament prescrit.
    """
    EYE_CHOICES = [
        ('OD', 'Œil Droit'),
        ('OG', 'Œil Gauche'),
        ('OU', 'Les Deux'),
        ('OS', 'Œil Spécifique'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name='items'
    )
    medication_name = models.CharField("Médicament", max_length=200)
    dosage = models.CharField("Dosage", max_length=100, help_text="Ex: 1 goutte 2x/jour")
    duration = models.CharField("Durée", max_length=100, help_text="Ex: 10 jours")
    quantity = models.PositiveIntegerField("Quantité", default=1)
    instructions = models.TextField("Instructions", null=True, blank=True)
    eye = models.CharField("Œil", max_length=10, choices=EYE_CHOICES, default='OU')
    
    class Meta:
        verbose_name = "Item d'ordonnance"
        verbose_name_plural = "Items d'ordonnance"
    
    def __str__(self):
        return f"{self.medication_name} - {self.dosage}"


class MedicalRecordVersion(models.Model):
    """
    Version historisée d'un dossier médical.
    Chaque consultation crée une nouvelle version.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(
        'MedicalRecord',
        on_delete=models.CASCADE,
        related_name='versions'
    )
    version_number = models.PositiveIntegerField("Numéro de version")
    consultation_date = models.DateField("Date de consultation")
    chief_complaint = models.TextField(
        "Motif de consultation",
        help_text="Raison de la visite"
    )
    history = models.TextField(
        "Interrogatoire",
        null=True,
        blank=True,
        help_text="Antécédents et plainte actuelle"
    )
    diagnosis = models.TextField(
        "Diagnostic",
        null=True,
        blank=True
    )
    treatment_plan = models.TextField(
        "Plan de traitement",
        null=True,
        blank=True
    )
    exam_findings = models.JSONField(
        "Résultats d'examen",
        default=dict,
        null=True,
        blank=True
    )
    # Relations
    pathologies = models.ManyToManyField(
        'Pathology',
        related_name='record_versions',
        blank=True
    )
    ocular_examination = models.ForeignKey(
        'OcularExamination',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='record_versions'
    )
    examiner = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='consultations_done'
    )
    notes = models.TextField(
        "Notes privées",
        null=True,
        blank=True,
        help_text="Notes internes (non visibles au patient)"
    )
    created_at = models.DateTimeField("Créé le", auto_now_add=True)
    
    class Meta:
        verbose_name = "Version du dossier médical"
        verbose_name_plural = "Versions du dossier médical"
        ordering = ['-consultation_date']
        unique_together = [['medical_record', 'version_number']]
    
    def __str__(self):
        return f"Dossier #{self.medical_record.id} - V{self.version_number} ({self.consultation_date})"
    
    @classmethod
    def create_new_version(cls, medical_record, data):
        """Crée une nouvelle version du dossier."""
        last_version = cls.objects.filter(
            medical_record=medical_record
        ).order_by('-version_number').first()
        
        new_version_number = 1 if not last_version else last_version.version_number + 1
        
        return cls.objects.create(
            medical_record=medical_record,
            version_number=new_version_number,
            consultation_date=data.get('consultation_date', timezone.now().date()),
            chief_complaint=data.get('chief_complaint', ''),
            history=data.get('history', ''),
            diagnosis=data.get('diagnosis', ''),
            treatment_plan=data.get('treatment_plan', ''),
            exam_findings=data.get('exam_findings', {}),
            ocular_examination=data.get('ocular_examination'),
            examiner=data.get('examiner'),
            notes=data.get('notes', ''),
        )
