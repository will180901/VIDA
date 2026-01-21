import os
import uuid

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import status, viewsets, permissions
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from config.throttling import ContactRateThrottle
from .validators import validate_image_file, sanitize_filename
from .models import (
    ClinicSetting, HeroSlide, MedicalService, SocialLink, FAQ, 
    ClinicSchedule, ClinicHoliday, ContactMessage, WhyVidaReason, ConsultationFee
)
from .serializers import (
    ClinicSettingSerializer, HeroSlideSerializer, 
    MedicalServiceSerializer, SocialLinkSerializer,
    FAQSerializer, ClinicScheduleSerializer, ClinicHolidaySerializer,
    ContactMessageSerializer, WhyVidaReasonSerializer, ConsultationFeeSerializer
)

class ClinicSettingViewSet(viewsets.ModelViewSet):
    queryset = ClinicSetting.objects.all()
    serializer_class = ClinicSettingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def list(self, request, *args, **kwargs):
        instance = ClinicSetting.objects.first()
        if not instance:
            return Response({})
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_object(self):
        instance = ClinicSetting.objects.first()
        if not instance:
            instance = ClinicSetting.objects.create()
        return instance

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class HeroSlideViewSet(viewsets.ModelViewSet):
    queryset = HeroSlide.objects.all().order_by('order')
    serializer_class = HeroSlideSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

class MedicalServiceViewSet(viewsets.ModelViewSet):
    queryset = MedicalService.objects.all().order_by('order')
    serializer_class = MedicalServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

class SocialLinkViewSet(viewsets.ModelViewSet):
    queryset = SocialLink.objects.all().order_by('order')
    serializer_class = SocialLinkSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all().order_by('order')
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

class ClinicScheduleViewSet(viewsets.ModelViewSet):
    queryset = ClinicSchedule.objects.all()
    serializer_class = ClinicScheduleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

class ClinicHolidayViewSet(viewsets.ModelViewSet):
    queryset = ClinicHoliday.objects.all()
    serializer_class = ClinicHolidaySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, FormParser, MultiPartParser]


class MediaUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    ALLOWED_DIRS = {"hero", "services"}

    def post(self, request, *args, **kwargs):
        file = request.FILES.get("file")
        upload_dir = request.data.get("dir", "")

        if upload_dir not in self.ALLOWED_DIRS:
            return Response(
                {"detail": "Invalid dir. Use hero or services."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if not file:
            return Response(
                {"detail": "Missing file"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validation sécurisée du fichier
        try:
            validate_image_file(file)
        except Exception as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Nettoyer le nom de fichier
        clean_filename = sanitize_filename(file.name)
        
        # Ajouter un UUID pour garantir l'unicité
        name, ext = os.path.splitext(clean_filename)
        filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
        rel_path = f"{upload_dir}/{filename}"

        # Sauvegarder le fichier
        saved_path = default_storage.save(rel_path, ContentFile(file.read()))

        media_url = request.build_absolute_uri(f"/media/{saved_path}")
        return Response(
            {"path": saved_path, "url": media_url}, 
            status=status.HTTP_201_CREATED
        )


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    def get_throttles(self):
        """Appliquer throttling strict pour la création de messages"""
        if self.action == 'create':
            return [ContactRateThrottle()]
        return super().get_throttles()
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {'message': 'Message envoyé avec succès', 'data': serializer.data},
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class WhyVidaReasonViewSet(viewsets.ModelViewSet):
    queryset = WhyVidaReason.objects.filter(is_active=True).order_by('order')
    serializer_class = WhyVidaReasonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, FormParser, MultiPartParser]


class ConsultationFeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les tarifs des consultations
    - GET /consultation-fees/ : Liste tous les tarifs actifs
    - GET /consultation-fees/{id}/ : Détails d'un tarif
    - POST /consultation-fees/ : Créer un nouveau tarif (admin)
    - PUT/PATCH /consultation-fees/{id}/ : Modifier un tarif (admin)
    - DELETE /consultation-fees/{id}/ : Supprimer un tarif (admin)
    """
    queryset = ConsultationFee.objects.all().order_by('order', 'consultation_type')
    serializer_class = ConsultationFeeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    
    def get_queryset(self):
        """Filtrer pour n'afficher que les tarifs actifs pour les non-admins"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset
