# 🔧 Architecture Backend - VIDA

Documentation détaillée de l'architecture backend Django du projet VIDA.

---

## 📋 Table des matières

1. [Structure du projet](#-structure-du-projet)
2. [Applications Django](#-applications-django)
3. [Modèles de données](#-modèles-de-données)
4. [API REST](#-api-rest)
5. [Authentification](#-authentification)
6. [Tâches asynchrones](#-tâches-asynchrones)
7. [Configuration](#-configuration)

---

## 📁 Structure du projet

```
backend/
├── apps/                          # Applications Django
│   ├── users/                     # Gestion des utilisateurs
│   │   ├── models.py             # Modèles User, Tokens
│   │   ├── models_audit.py       # Modèles d'audit
│   │   ├── serializers.py        # Serializers DRF
│   │   ├── views.py              # Views API classiques
│   │   ├── views_secure.py       # Views avec cookies httpOnly
│   │   ├── urls.py               # Routes API
│   │   ├── tasks.py              # Tâches Celery
│   │   ├── emails.py             # Envoi d'emails
│   │   ├── validators.py         # Validateurs personnalisés
│   │   ├── sanitizers.py         # Sanitization XSS
│   │   ├── phone_validators.py   # Validation téléphone Congo
│   │   ├── captcha.py            # Vérification hCaptcha
│   │   ├── middleware.py         # Middlewares personnalisés
│   │   └── admin.py              # Configuration admin Django
│   │
│   ├── appointments/              # Gestion des rendez-vous
│   │   ├── models.py             # Modèles Appointment, SlotLock
│   │   ├── serializers.py        # Serializers DRF
│   │   ├── views.py              # Views API
│   │   ├── urls.py               # Routes API
│   │   ├── tasks.py              # Tâches Celery (rappels)
│   │   ├── emails.py             # Emails de confirmation
│   │   └── admin.py              # Configuration admin
│   │
│   └── content_management/        # Gestion du contenu
│       ├── models.py             # Modèles ClinicSetting, HeroSlide, etc.
│       ├── serializers.py        # Serializers DRF
│       ├── views.py              # Views API
│       ├── urls.py               # Routes API
│       ├── validators.py         # Validation images
│       └── admin.py              # Configuration admin
│
├── config/                        # Configuration Django
│   ├── settings/                 # Settings multi-environnements
│   │   ├── base.py              # Settings communs
│   │   ├── development.py       # Settings dev
│   │   └── production.py        # Settings prod
│   ├── urls.py                  # URLs racine
│   ├── wsgi.py                  # WSGI application
│   ├── celery.py                # Configuration Celery
│   ├── exceptions.py            # Gestion des exceptions
│   ├── middleware.py            # Middlewares globaux
│   ├── pagination.py            # Pagination personnalisée
│   ├── throttling.py            # Rate limiting
│   ├── advanced_throttling.py   # Throttling avancé
│   ├── field_limiting.py        # Limitation champs requêtes
│   ├── json_validators.py       # Validation JSON stricte
│   ├── sentry.py                # Configuration Sentry
│   ├── sentry_middleware.py     # Middleware Sentry
│   └── timeouts.py              # Timeouts requêtes
│
├── fixtures/                     # Données initiales
│   ├── clinic_settings.json
│   ├── hero_slides.json
│   └── medical_services.json
│
├── templates/                    # Templates Django
│   └── emails/                  # Templates d'emails
│       ├── base.html
│       ├── appointment_confirmation.html
│       ├── appointment_reminder.html
│       ├── appointment_cancellation.html
│       ├── password_reset.html
│       ├── verify_email.html
│       └── welcome.html
│
├── tests/                        # Tests automatisés
│   ├── test_authentication.py
│   ├── test_appointments.py
│   ├── test_models.py
│   ├── test_security.py
│   └── test_quick_fix.py
│
├── scripts/                      # Scripts utilitaires
│   ├── backup_database.sh
│   └── restore_database.sh
│
├── manage.py                     # CLI Django
├── requirements.txt              # Dépendances Python
├── pytest.ini                    # Configuration pytest
├── .env.example                  # Exemple de configuration
└── db.sqlite3                    # Base de données dev (optionnel)
```

---

## 🧩 Applications Django

### 1. App `users` - Gestion des utilisateurs

**Responsabilités :**
- Authentification (inscription, connexion, déconnexion)
- Gestion des profils utilisateurs
- Vérification email
- Réinitialisation mot de passe
- Audit des actions utilisateurs

**Modèles principaux :**

```python
# User (utilisateur personnalisé)
class User(AbstractBaseUser, PermissionsMixin):
    email = EmailField(unique=True)  # Identifiant
    first_name = CharField(max_length=150)
    last_name = CharField(max_length=150)
    phone = CharField(max_length=20)
    date_of_birth = DateField(null=True, blank=True)
    gender = CharField(max_length=10, choices=GENDER_CHOICES)
    address = TextField(blank=True)
    avatar = ImageField(upload_to='avatars/', null=True)
    email_verified = BooleanField(default=False)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

# EmailVerificationToken (tokens de vérification email)
class EmailVerificationToken(Model):
    user = ForeignKey(User, on_delete=CASCADE)
    token = CharField(max_length=255, unique=True)
    expires_at = DateTimeField()
    used = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)

# PasswordResetToken (tokens de reset password)
class PasswordResetToken(Model):
    user = ForeignKey(User, on_delete=CASCADE)
    token = CharField(max_length=255, unique=True)
    expires_at = DateTimeField()
    used = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)

# AuditLog (logs d'audit)
class AuditLog(Model):
    user = ForeignKey(User, on_delete=SET_NULL, null=True)
    action = CharField(max_length=100)
    model_name = CharField(max_length=100)
    object_id = IntegerField(null=True)
    changes = JSONField(default=dict)
    ip_address = GenericIPAddressField(null=True)
    user_agent = TextField(blank=True)
    timestamp = DateTimeField(auto_now_add=True)
```

**Endpoints API :**

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/api/v1/auth/register/` | POST | Inscription | Non |
| `/api/v1/auth/login/` | POST | Connexion | Non |
| `/api/v1/auth/logout/` | POST | Déconnexion | Oui |
| `/api/v1/auth/refresh/` | POST | Refresh token | Non |
| `/api/v1/auth/profile/` | GET, PUT, PATCH | Profil utilisateur | Oui |
| `/api/v1/auth/change-password/` | POST | Changer mot de passe | Oui |
| `/api/v1/auth/password-reset/` | POST | Demander reset | Non |
| `/api/v1/auth/password-reset-confirm/` | POST | Confirmer reset | Non |
| `/api/v1/auth/verify-email/` | POST | Vérifier email | Non |

**Sécurité :**
- JWT stockés dans cookies httpOnly
- Argon2 pour hachage des mots de passe
- Rate limiting : 5 tentatives / 15 min (login)
- hCaptcha obligatoire (inscription, login, reset)
- Protection timing attack (reset password)
- Audit trail complet

### 2. App `appointments` - Gestion des rendez-vous

**Responsabilités :**
- Création de rendez-vous
- Gestion des créneaux disponibles
- Verrouillage temporaire des créneaux
- Confirmation/annulation de rendez-vous
- Envoi d'emails automatiques

**Modèles principaux :**

```python
# Appointment (rendez-vous)
class Appointment(Model):
    # Patient (peut être lié à un User ou anonyme)
    patient = ForeignKey(User, on_delete=SET_NULL, null=True, blank=True)
    patient_first_name = CharField(max_length=150)
    patient_last_name = CharField(max_length=150)
    patient_email = EmailField()
    patient_phone = CharField(max_length=20)
    
    # Rendez-vous
    date = DateField()
    time = TimeField()
    consultation_type = CharField(max_length=20, choices=CONSULTATION_TYPES)
    reason = TextField(blank=True)
    
    # Statut
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    confirmed_at = DateTimeField(null=True, blank=True)
    cancelled_at = DateTimeField(null=True, blank=True)
    cancellation_reason = TextField(blank=True)
    
    # Métadonnées
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = [['date', 'time']]  # Un seul RDV par créneau

# AppointmentSlotLock (verrouillage temporaire)
class AppointmentSlotLock(Model):
    date = DateField()
    time = TimeField()
    locked_by = CharField(max_length=255)  # Session ID
    expires_at = DateTimeField()
    created_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['date', 'time']]
```

**Endpoints API :**

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/api/v1/appointments/` | GET, POST | Liste/Créer RDV | Optionnel |
| `/api/v1/appointments/{id}/` | GET, PUT, PATCH, DELETE | Détail RDV | Oui |
| `/api/v1/appointments/{id}/cancel/` | POST | Annuler RDV | Oui |
| `/api/v1/appointments/slots/` | GET | Créneaux disponibles | Non |
| `/api/v1/appointments/lock-slot/` | POST, DELETE | Verrouiller créneau | Non |

**Logique métier :**
- Validation des créneaux (horaires clinique)
- Vérification disponibilité (pas de doublon)
- Verrouillage temporaire (10 min) pendant réservation
- Envoi email confirmation automatique
- Rappel automatique 24h avant (Celery)

### 3. App `content_management` - Gestion du contenu

**Responsabilités :**
- Paramètres de la clinique
- Slides du carousel hero
- Services médicaux
- Horaires d'ouverture
- Jours fériés
- Messages de contact

**Modèles principaux :**

```python
# ClinicSetting (paramètres clinique - singleton)
class ClinicSetting(Model):
    name = CharField(max_length=255)
    address = TextField()
    phone_primary = CharField(max_length=20)
    phone_secondary = CharField(max_length=20, blank=True)
    whatsapp = CharField(max_length=20, blank=True)
    email = EmailField()
    fee_general = DecimalField(max_digits=10, decimal_places=2)
    fee_specialized = DecimalField(max_digits=10, decimal_places=2)
    opening_hours = JSONField(default=dict)
    about_text = TextField()
    rccm = CharField(max_length=50, blank=True)
    niu = CharField(max_length=50, blank=True)

# HeroSlide (slides carousel)
class HeroSlide(Model):
    title = CharField(max_length=255)
    subtitle = TextField()
    image = ImageField(upload_to='hero/')
    order = IntegerField(default=0)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']

# MedicalService (services médicaux)
class MedicalService(Model):
    title = CharField(max_length=255)
    description = TextField()
    details = TextField()
    image = ImageField(upload_to='services/')
    icon_name = CharField(max_length=50, blank=True)
    order = IntegerField(default=0)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']

# ClinicSchedule (horaires par jour)
class ClinicSchedule(Model):
    day_of_week = IntegerField(choices=DAY_CHOICES)  # 0=Lundi, 6=Dimanche
    is_open = BooleanField(default=True)
    morning_start = TimeField(null=True, blank=True)
    morning_end = TimeField(null=True, blank=True)
    afternoon_start = TimeField(null=True, blank=True)
    afternoon_end = TimeField(null=True, blank=True)
    slot_duration = IntegerField(default=30)  # minutes
    
    class Meta:
        unique_together = [['day_of_week']]

# ClinicHoliday (jours fériés)
class ClinicHoliday(Model):
    date = DateField(unique=True)
    name = CharField(max_length=255)
    is_recurring = BooleanField(default=False)

# ContactMessage (messages de contact)
class ContactMessage(Model):
    name = CharField(max_length=255)
    email = EmailField()
    phone = CharField(max_length=20, blank=True)
    subject = CharField(max_length=255, blank=True)
    message = TextField()
    is_read = BooleanField(default=False)
    replied_at = DateTimeField(null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

**Endpoints API :**

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/api/v1/content/clinic-settings/` | GET | Paramètres clinique | Non |
| `/api/v1/content/hero-slides/` | GET | Slides hero | Non |
| `/api/v1/content/services/` | GET | Services médicaux | Non |
| `/api/v1/content/schedules/` | GET | Horaires | Non |
| `/api/v1/content/holidays/` | GET | Jours fériés | Non |
| `/api/v1/content/contact/` | POST | Envoyer message | Non |

---

## 🔌 API REST

### Architecture API

```
/api/v1/
├── auth/                    # Authentification
│   ├── register/
│   ├── login/
│   ├── logout/
│   ├── refresh/
│   ├── profile/
│   ├── change-password/
│   ├── password-reset/
│   ├── password-reset-confirm/
│   └── verify-email/
│
├── appointments/            # Rendez-vous
│   ├── /                   # Liste/Créer
│   ├── {id}/              # Détail/Modifier/Supprimer
│   ├── {id}/cancel/       # Annuler
│   ├── slots/             # Créneaux disponibles
│   └── lock-slot/         # Verrouiller créneau
│
└── content/                # Contenu
    ├── clinic-settings/
    ├── hero-slides/
    ├── services/
    ├── schedules/
    ├── holidays/
    └── contact/
```

### Format des réponses

**Succès (200, 201) :**

```json
{
  "id": 123,
  "field1": "value1",
  "field2": "value2",
  "created_at": "2026-01-24T10:30:00Z"
}
```

**Liste paginée (200) :**

```json
{
  "count": 50,
  "next": "http://api.vida.cg/api/v1/appointments/?page=2",
  "previous": null,
  "results": [
    {"id": 1, "...": "..."},
    {"id": 2, "...": "..."}
  ]
}
```

**Erreur de validation (400) :**

```json
{
  "field1": ["Ce champ est requis."],
  "field2": ["Format invalide."]
}
```

**Erreur générique (400, 404, 500) :**

```json
{
  "detail": "Message d'erreur descriptif"
}
```

### Documentation automatique

**Swagger UI :**  
http://localhost:8000/api/schema/swagger-ui/

**ReDoc :**  
http://localhost:8000/api/schema/redoc/

**OpenAPI Schema (JSON) :**  
http://localhost:8000/api/schema/

---

## 🔐 Authentification

### JWT avec cookies httpOnly

**Avantages :**
- ✅ Protection contre XSS (cookies httpOnly)
- ✅ Protection CSRF (SameSite cookies)
- ✅ Rotation automatique des tokens
- ✅ Révocation possible (blacklist)

**Configuration :**

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_COOKIE': 'vida_access_token',
    'AUTH_COOKIE_REFRESH': 'vida_refresh_token',
    'AUTH_COOKIE_SECURE': True,  # HTTPS only
    'AUTH_COOKIE_HTTP_ONLY': True,
    'AUTH_COOKIE_SAMESITE': 'Lax',
}
```

**Flux d'authentification :**

```
1. POST /api/v1/auth/login/
   {email, password, captcha}
   
2. Backend vérifie credentials
   
3. Backend génère access + refresh tokens
   
4. Backend définit cookies httpOnly
   Set-Cookie: vida_access_token=xxx; HttpOnly; Secure; SameSite=Lax
   Set-Cookie: vida_refresh_token=yyy; HttpOnly; Secure; SameSite=Lax
   
5. Client stocke automatiquement les cookies
   
6. Requêtes suivantes : cookies envoyés automatiquement
   
7. Si access token expiré :
   POST /api/v1/auth/refresh/
   → Nouveau access token dans cookie
```

---

## ⚡ Tâches asynchrones (Celery)

### Configuration Celery

```python
# config/celery.py
from celery import Celery
from celery.schedules import crontab

app = Celery('vida')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Tâches planifiées
app.conf.beat_schedule = {
    'send-appointment-reminders': {
        'task': 'apps.appointments.tasks.send_appointment_reminders',
        'schedule': crontab(hour=9, minute=0),  # 9h chaque jour
    },
    'cleanup-expired-tokens': {
        'task': 'apps.users.tasks.cleanup_expired_tokens',
        'schedule': crontab(hour=2, minute=0),  # 2h chaque jour
    },
    'backup-database': {
        'task': 'apps.users.tasks.backup_database',
        'schedule': crontab(hour=2, minute=30),  # 2h30 chaque jour
    },
}
```

### Tâches principales

**Envoi d'emails :**

```python
@shared_task
def send_appointment_confirmation(appointment_id):
    """Envoie email de confirmation de RDV"""
    appointment = Appointment.objects.get(id=appointment_id)
    send_email(
        to=appointment.patient_email,
        subject='Confirmation de rendez-vous - VIDA',
        template='appointment_confirmation.html',
        context={'appointment': appointment}
    )

@shared_task
def send_appointment_reminders():
    """Envoie rappels 24h avant les RDV"""
    tomorrow = timezone.now().date() + timedelta(days=1)
    appointments = Appointment.objects.filter(
        date=tomorrow,
        status='confirmed'
    )
    for appointment in appointments:
        send_email(
            to=appointment.patient_email,
            subject='Rappel : Rendez-vous demain - VIDA',
            template='appointment_reminder.html',
            context={'appointment': appointment}
        )
```

**Nettoyage :**

```python
@shared_task
def cleanup_expired_tokens():
    """Nettoie les tokens expirés"""
    EmailVerificationToken.objects.filter(
        expires_at__lt=timezone.now()
    ).delete()
    
    PasswordResetToken.objects.filter(
        expires_at__lt=timezone.now()
    ).delete()

@shared_task
def cleanup_old_audit_logs():
    """Nettoie les logs > 90 jours"""
    cutoff = timezone.now() - timedelta(days=90)
    AuditLog.objects.filter(timestamp__lt=cutoff).delete()
```

**Backup :**

```python
@shared_task
def backup_database():
    """Backup automatique de la base de données"""
    import subprocess
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
    filename = f'/var/backups/vida/vida_db_{timestamp}.sql.gz'
    
    subprocess.run([
        'pg_dump',
        '-U', settings.DATABASES['default']['USER'],
        '-d', settings.DATABASES['default']['NAME'],
        '--format=plain',
        '--no-owner',
        '--no-acl',
    ], stdout=open(filename, 'wb'))
```

---

## ⚙️ Configuration

### Settings multi-environnements

```
config/settings/
├── base.py          # Settings communs
├── development.py   # Settings dev
└── production.py    # Settings prod
```

**Utilisation :**

```bash
# Development
export DJANGO_SETTINGS_MODULE=config.settings.development
python manage.py runserver

# Production
export DJANGO_SETTINGS_MODULE=config.settings.production
gunicorn config.wsgi:application
```

### Variables d'environnement

Voir [Guide de configuration](../01-getting-started/configuration.md)

---

## 📚 Ressources

- [API Documentation](../03-api-documentation/README.md)
- [Guide de développement backend](../05-backend-guide/README.md)
- [Schéma de base de données](./database-schema.md)
- [Documentation sécurité](./security.md)

---

**Backend documenté ! 🔧**
