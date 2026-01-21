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
from .views_medical import (
    MedicalRecordViewSet, PatientNoteViewSet, PatientDocumentViewSet,
    PathologyViewSet, OcularExaminationViewSet, PrescriptionViewSet,
    MedicalRecordVersionViewSet
)
from .views_billing import InvoiceViewSet, PaymentViewSet

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'medical-records', MedicalRecordViewSet, basename='medical-record')
router.register(r'patient-notes', PatientNoteViewSet, basename='patient-note')
router.register(r'patient-documents', PatientDocumentViewSet, basename='patient-document')
router.register(r'medical/pathologies', PathologyViewSet, basename='pathology')
router.register(r'medical/examinations', OcularExaminationViewSet, basename='ocular-examination')
router.register(r'medical/prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'medical/records', MedicalRecordVersionViewSet, basename='medical-record-version')
router.register(r'billing/invoices', InvoiceViewSet, basename='invoice')
router.register(r'billing/payments', PaymentViewSet, basename='payment')

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
    
    # Patients et Medical (ViewSets)
    path('', include(router.urls)),
]
