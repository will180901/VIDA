from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClinicSettingViewSet, HeroSlideViewSet, 
    MedicalServiceViewSet, SocialLinkViewSet,
    FAQViewSet, ClinicScheduleViewSet, ClinicHolidayViewSet,
    ContactMessageViewSet, WhyVidaReasonViewSet, ConsultationFeeViewSet,
    MediaUploadView
)

router = DefaultRouter()
router.register(r'settings', ClinicSettingViewSet, basename='clinic-settings')
router.register(r'hero-slides', HeroSlideViewSet, basename='hero-slides')
router.register(r'services', MedicalServiceViewSet, basename='medical-services')
router.register(r'social-links', SocialLinkViewSet, basename='social-links')
router.register(r'faqs', FAQViewSet, basename='faqs')
router.register(r'schedules', ClinicScheduleViewSet, basename='schedules')
router.register(r'holidays', ClinicHolidayViewSet, basename='holidays')
router.register(r'contact-messages', ContactMessageViewSet, basename='contact-messages')
router.register(r'why-vida-reasons', WhyVidaReasonViewSet, basename='why-vida-reasons')
router.register(r'consultation-fees', ConsultationFeeViewSet, basename='consultation-fees')

urlpatterns = [
    path('media/upload/', MediaUploadView.as_view(), name='media-upload'),
    path('', include(router.urls)),
]
