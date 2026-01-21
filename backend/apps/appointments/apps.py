from django.apps import AppConfig


class AppointmentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.appointments"
    
    def ready(self):
        """Import signals when the app is ready."""
        from . import signals  # Import relatif
