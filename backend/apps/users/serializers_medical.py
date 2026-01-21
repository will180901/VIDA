"""
Serializers pour les dossiers médicaux
"""

from rest_framework import serializers
from .models_medical import (
    MedicalRecord, PatientNote, PatientDocument,
    Pathology, OcularExamination, Prescription, PrescriptionItem,
    MedicalRecordVersion
)
from .serializers import UserSerializer


class MedicalRecordSerializer(serializers.ModelSerializer):
    """Serializer pour les dossiers médicaux"""
    
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = [
            'id',
            'patient',
            'patient_name',
            'blood_group',
            'allergies',
            'medical_history',
            'chronic_conditions',
            'current_treatments',
            'vision_left',
            'vision_right',
            'intraocular_pressure_left',
            'intraocular_pressure_right',
            'medical_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'patient', 'patient_name', 'created_at', 'updated_at']


class PatientNoteSerializer(serializers.ModelSerializer):
    """Serializer pour les notes patients"""
    
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    
    class Meta:
        model = PatientNote
        fields = [
            'id',
            'patient',
            'patient_name',
            'author',
            'author_name',
            'content',
            'is_important',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'patient', 'patient_name', 'author', 'author_name', 'created_at', 'updated_at']


class PatientDocumentSerializer(serializers.ModelSerializer):
    """Serializer pour les documents patients"""
    
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    file_size = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientDocument
        fields = [
            'id',
            'patient',
            'patient_name',
            'title',
            'category',
            'file',
            'file_url',
            'file_size',
            'file_extension',
            'description',
            'uploaded_by',
            'uploaded_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'patient', 'patient_name', 'uploaded_by', 'uploaded_by_name', 'created_at']
    
    def get_file_url(self, obj):
        """Retourne l'URL complète du fichier"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


# ============================================================================
# MEDICAL PATHOLOGY SERIALIZERS
# ============================================================================

class PathologySerializer(serializers.ModelSerializer):
    """Serializer lecture seule pour les pathologies ophtalmologiques."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Pathology
        fields = [
            'id', 'code_cim10', 'name', 'category', 'category_display',
            'description', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================================================================
# OCULAR EXAMINATION SERIALIZERS
# ============================================================================

class OcularExaminationSerializer(serializers.ModelSerializer):
    """Serializer pour les examens ophtalmologiques."""
    examiner_name = serializers.CharField(source='examiner.get_full_name', read_only=True)
    iop_method_display = serializers.CharField(source='get_iop_method_display', read_only=True)
    stereopsis_display = serializers.CharField(source='get_stereopsis_display', read_only=True)
    
    class Meta:
        model = OcularExamination
        fields = [
            # Identifiants
            'id', 'medical_record', 'exam_date',
            
            # Acuité Visuelle Loin
            'av_od_loin', 'av_og_loin', 'av_od_loin_corrected', 'av_og_loin_corrected',
            
            # Acuité Visuelle Près
            'av_od_pres', 'av_og_pres', 'av_od_pres_corrected', 'av_og_pres_corrected',
            
            # Réfraction OD
            'refraction_od_sphere', 'refraction_od_cylindre', 'refraction_od_axis',
            
            # Réfraction OG
            'refraction_og_sphere', 'refraction_og_cylindre', 'refraction_og_axis',
            
            # Tonométrie
            'iop_od', 'iop_og', 'iop_method', 'iop_method_display',
            
            # Biomiscroscopie
            'biomicroscopy_od', 'biomicroscopy_og',
            
            # Fond d'œil
            'fundus_od', 'fundus_og',
            
            # Stéréopsie
            'stereopsis', 'stereopsis_display',
            
            # Vision des couleurs
            'color_vision_od', 'color_vision_og',
            
            # Motilité oculaire
            'motility',
            
            # Test de Schirmer
            'schirmer_od', 'schirmer_og',
            
            # Réflexe pupillaire
            'pupillary_reflex_od', 'pupillary_reflex_og',
            
            # Métadonnées
            'notes', 'examiner', 'examiner_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OcularExaminationCreateSerializer(OcularExaminationSerializer):
    """Serializer simplifié pour créer un examen."""
    
    class Meta(OcularExaminationSerializer.Meta):
        fields = [
            'medical_record',
            # Acuité Visuelle Loin
            'av_od_loin', 'av_og_loin', 'av_od_loin_corrected', 'av_og_loin_corrected',
            # Acuité Visuelle Près
            'av_od_pres', 'av_og_pres', 'av_od_pres_corrected', 'av_og_pres_corrected',
            # Réfraction OD
            'refraction_od_sphere', 'refraction_od_cylindre', 'refraction_od_axis',
            # Réfraction OG
            'refraction_og_sphere', 'refraction_og_cylindre', 'refraction_og_axis',
            # Tonométrie
            'iop_od', 'iop_og', 'iop_method',
            # Biomiscroscopie
            'biomicroscopy_od', 'biomicroscopy_og',
            # Fond d'œil
            'fundus_od', 'fundus_og',
            # Stéréopsie
            'stereopsis',
            # Vision des couleurs
            'color_vision_od', 'color_vision_og',
            # Motilité oculaire
            'motility',
            # Test de Schirmer
            'schirmer_od', 'schirmer_og',
            # Réflexe pupillaire
            'pupillary_reflex_od', 'pupillary_reflex_og',
            # Notes et métadonnées
            'notes', 'exam_date'
        ]


# ============================================================================
# PRESCRIPTION SERIALIZERS
# ============================================================================

class PrescriptionItemSerializer(serializers.ModelSerializer):
    """Serializer pour les items d'ordonnance."""
    eye_display = serializers.CharField(source='get_eye_display', read_only=True)
    
    class Meta:
        model = PrescriptionItem
        fields = [
            'id', 'prescription', 'medication_name', 'dosage', 'duration',
            'quantity', 'instructions', 'eye', 'eye_display'
        ]
        read_only_fields = ['id']


class PrescriptionItemCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un item d'ordonnance."""
    
    class Meta:
        model = PrescriptionItem
        fields = ['medication_name', 'dosage', 'duration', 'quantity', 'instructions', 'eye']


class PrescriptionSerializer(serializers.ModelSerializer):
    """Serializer pour les ordonnances."""
    prescriber_name = serializers.CharField(source='prescriber.get_full_name', read_only=True)
    items = PrescriptionItemSerializer(many=True, read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'medical_record', 'prescription_date', 'valid_until',
            'is_valid', 'prescriber', 'prescriber_name', 'notes',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PrescriptionCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une ordonnance avec items imbriqués."""
    items = PrescriptionItemCreateSerializer(many=True, required=False)
    
    class Meta:
        model = Prescription
        fields = ['medical_record', 'prescription_date', 'valid_until', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        request = self.context.get('request')
        
        # Assigner le prescriber (utilisateur actuel)
        if request and request.user.is_authenticated:
            validated_data['prescriber'] = request.user
        
        prescription = Prescription.objects.create(**validated_data)
        
        # Créer les items
        for item_data in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item_data)
        
        return prescription


# ============================================================================
# MEDICAL RECORD VERSION SERIALIZERS
# ============================================================================

class PathologySimpleSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les pathologies (utilisé dans MedicalRecordVersion)."""
    
    class Meta:
        model = Pathology
        fields = ['id', 'code_cim10', 'name', 'category']


class OcularExaminationSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les examens (utilisé dans MedicalRecordVersion)."""
    
    class Meta:
        model = OcularExamination
        fields = ['id', 'exam_date', 'iop_od', 'iop_og']


class MedicalRecordVersionSerializer(serializers.ModelSerializer):
    """Serializer pour les versions du dossier médical."""
    examiner_name = serializers.CharField(source='examiner.get_full_name', read_only=True)
    pathologies = PathologySimpleSerializer(many=True, read_only=True)
    ocular_examination = OcularExaminationSimpleSerializer(read_only=True)
    
    class Meta:
        model = MedicalRecordVersion
        fields = [
            'id', 'medical_record', 'version_number', 'consultation_date',
            'chief_complaint', 'history', 'diagnosis', 'treatment_plan',
            'exam_findings', 'pathologies', 'ocular_examination',
            'examiner', 'examiner_name', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'version_number', 'created_at']


class MedicalRecordVersionCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une version du dossier médical."""
    pathology_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = MedicalRecordVersion
        fields = [
            'medical_record', 'consultation_date',
            'chief_complaint', 'history', 'diagnosis', 'treatment_plan',
            'exam_findings', 'ocular_examination', 'notes', 'pathology_ids'
        ]
    
    def create(self, validated_data):
        pathology_ids = validated_data.pop('pathology_ids', [])
        request = self.context.get('request')
        
        # Assigner l'examiner (utilisateur actuel)
        if request and request.user.is_authenticated:
            validated_data['examiner'] = request.user
        
        # Calculer le numéro de version
        last_version = MedicalRecordVersion.objects.filter(
            medical_record=validated_data['medical_record']
        ).order_by('-version_number').first()
        
        new_version_number = 1 if not last_version else last_version.version_number + 1
        validated_data['version_number'] = new_version_number
        
        # Créer la version
        version = MedicalRecordVersion.objects.create(**validated_data)
        
        # Ajouter les pathologies
        if pathology_ids:
            pathologies = Pathology.objects.filter(id__in=pathology_ids)
            version.pathologies.set(pathologies)
        
        return version
