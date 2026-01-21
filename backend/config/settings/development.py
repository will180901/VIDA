"""
Django development settings for VIDA project.
"""

from .base import *

# SECURITY
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

# Database - Use SQLite for local development if Postgres is not available
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Cache (Local memory for dev - Redis not required)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

# Throttling activé temporairement pour tester
# Décommenter les lignes ci-dessous pour désactiver en dev
# REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []
# REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {}

# Celery
CELERY_BROKER_URL = config("CELERY_BROKER_URL", default="redis://localhost:6379/1")

# Channels (WebSocket)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [config("REDIS_URL", default="redis://localhost:6379/2")],
        },
    },
}

# CORS - Allow frontend dev server
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# CSRF - Allow frontend dev server
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Cookies - Désactiver HTTPS en développement
SIMPLE_JWT["AUTH_COOKIE_SECURE"] = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False

# Debug toolbar
INSTALLED_APPS += ["debug_toolbar"]
MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")
INTERNAL_IPS = ["127.0.0.1"]

# Email (Console backend for dev)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Frontend URL pour les liens dans les emails
FRONTEND_URL = "http://localhost:3000"

# Logging level
LOGGING["root"]["level"] = "DEBUG"
