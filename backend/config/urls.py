"""
URL configuration for VIDA project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui-alias"),  # Alias
    
    # API v1
    path("api/v1/cms/", include("apps.content_management.urls")),
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/appointments/", include("apps.appointments.urls")),
    path("api/v1/", include("apps.notifications.urls")),
    # path("api/v1/patients/", include("apps.patients.urls")),
    # path("api/v1/optique/", include("apps.optique.urls")),
    # path("api/v1/payments/", include("apps.payments.urls")),
]

# Debug toolbar (development only)
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path("__debug__/", include(debug_toolbar.urls)),
    ] + urlpatterns
    
    # Serve media files in development
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
