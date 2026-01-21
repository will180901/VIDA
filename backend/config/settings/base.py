"""
Django base settings for VIDA project.
"""

from pathlib import Path
from decouple import config, Csv
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
# Pas de default : force l'erreur si SECRET_KEY absente (sécurité)
SECRET_KEY = config('SECRET_KEY')

# Application definition
DJANGO_APPS = [
    "daphne",  # MUST be first for Channels
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
]

THIRD_PARTY_APPS = [
    # REST API
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    
    # Auth
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    
    # Security
    "axes",  # Protection brute force
    
    # Async & WebSocket
    "channels",
    
    # Celery
    "django_celery_beat",
    "django_celery_results",
]

LOCAL_APPS = [
    "apps.content_management",
    "apps.users",
    "apps.appointments",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "apps.users.middleware.JWTCookieMiddleware",  # Extraction JWT depuis cookie
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "axes.middleware.AxesMiddleware",  # Protection brute force (DOIT être après AuthenticationMiddleware)
    "config.middleware.SecurityHeadersMiddleware",  # Headers de sécurité personnalisés
    "config.sentry_middleware.SentryContextMiddleware",  # Contexte Sentry (si activé)
    "config.audit_middleware.AuditMiddleware",  # Audit trail automatique
    "config.audit_middleware.FailedLoginMiddleware",  # Logging des échecs de connexion
    # "config.timeouts.TimeoutMiddleware",  # Timeout requêtes (Unix uniquement - décommenter en production avec gunicorn)
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Password validation - RENFORCÉE
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},  # 12 caractères minimum
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
    {"NAME": "apps.users.validators.VIDAPasswordValidator"},  # Validateur personnalisé VIDA
]

# Validation password personnalisée VIDA
PASSWORD_MIN_LENGTH = 12
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_DIGIT = True
PASSWORD_REQUIRE_SPECIAL = True

# Password hashing (Argon2 recommandé)
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
]

# Internationalization
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Kinshasa"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
# STATICFILES_DIRS = [BASE_DIR / "static"]  # Commenté car dossier n'existe pas en dev

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Auth User Model
AUTH_USER_MODEL = "users.User"

# Sites framework
SITE_ID = 1

# =============================================================================
# DJANGO REST FRAMEWORK
# =============================================================================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "config.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PARSER_CLASSES": [
        "config.json_validators.StrictJSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "config.json_validators.SafeJSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "config.throttling.BurstAnonRateThrottle",
        "config.throttling.SustainedAnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        # Throttles généraux
        "anon": "100/hour",  # Limite globale anonyme (legacy)
        "user": "1000/hour",  # Limite globale utilisateur (legacy)
        
        # Throttles burst (pics de requêtes)
        "burst_anon": "10/min",  # Max 10 requêtes/minute pour anonymes
        "burst_user": "30/min",  # Max 30 requêtes/minute pour utilisateurs
        
        # Throttles sustained (requêtes soutenues)
        "sustained_anon": "100/hour",  # Max 100 requêtes/heure pour anonymes
        "sustained_user": "1000/hour",  # Max 1000 requêtes/heure pour utilisateurs
        
        # Throttles spécifiques
        "login": "5/hour",  # Rate limiting pour auth (5 tentatives / heure)
        "contact": "3/hour",  # Max 3 messages de contact par heure
        "appointment": "5/hour",  # Max 5 créations de RDV par heure
        "slots": "30/min",  # Max 30 consultations de créneaux par minute
        
        # Throttles avancés (FIX #29)
        "combined": "200/hour",  # Rate limiting combiné IP+User
        "strict_ip": "50/hour",  # Rate limiting strict par IP
        "dynamic": "150/hour",  # Rate limiting dynamique
        "burst": "20/min",  # Protection burst
    },
    "EXCEPTION_HANDLER": "config.exceptions.custom_exception_handler",
}

# =============================================================================
# ADVANCED THROTTLING (FIX #29)
# =============================================================================
# Whitelist d'IPs (pas de rate limiting)
THROTTLE_WHITELIST_IPS = [
    '127.0.0.1',  # Localhost
    # Ajouter les IPs de confiance (monitoring, CI/CD, etc.)
]

# Whitelist d'utilisateurs (emails)
THROTTLE_WHITELIST_USERS = [
    # Ajouter les emails des utilisateurs de confiance
    # Les staff sont automatiquement whitelistés
]

# Blacklist d'IPs (toujours throttlé)
THROTTLE_BLACKLIST_IPS = [
    # Ajouter les IPs malveillantes
]

# Blacklist d'utilisateurs (emails)
THROTTLE_BLACKLIST_USERS = [
    # Ajouter les emails des utilisateurs malveillants
]

# =============================================================================
# FIELD LIMITING (FIX #30)
# =============================================================================
# Nombre maximum de champs par requête
MAX_FIELDS_PER_REQUEST = 100

# Profondeur maximale des serializers
MAX_SERIALIZER_DEPTH = 5

# Nombre maximum de clés dans une requête JSON
MAX_REQUEST_KEYS = 100

# Profondeur maximale d'une requête JSON
MAX_REQUEST_DEPTH = 5

# Nombre maximum de champs dans sparse fieldsets
MAX_SPARSE_FIELDS = 50

# Taille maximale des tableaux
MAX_ARRAY_SIZE = 100

# Nombre maximum d'items dans les opérations en masse
MAX_BULK_ITEMS = 50

# =============================================================================
# JWT SETTINGS (Simple JWT) - SÉCURISÉ AVEC COOKIES
# =============================================================================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),  # Réduit à 5 min pour sécurité
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),  # Réduit à 7 jours
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    
    # Cookie settings (httpOnly pour sécurité)
    "AUTH_COOKIE": "vida_access_token",
    "AUTH_COOKIE_REFRESH": "vida_refresh_token",
    "AUTH_COOKIE_SECURE": True,  # HTTPS only en production
    "AUTH_COOKIE_HTTP_ONLY": True,  # Protection XSS
    "AUTH_COOKIE_SAMESITE": "Lax",  # Protection CSRF
    "AUTH_COOKIE_PATH": "/",
    "AUTH_COOKIE_DOMAIN": None,
}

# =============================================================================
# CSRF & COOKIE SECURITY
# =============================================================================
CSRF_COOKIE_HTTPONLY = False  # Doit être False pour que JS puisse lire le token
CSRF_COOKIE_SECURE = True  # HTTPS only en production
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_TRUSTED_ORIGINS = []  # À configurer par environnement

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "Lax"

# =============================================================================
# ALLAUTH SETTINGS (Nouvelle syntaxe)
# =============================================================================
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_UNIQUE_EMAIL = True

# Nouvelle syntaxe django-allauth (pour éviter warnings)
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']

# =============================================================================
# DRF SPECTACULAR (API Documentation)
# =============================================================================
SPECTACULAR_SETTINGS = {
    "TITLE": "VIDA API",
    "DESCRIPTION": """
    API REST du Centre Médical VIDA - Ophtalmologie
    
    ## 🏥 À propos
    
    Centre Médical VIDA est une clinique d'ophtalmologie située à Brazzaville, Congo.
    Cette API permet de gérer les rendez-vous, les utilisateurs et le contenu du site web.
    
    ## 🔐 Authentification
    
    L'API utilise JWT (JSON Web Tokens) pour l'authentification.
    Les tokens sont stockés dans des cookies httpOnly pour plus de sécurité.
    
    ### Obtenir un token
    
    1. Créer un compte via `/api/v1/auth/register/`
    2. Se connecter via `/api/v1/auth/login/`
    3. Le token sera automatiquement stocké dans un cookie
    
    ### Utiliser le token
    
    Pour les requêtes nécessitant une authentification, incluez le header :
    ```
    Authorization: Bearer <votre_token>
    ```
    
    ## 🚦 Rate Limiting
    
    - Anonymes : 100 requêtes/heure
    - Authentifiés : 1000 requêtes/heure
    - Login : 5 tentatives/heure
    - Créneaux : 30 requêtes/minute
    - Rendez-vous : 5 créations/heure
    - Contact : 3 messages/heure
    
    ## 📞 Contact
    
    - **Adresse** : 08 Bis rue Mboko, Moungali, Brazzaville, Congo
    - **Téléphone** : 06 569 12 35 | 05 745 36 88
    - **Email** : centremedvida@gmail.com
    - **WhatsApp** : +242 06 693 47 35
    """,
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "CONTACT": {
        "name": "Centre Médical VIDA",
        "email": "centremedvida@gmail.com",
    },
    "LICENSE": {
        "name": "Proprietary",
    },
    "TAGS": [
        {"name": "Authentication", "description": "Endpoints d'authentification et gestion des utilisateurs"},
        {"name": "Appointments", "description": "Gestion des rendez-vous médicaux"},
        {"name": "Content", "description": "Gestion du contenu du site (CMS)"},
        {"name": "Clinic", "description": "Informations sur la clinique"},
    ],
    "COMPONENT_SPLIT_REQUEST": True,
    "SCHEMA_PATH_PREFIX": "/api/v1/",
    "SERVERS": [
        {"url": "http://localhost:8000", "description": "Développement"},
        {"url": "https://api.vida.cd", "description": "Production"},
    ],
    "SWAGGER_UI_SETTINGS": {
        "deepLinking": True,
        "persistAuthorization": True,
        "displayOperationId": True,
        "filter": True,
        "tryItOutEnabled": True,
    },
    "REDOC_UI_SETTINGS": {
        "hideDownloadButton": False,
        "expandResponses": "200,201",
        "pathInMiddlePanel": True,
    },
}

# =============================================================================
# CELERY SETTINGS
# =============================================================================
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes (hard timeout)
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60  # 25 minutes (soft timeout)
CELERY_RESULT_BACKEND = "django-db"
CELERY_CACHE_BACKEND = "django-cache"
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

# =============================================================================
# TIMEOUTS (Protection contre requêtes longues)
# =============================================================================
REQUEST_TIMEOUT = 30  # Timeout global pour requêtes HTTP (secondes)

# Timeouts pour requêtes HTTP externes (requests library)
HTTP_TIMEOUT_CONNECT = 5  # Timeout de connexion
HTTP_TIMEOUT_READ = 30    # Timeout de lecture

# Timeouts pour requêtes DB
DATABASE_TIMEOUT = 30  # Timeout par défaut pour requêtes DB
DATABASE_TIMEOUT_LONG = 60  # Pour requêtes complexes (rapports, etc.)

# Timeout pour uploads
UPLOAD_TIMEOUT = 120  # 2 minutes pour uploads de fichiers

# =============================================================================
# CHANNELS (WebSocket)
# =============================================================================
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}

# =============================================================================
# CORS SETTINGS
# =============================================================================
CORS_ALLOW_CREDENTIALS = True

# =============================================================================
# LOGGING
# =============================================================================
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
        "security": {
            "format": "SECURITY {levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "security_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": BASE_DIR / "logs" / "security.log",
            "maxBytes": 10485760,  # 10 MB
            "backupCount": 10,
            "formatter": "security",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.security": {
            "handlers": ["console", "security_file"],
            "level": "WARNING",
            "propagate": False,
        },
        "axes": {
            "handlers": ["console", "security_file"],
            "level": "WARNING",
            "propagate": False,
        },
        "apps.users": {
            "handlers": ["console", "security_file"],
            "level": "INFO",
            "propagate": False,
        },
        "apps.appointments": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}


# =============================================================================
# DJANGO-AXES (Protection Brute Force)
# =============================================================================
AXES_FAILURE_LIMIT = 5  # 5 tentatives maximum
AXES_COOLOFF_TIME = timedelta(minutes=15)  # Blocage 15 minutes
AXES_RESET_ON_SUCCESS = True  # Reset compteur après succès
AXES_LOCKOUT_TEMPLATE = None  # Pas de template, retour JSON
AXES_LOCKOUT_PARAMETERS = [["username"], ["ip_address"]]  # Surveiller username (qui peut être email) + IP
AXES_USERNAME_FORM_FIELD = "username"  # Champ utilisé pour identifier l'utilisateur
AXES_IPWARE_PROXY_COUNT = 1  # Nombre de proxies (CloudFlare, etc.)
AXES_IPWARE_META_PRECEDENCE_ORDER = [
    'HTTP_X_FORWARDED_FOR',
    'X_FORWARDED_FOR',
    'HTTP_CLIENT_IP',
    'HTTP_X_REAL_IP',
    'HTTP_X_FORWARDED',
    'HTTP_X_CLUSTER_CLIENT_IP',
    'HTTP_FORWARDED_FOR',
    'HTTP_FORWARDED',
    'HTTP_VIA',
    'REMOTE_ADDR',
]

# Backend pour stocker les tentatives
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',  # DOIT être en premier
    'django.contrib.auth.backends.ModelBackend',
]

# =============================================================================
# HCAPTCHA (Protection Anti-Bot)
# =============================================================================
HCAPTCHA_SECRET_KEY = config('HCAPTCHA_SECRET_KEY', default='')
HCAPTCHA_SITE_KEY = config('HCAPTCHA_SITE_KEY', default='')

# =============================================================================
# SENTRY (Monitoring & Error Tracking)
# =============================================================================
SENTRY_DSN = config('SENTRY_DSN', default='')
SENTRY_ENVIRONMENT = config('SENTRY_ENVIRONMENT', default='development')

# Initialiser Sentry si DSN configuré
if SENTRY_DSN and not DEBUG:
    from config.sentry import init_sentry
    init_sentry(
        dsn=SENTRY_DSN,
        environment=SENTRY_ENVIRONMENT,
        debug=DEBUG
    )
