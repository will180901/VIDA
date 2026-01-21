# Architecture Backend - Django

## Stack Technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| Django | 5.0 | Framework web |
| Django REST Framework | 3.14+ | API REST |
| Simple JWT | 5.x | Authentification JWT |
| hCaptcha | - | Protection CAPTCHA |

## Structure des Modules

### Module Users (`backend/apps/users/`)

```
users/
├── models.py          # User, AuditLog, LoginAttempt
├── views.py           # Vues API
├── serializers.py     # Sérialisation
├── urls.py            # Routes
├── permissions.py     # Permissions personnalisées
├── validators.py       # Validateurs
├── admin.py           # Configuration admin
├── signals.py         # Signaux Django
├── tasks.py           # Tâches Celery
├── emails.py          # Emails transactionnels
└── middleware.py      # Middleware d'audit
```

### Modèles Principaux

| Modèle | Description |
|--------|-------------|
| **User** | Utilisateur avec rôles (patient, staff, médecin, admin) |
| **AuditLog** | Journal d'audit des actions |
| **LoginAttempt** | Tentatives de connexion |

### Module Appointments (`backend/apps/appointments/`)

```
appointments/
├── models.py          # Appointment, AppointmentHistory
├── views.py           # Vues API CRUD
├── serializers.py     # Sérialisation
├── urls.py            # Routes
├── validators.py       # Validateurs de dates
├── signals.py         # Signaux de workflow
├── emails.py          # Notifications email
├── tasks.py           # Tâches Celery
└── admin.py           # Configuration admin
```

### Modèles Principaux

| Modèle | Description |
|--------|-------------|
| **Appointment** | Rendez-vous médical |
| **AppointmentHistory** | Historique des modifications |
| **AppointmentProposal** | Propositions de modification |

### Module Content Management (`backend/apps/content_management/`)

```
content_management/
├── models.py          # MedicalService, HeroSlide, FAQ...
├── views.py           # Vues API
├── serializers.py     # Sérialisation
└── urls.py            # Routes
```

### Modèles Principaux

| Modèle | Description |
|--------|-------------|
| **MedicalService** | Services médicaux |
| **HeroSlide** | Slides page d'accueil |
| **FAQ** | Questions fréquentes |
| **ClinicSetting** | Paramètres de la clinique |
| **ClinicSchedule** | Horaires d'ouverture |
| **ConsultationFee** | Tarifs des consultations |

### Module Notifications (`backend/apps/notifications/`)

```
notifications/
├── models.py          # Notification
├── views.py           # Vues API
├── serializers.py     # Sérialisation
├── urls.py            # Routes
└── signals.py         # Signaux automatique
```

## Configuration

### Fichiers de Configuration

| Fichier | Description |
|---------|-------------|
| `config/settings/base.py` | Configuration principale |
| `config/settings/development.py` | Configuration développement |
| `config/settings/production.py` | Configuration production |
| `config/middleware.py` | Middleware de sécurité |
| `config/urls.py` | Routing principal |

## Commandes Django

```bash
# Créer les migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Charger les fixtures
python manage.py loaddata backend/fixtures/*.json

# Lancer le serveur
python manage.py runserver
```
