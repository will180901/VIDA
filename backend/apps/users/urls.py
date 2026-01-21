from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenVerifyView
from .views_secure import (
    SecureTokenObtainPairView,
    SecureTokenRefreshView,
    SecureLogoutView,
    SecureRegisterView,
    PasswordStrengthView,
    ProfileView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    VerifyEmailView,
)
from .views_patients import PatientViewSet

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')

urlpatterns = [
    # Auth sécurisée avec cookies httpOnly
    path('login/', SecureTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', SecureTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', SecureLogoutView.as_view(), name='logout'),
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Inscription
    path('register/', SecureRegisterView.as_view(), name='register'),
    
    # Profil
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # Mot de passe
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password-strength/', PasswordStrengthView.as_view(), name='password_strength'),
    
    # Email
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    
    # Patients (ViewSet)
    path('', include(router.urls)),
]
