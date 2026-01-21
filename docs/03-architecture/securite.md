# Sécurité - Authentification et Permissions

## Authentification JWT

### Configuration Simple JWT

```python
# settings/base.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}
```

### Endpoints d'Authentification

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/auth/register/` | POST | Inscription |
| `/api/v1/auth/login/` | POST | Connexion |
| `/api/v1/auth/logout/` | POST | Déconnexion |
| `/api/v1/auth/token/refresh/` | POST | Rafraîchir le token |
| `/api/v1/auth/password/reset/` | POST | Demande de reset mot de passe |

## Rôles Utilisateurs

| Rôle | Permissions |
|------|-------------|
| **Patient** | Voir ses rendez-vous, créer une demande |
| **Staff** | Gérer les rendez-vous, voir les patients |
| **Médecin** | Accès médical complet |
| **Admin** | Accès total |

## Protection hCaptcha

### Configuration

```python
# settings/base.py
HCAPTCHA_SITE_KEY = os.environ.get('HCAPTCHA_SITE_KEY')
HCAPTCHA_SECRET_KEY = os.environ.get('HCAPTCHA_SECRET_KEY')
```

### Utilisation dans les Formulaires

Le CAPTCHA est obligatoire pour :
- Inscription
- Connexion
- Formulaire de contact
- Demande de rendez-vous

## Protection contre les Attaques

### Rate Limiting

```python
# throttling.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    }
}
```

### Protection Brute Force

django-axes est configuré pour :
- 5 tentatives de connexion maximum
- Blocage de 15 minutes après échec

### Hachage des Mots de Passe

| Paramètre | Valeur |
|-----------|--------|
| Algorithme | Argon2 (recommandé) |
| Longueur minimale | 12 caractères |
| Caractères requis | Majuscule, minuscule, chiffre, spécial |

## Audit et Monitoring

### Middleware d'Audit

```python
# middleware.py
AUDIT_LOG_ENABLED = True
AUDIT_LOG_INCLUDE_PATHS = ['/api/']
AUDIT_LOG_EXCLUDE_PATHS = ['/api/v1/auth/']
```

## Variables d'Environnement de Sécurité

```env
# Sécurité
DEBUG=False
SECRET_KEY=votre-cle-secrete-32-caracteres

# JWT
SIMPLE_JWT_ACCESS_TOKEN_LIFETIME=60
SIMPLE_JWT_REFRESH_TOKEN_LIFETIME=1440

# hCaptcha
HCAPTCHA_SITE_KEY=votre-site-key
HCAPTCHA_SECRET_KEY=votre-secret-key
```
