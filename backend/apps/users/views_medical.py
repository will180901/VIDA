"""
Vues API pour les dossiers médicaux
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db import models

from .models import User
from .models_medical import (
    MedicalRecord, PatientNote, PatientDocument,
    Pathology, OcularExamination, Prescription, PrescriptionItem,
    MedicalRecordVersion
)
from .serializers_medical import (
    MedicalRecordSerializer,
    PatientNoteSerializer,
    PatientDocumentSerializer,
    PathologySerializer,
    OcularExaminationSerializer,
    OcularExaminationCreateSerializer,
    PrescriptionSerializer,
    PrescriptionCreateSerializer,
    PrescriptionItemSerializer,
    MedicalRecordVersionSerializer,
    MedicalRecordVersionCreateSerializer
)
from .permissions import IsStaffOrAdmin


class MedicalRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les dossiers médicaux
    
    Endpoints:
    - GET /api/v1/medical-records/ - Liste des dossiers
    - GET /api/v1/medical-records/{id}/ - Détails d'un dossier
    - POST /api/v1/medical-records/ - Créer un dossier
    - PATCH /api/v1/medical-records/{id}/ - Modifier un dossier
    - GET /api/v1/medical-records/by-patient/{patient_id}/ - Dossier d'un patient
    """
    
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    
    def get_queryset(self):
        return MedicalRecord.objects.select_related('patient').all()
    
    @action(detail=False, methods=['get'], url_path='by-patient/(?P<patient_id>[^/.]+)')
    def by_patient(self, request, patient_id=None):
        """
        Récupère ou crée le dossier médical d'un patient
        """
        patient = get_object_or_404(User, id=patient_id, role=User.Role.PATIENT)
        
        # Créer le dossier s'il n'existe pas
        medical_record, created = MedicalRecord.objects.get_or_create(patient=patient)
        
        serializer = self.get_serializer(medical_record)
        return Response({
            'medical_record': serializer.data,
            'created': created
        })


class PatientNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les notes patients
    
    Endpoints:
    - GET /api/v1/patient-notes/ - Liste des notes
    - GET /api/v1/patient-notes/{id}/ - Détails d'une note
    - POST /api/v1/patient-notes/ - Créer une note
    - PATCH /api/v1/patient-notes/{id}/ - Modifier une note
    - DELETE /api/v1/patient-notes/{id}/ - Supprimer une note
    - GET /api/v1/patient-notes/by-patient/{patient_id}/ - Notes d'un patient
    """
    
    serializer_class = PatientNoteSerializer
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    
    def get_queryset(self):
        return PatientNote.objects.select_related('patient', 'author').all()
    
    def perform_create(self, serializer):
        """Définir l'auteur automatiquement"""
        serializer.save(author=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='by-patient/(?P<patient_id>[^/.]+)')
    def by_patient(self, request, patient_id=None):
        """
        Récupère toutes les notes d'un patient
        """
        patient = get_object_or_404(User, id=patient_id, role=User.Role.PATIENT)
        notes = PatientNote.objects.filter(patient=patient).select_related('author')
        
        serializer = self.get_serializer(notes, many=True)
        return Response({
            'notes': serializer.data,
            'total': notes.count()
        })


class PatientDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les documents patients
    
    Endpoints:
    - GET /api/v1/patient-documents/ - Liste des documents
    - GET /api/v1/patient-documents/{id}/ - Détails d'un document
    - POST /api/v1/patient-documents/ - Upload un document
    - PATCH /api/v1/patient-documents/{id}/ - Modifier un document
    - DELETE /api/v1/patient-documents/{id}/ - Supprimer un document
    - GET /api/v1/patient-documents/by-patient/{patient_id}/ - Documents d'un patient
    """
    
    serializer_class = PatientDocumentSerializer
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return PatientDocument.objects.select_related('patient', 'uploaded_by').all()
    
    def perform_create(self, serializer):
        """Définir l'uploader automatiquement"""
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='by-patient/(?P<patient_id>[^/.]+)')
    def by_patient(self, request, patient_id=None):
        """
        Récupère tous les documents d'un patient
        """
        patient = get_object_or_404(User, id=patient_id, role=User.Role.PATIENT)
        documents = PatientDocument.objects.filter(patient=patient).select_related('uploaded_by')
        
        # Filtrer par catégorie si spécifié
        category = request.query_params.get('category', None)
        if category:
            documents = documents.filter(category=category)
        
        serializer = self.get_serializer(documents, many=True, context={'request': request})
        return Response({
            'documents': serializer.data,
            'total': documents.count()
        })


# ============================================================================
# PATHOLOGY VIEWSET
# ============================================================================

class PathologyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet lecture seule pour les pathologies ophtalmologiques (CIM-10)
    
    Endpoints:
    - GET /api/v1/medical/pathologies/ - Liste des pathologies
    - GET /api/v1/medical/pathologies/{id}/ - Détails d'une pathologie
    """
    
    queryset = Pathology.objects.filter(is_active=True)
    serializer_class = PathologySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer les pathologies actives"""
        queryset = Pathology.objects.filter(is_active=True)
        
        # Filtrer par catégorie si spécifié
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Recherche par nom ou code
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(code_cim10__icontains=search)
            )
        
        return queryset.order_by('code_cim10')


# ============================================================================
# OCULAR EXAMINATION VIEWSET
# ============================================================================

class OcularExaminationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les examens ophtalmologiques
    
    Endpoints:
    - GET /api/v1/medical/examinations/ - Liste des examens
    - GET /api/v1/medical/examinations/{id}/ - Détails d'un examen
    - POST /api/v1/medical/examinations/ - Créer un examen
    - PATCH /api/v1/medical/examinations/{id}/ - Modifier un examen
    - GET /api/v1/medical/examinations/by-record/{record_id}/ - Examens d'un dossier
    """
    
    serializer_class = OcularExaminationSerializer
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OcularExaminationCreateSerializer
        return OcularExaminationSerializer
    
    def get_queryset(self):
        return OcularExamination.objects.select_related('medical_record', 'examiner').all()
    
    def perform_create(self, serializer):
        """Définir l'examinateur automatiquement"""
        serializer.save(examiner=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='by-record/(?P<record_id>[^/.]+)')
    def by_record(self, request, record_id=None):
        """
        Récupère tous les examens d'un dossier médical
        """
        record = get_object_or_404(MedicalRecord, id=record_id)
        examinations = OcularExamination.objects.filter(
            medical_record=record
        ).select_related('examiner').order_by('-exam_date')
        
        serializer = self.get_serializer(examinations, many=True)
        return Response({
            'examinations': serializer.data,
            'total': examinations.count()
        })


# ============================================================================
# PRESCRIPTION VIEWSET
# ============================================================================

class PrescriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les ordonnances médicales
    
    Endpoints:
    - GET /api/v1/medical/prescriptions/ - Liste des ordonnances
    - GET /api/v1/medical/prescriptions/{id}/ - Détails d'une ordonnance
    - POST /api/v1/medical/prescriptions/ - Créer une ordonnance
    - PATCH /api/v1/medical/prescriptions/{id}/ - Modifier une ordonnance
    - GET /api/v1/medical/prescriptions/by-record/{record_id}/ - Ordonnances d'un dossier
    """
    
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PrescriptionCreateSerializer
        return PrescriptionSerializer
    
    def get_queryset(self):
        return Prescription.objects.select_related('medical_record', 'prescriber').prefetch_related('items').all()
    
    def perform_create(self, serializer):
        """Le prescriber est déjà défini dans le serializer"""
        pass
    
    @action(detail=False, methods=['get'], url_path='by-record/(?P<record_id>[^/.]+)')
    def by_record(self, request, record_id=None):
        """
        Récupère toutes les ordonnances d'un dossier médical
        """
        record = get_object_or_404(MedicalRecord, id=record_id)
        prescriptions = Prescription.objects.filter(
            medical_record=record
        ).select_related('prescriber').prefetch_related('items').order_by('-prescription_date')
        
        serializer = self.get_serializer(prescriptions, many=True)
        return Response({
            'prescriptions': serializer.data,
            'total': prescriptions.count()
        })


# ============================================================================
# MEDICAL RECORD VERSION VIEWSET
# ============================================================================

class MedicalRecordVersionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les versions du dossier médical
    
    Endpoints:
    - GET /api/v1/medical/records/{patient_id}/versions/ - Versions d'un dossier
    - POST /api/v1/medical/records/{patient_id}/versions/ - Créer une version
    - GET /api/v1/medical/records/{patient_id}/versions/{id}/ - Détails d'une version
    """
    
    serializer_class = MedicalRecordVersionSerializer
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MedicalRecordVersionCreateSerializer
        return MedicalRecordVersionSerializer
    
    def get_queryset(self):
        return MedicalRecordVersion.objects.select_related(
            'medical_record', 'examiner'
        ).prefetch_related('pathologies', 'ocular_examination').all()
    
    def perform_create(self, serializer):
        """L'examiner est déjà défini dans le serializer"""
        pass
    
    @action(detail=False, methods=['get', 'post'], url_path='by-record/(?P<record_id>[^/.]+)')
    def by_record(self, request, record_id=None):
        """
        Récupère ou crée les versions d'un dossier médical
        """
        record = get_object_or_404(MedicalRecord, id=record_id)
        
        if request.method == 'GET':
            versions = MedicalRecordVersion.objects.filter(
                medical_record=record
            ).select_related('examiner').prefetch_related('pathologies', 'ocular_examination').order_by('-consultation_date')
            
            serializer = self.get_serializer(versions, many=True)
            return Response({
                'versions': serializer.data,
                'total': versions.count()
            })
        
        elif request.method == 'POST':
            # Ajouter l'enregistrement à la requête
            request.data['medical_record'] = record_id
            serializer = self.get_serializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                version = serializer.save()
                output_serializer = self.get_serializer(version)
                return Response({
                    'success': True,
                    'message': 'Version créée avec succès.',
                    'data': output_serializer.data
                }, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """
        Récupère les détails complets d'une version avec toutes les données imbriquées
        """
        version = self.get_object()
        serializer = self.get_serializer(version)
        return Response(serializer.data)
