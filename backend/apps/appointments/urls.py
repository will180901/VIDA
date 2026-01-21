from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, AppointmentRequestViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointments')
router.register(r'appointments/request', AppointmentRequestViewSet, basename='appointment-request')

urlpatterns = [
    path('', include(router.urls)),
]
