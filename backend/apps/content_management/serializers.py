from rest_framework import serializers
from .models import (
    ClinicSetting, HeroSlide, MedicalService, SocialLink, FAQ, 
    ClinicSchedule, ClinicHoliday, ContactMessage, WhyVidaReason, ConsultationFee
)
from apps.users.captcha import HCaptchaMixin
from apps.users.sanitizers import sanitize_text_input
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample

class ClinicSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicSetting
        fields = '__all__'

class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = '__all__'

class MedicalServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalService
        fields = '__all__'

class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = '__all__'

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'

class ClinicScheduleSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = ClinicSchedule
        fields = ['id', 'day_of_week', 'day_name', 'is_open', 
                  'morning_start', 'morning_end', 'afternoon_start', 'afternoon_end',
                  'slot_duration']

class ClinicHolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicHoliday
        fields = ['id', 'date', 'name', 'is_recurring']

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Message de contact',
            value={
                'name': 'Jean Dupont',
                'email': 'jean.dupont@example.com',
                'phone': '06 123 45 67',
                'subject': 'Demande de renseignements',
                'message': 'Bonjour, je souhaiterais obtenir des informations sur vos services d\'ophtalmologie.',
                'captcha': 'token_hcaptcha_ici'
            },
            request_only=True,
        ),
    ]
)
class ContactMessageSerializer(HCaptchaMixin, serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 
                  'is_read', 'replied_at', 'created_at']
        read_only_fields = ['id', 'is_read', 'replied_at', 'created_at']
    
    def validate_name(self, value):
        """Sanitize name pour prévenir XSS"""
        return sanitize_text_input(value)
    
    def validate_subject(self, value):
        """Sanitize subject pour prévenir XSS"""
        return sanitize_text_input(value)
    
    def validate_message(self, value):
        """Sanitize message pour prévenir XSS"""
        if len(value) < 10:
            raise serializers.ValidationError("Message trop court (min 10 caractères)")
        return sanitize_text_input(value)
    
    def validate_email(self, value):
        if not value or '@' not in value:
            raise serializers.ValidationError("Email invalide")
        return value.strip().lower()

class WhyVidaReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhyVidaReason
        fields = ['id', 'title', 'description', 'icon_name', 'order', 'is_active']


class ConsultationFeeSerializer(serializers.ModelSerializer):
    consultation_type_display = serializers.CharField(
        source='get_consultation_type_display', 
        read_only=True
    )
    
    class Meta:
        model = ConsultationFee
        fields = [
            'id', 'consultation_type', 'consultation_type_display', 
            'price', 'description', 'is_active', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
