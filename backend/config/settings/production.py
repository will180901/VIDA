"""
Django production settings for VIDA project.
"""

from .base import *

# SECURITY
DEBUG = False
ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv())

# HTTPS
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST"),
        "PORT": config("DB_PORT", default="5432"),
        "CONN_MAX_AGE": 60,
        "OPTIONS": {
            "sslmode": "require",
        },
    }
}

# Cache (Redis)
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": config("REDIS_URL"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "PASSWORD": config("REDIS_PASSWORD", default=""),
        },
    }
}

# Celery
CELERY_BROKER_URL = config("CELERY_BROKER_URL")

# Channels (WebSocket)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [config("REDIS_URL")],
        },
    },
}

# CORS
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", cast=Csv())

# Email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST")
EMAIL_PORT = config("EMAIL_PORT", cast=int)
EMAIL_HOST_USER = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@vida.cd")

# Frontend URL pour les liens dans les emails
FRONTEND_URL = config("FRONTEND_URL", default="https://vida.cd")

# Static files (whitenoise)
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"

# Logging
LOGGING["handlers"]["file"] = {
    "class": "logging.FileHandler",
    "filename": BASE_DIR / "logs" / "django.log",
    "formatter": "verbose",
}
LOGGING["root"]["handlers"] = ["console", "file"]
