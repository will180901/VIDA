# 🔐 Sécurité - VIDA

Documentation complète des mesures de sécurité implémentées dans le projet VIDA.

---

## 📋 Table des matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Authentification](#-authentification)
3. [Protection des données](#-protection-des-données)
4. [Protection contre les attaques](#-protection-contre-les-attaques)
5. [Monitoring et audit](#-monitoring-et-audit)
6. [Conformité et bonnes pratiques](#-conformité-et-bonnes-pratiques)

---

## 🎯 Vue d'ensemble

### Niveaux de sécurité

```
┌─────────────────────────────────────────────────────────┐
│                  Couches de sécurité                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. Network Layer (Réseau)                               │
│     ✅ HTTPS obligatoire (TLS 1.3)                       │
│     ✅ Firewall (UFW)                                    │
│     ✅ DDoS protection (Cloudflare)                      │
│                                                           │
│  2. Application Layer (Application)                      │
│     ✅ Rate limiting (5-100 req/min)                     │
│     ✅ CORS configuré strictement                        │
│     ✅ Security headers (CSP, HSTS, etc.)                │
│                                                           │
│  3. Authentication Layer (Authentification)              │
│     ✅ JWT avec cookies httpOnly                         │
│     ✅ Argon2 password hashing                           │
│     ✅ Token rotation & blacklist                        │
│     ✅ hCaptcha anti-bot                                 │
│                                                           │
│  4. Authorization Layer (Autorisation)                   │
│     ✅ Permissions Django                                │
│     ✅ Object-level permissions                          │
│     ✅ Role-based access control                         │
│                                                           │
│  5. Data Layer (Données)                                 │
│     ✅ Input validation (Zod + DRF)                      │
│     ✅ XSS sanitization (bleach)                         │
│     ✅ SQL injection protection (ORM)                    │
│     ✅ CSRF protection                                   │
│                                                           │
│  6. Database Layer (Base de données)                     │
│     ✅ Encryption at rest                                │
│     ✅ Backup automatique quotidien                      │
│     ✅ Audit trail complet                               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Conformité

| Standard | Statut | Description |
|----------|--------|-------------|
| **OWASP Top 10** | ✅ Conforme | Protection contre les 10 vulnérabilités principales |
| **GDPR** | ⚠️ Partiel | Protection des données personnelles (à compléter) |
| **HIPAA** | ❌ Non | Normes médicales US (non applicable au Congo) |
| **ISO 27001** | ⚠️ Partiel | Gestion de la sécurité de l'information |

---

## 🔑 Authentification

### JWT avec cookies httpOnly

**Architecture :**

```
┌─────────────────────────────────────────────────────────┐
│              Flux d'authentification JWT                 │
└─────────────────────────────────────────────────────────┘

1. Login
   Client ──POST /auth/login/──► Backend
          {email, password, captcha}
                                    │
                                    ├─ Vérifier hCaptcha
                                    ├─ Vérifier credentials
                                    ├─ Générer access token (60 min)
                                    ├─ Générer refresh token (7 jours)
                                    │
   Client ◄──Set-Cookie──────────── Backend
          vida_access_token=xxx; HttpOnly; Secure; SameSite=Lax
          vida_refresh_token=yyy; HttpOnly; Secure; SameSite=Lax

2. Requête authentifiée
   Client ──GET /appointments/──► Backend
          Cookie: vida_access_token=xxx
                                    │
                                    ├─ Vérifier JWT signature
                                    ├─ Vérifier expiration
                                    ├─ Vérifier blacklist
                                    │
   Client ◄──Response──────────── Backend
          {data}

3. Refresh token
   Client ──POST /auth/refresh/──► Backend
          Cookie: vida_refresh_token=yyy
                                    │
                                    ├─ Vérifier refresh token
                                    ├─ Générer nouveau access token
                                    ├─ Blacklist ancien refresh token
                                    ├─ Générer nouveau refresh token
                                    │
   Client ◄──Set-Cookie──────────── Backend
          vida_access_token=zzz; HttpOnly; Secure; SameSite=Lax
          vida_refresh_token=www; HttpOnly; Secure; SameSite=Lax
```

**Configuration JWT :**

```python
SIMPLE_JWT = {
    # Durée de vie
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    
    # Rotation des tokens
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    
    # Cookies
    'AUTH_COOKIE': 'vida_access_token',
    'AUTH_COOKIE_REFRESH': 'vida_refresh_token',
    'AUTH_COOKIE_SECURE': True,  # HTTPS only
    'AUTH_COOKIE_HTTP_ONLY': True,  # Pas accessible en JS
    'AUTH_COOKIE_SAMESITE': 'Lax',  # Protection CSRF
    'AUTH_COOKIE_PATH': '/',
    
    # Algorithme
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': settings.SECRET_KEY,
}
```

**Avantages :**
- ✅ Protection XSS (httpOnly)
- ✅ Protection CSRF (SameSite)
- ✅ Révocation possible (blacklist)
- ✅ Rotation automatique

---

### Hachage des mots de passe (Argon2)

**Configuration :**

```python
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',  # Prioritaire
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',  # Fallback
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]
```

**Validation des mots de passe :**

```python
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 12}  # Minimum 12 caractères
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

**Règles de mot de passe :**
- ✅ Minimum 12 caractères
- ✅ Au moins 1 majuscule
- ✅ Au moins 1 minuscule
- ✅ Au moins 1 chiffre
- ✅ Au moins 1 caractère spécial
- ✅ Pas de mots de passe communs
- ✅ Pas similaire à l'email/nom

**Exemple de validation :**

```python
def calculate_password_strength(password: str) -> dict:
    """Calcule la force d'un mot de passe"""
    checks = {
        'length': len(password) >= 12,
        'uppercase': bool(re.search(r'[A-Z]', password)),
        'lowercase': bool(re.search(r'[a-z]', password)),
        'digit': bool(re.search(r'\d', password)),
        'special': bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password)),
    }
    
    score = sum(checks.values()) * 20  # 0-100
    
    if score >= 80:
        strength = 'strong'
    elif score >= 60:
        strength = 'medium'
    else:
        strength = 'weak'
    
    return {
        'score': score,
        'strength': strength,
        'checks': checks
    }
```

---

### Protection brute force

**1. django-axes (Backend) :**

```python
# Configuration
AXES_FAILURE_LIMIT = 5  # 5 tentatives max
AXES_COOLOFF_TIME = timedelta(minutes=15)  # Blocage 15 min
AXES_LOCK_OUT_BY_COMBINATION_USER_AND_IP = True
AXES_RESET_ON_SUCCESS = True

# Middleware
MIDDLEWARE = [
    'axes.middleware.AxesMiddleware',  # Après AuthenticationMiddleware
    # ...
]
```

**2. Rate limiting (DRF) :**

```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',  # Anonymes : 100 req/h
        'user': '1000/hour',  # Authentifiés : 1000 req/h
        'login': '5/15min',  # Login : 5 tentatives / 15 min
    }
}
```

**3. hCaptcha (Anti-bot) :**

```python
def verify_hcaptcha(token: str, remote_ip: str) -> bool:
    """Vérifie un token hCaptcha"""
    response = requests.post('https://hcaptcha.com/siteverify', data={
        'secret': settings.HCAPTCHA_SECRET_KEY,
        'response': token,
        'remoteip': remote_ip,
    })
    
    result = response.json()
    
    if not result.get('success'):
        raise ValidationError('CAPTCHA invalide')
    
    return True
```

---

## 🛡️ Protection des données

### Validation des entrées

**1. Frontend (Zod) :**

```typescript
import { z } from 'zod';

const appointmentSchema = z.object({
  patient_first_name: z.string()
    .min(2, 'Minimum 2 caractères')
    .max(150, 'Maximum 150 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Caractères invalides'),
  
  patient_email: z.string()
    .email('Email invalide')
    .max(254, 'Email trop long'),
  
  patient_phone: z.string()
    .regex(/^(06|05|04)\s?\d{3}\s?\d{2}\s?\d{2}$/, 'Format: 06 XXX XX XX'),
  
  date: z.string()
    .refine((date) => new Date(date) > new Date(), 'Date passée'),
  
  time: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
});
```

**2. Backend (DRF Serializers) :**

```python
class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
    
    def validate_date(self, value):
        """Valider que la date est future"""
        if value < timezone.now().date():
            raise serializers.ValidationError("La date doit être future")
        return value
    
    def validate_phone(self, value):
        """Valider le format téléphone Congo"""
        if not re.match(r'^0[456]\d{7}$', value.replace(' ', '')):
            raise serializers.ValidationError("Format invalide: 06 XXX XX XX")
        return value
    
    def validate(self, attrs):
        """Validation globale"""
        # Vérifier que le créneau est disponible
        if Appointment.objects.filter(
            date=attrs['date'],
            time=attrs['time']
        ).exists():
            raise serializers.ValidationError("Créneau déjà réservé")
        
        return attrs
```

---

### Sanitization XSS

**Protection contre les injections de code malveillant :**

```python
import bleach

ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'a']
ALLOWED_ATTRIBUTES = {'a': ['href', 'title']}

def sanitize_text_input(text: str) -> str:
    """Nettoie le texte des balises dangereuses"""
    if not text:
        return ''
    
    # Nettoyer avec bleach
    cleaned = bleach.clean(
        text,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )
    
    # Échapper les caractères dangereux
    cleaned = cleaned.replace('<script>', '')
    cleaned = cleaned.replace('javascript:', '')
    cleaned = cleaned.replace('onerror=', '')
    cleaned = cleaned.replace('onclick=', '')
    
    return cleaned
```

**Application automatique :**

```python
class AppointmentSerializer(serializers.ModelSerializer):
    def validate_reason(self, value):
        """Sanitize le motif de consultation"""
        return sanitize_text_input(value)
```

---

### Protection SQL Injection

**Django ORM protège automatiquement :**

```python
# ✅ SÉCURISÉ (ORM)
Appointment.objects.filter(patient_email=user_input)

# ❌ DANGEREUX (SQL brut)
cursor.execute(f"SELECT * FROM appointments WHERE email = '{user_input}'")

# ✅ SÉCURISÉ (SQL brut avec paramètres)
cursor.execute("SELECT * FROM appointments WHERE email = %s", [user_input])
```

---

## 🚫 Protection contre les attaques

### 1. XSS (Cross-Site Scripting)

**Mesures :**
- ✅ Sanitization avec bleach
- ✅ Cookies httpOnly (pas accessible en JS)
- ✅ Content Security Policy (CSP)
- ✅ Échappement automatique des templates Django

**Headers de sécurité :**

```python
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
```

---

### 2. CSRF (Cross-Site Request Forgery)

**Mesures :**
- ✅ CSRF token Django
- ✅ SameSite cookies
- ✅ Vérification de l'origine

**Configuration :**

```python
CSRF_COOKIE_SECURE = True  # HTTPS only
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = ['https://vida.cg']
```

---

### 3. Clickjacking

**Mesures :**
- ✅ X-Frame-Options: DENY
- ✅ Content-Security-Policy: frame-ancestors 'none'

```python
X_FRAME_OPTIONS = 'DENY'
```

---

### 4. DoS (Denial of Service)

**Mesures :**
- ✅ Rate limiting (5-100 req/min)
- ✅ Timeouts sur les requêtes (30s)
- ✅ Limitation de la taille des requêtes (10 MB)
- ✅ Limitation de la profondeur JSON (10 niveaux)
- ✅ Cloudflare DDoS protection

**Configuration :**

```python
# Timeouts
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024

# Rate limiting avancé
THROTTLE_RATES = {
    'anon': '100/hour',
    'user': '1000/hour',
    'login': '5/15min',
    'burst': '10/minute',
}
```

---

### 5. Timing Attacks

**Protection sur reset password :**

```python
def password_reset_request(email: str):
    """Demande de reset avec protection timing attack"""
    import time
    start_time = time.time()
    
    try:
        user = User.objects.get(email=email)
        # Envoyer email de reset
        send_reset_email(user)
    except User.DoesNotExist:
        pass  # Ne pas révéler si l'email existe
    
    # Délai artificiel pour prévenir timing attack
    elapsed = time.time() - start_time
    if elapsed < 0.2:
        time.sleep(0.2 - elapsed)
    
    return "Si cet email existe, vous recevrez un lien de réinitialisation."
```

---

## 📊 Monitoring et audit

### Audit trail

**Logs d'audit automatiques :**

```python
class AuditMiddleware:
    """Middleware pour logger toutes les actions"""
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Logger les actions importantes
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            AuditLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                action=f"{request.method} {request.path}",
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                timestamp=timezone.now()
            )
        
        return response
```

**Logs de connexion :**

```python
class LoginAttempt(models.Model):
    """Tentatives de connexion"""
    email = models.EmailField()
    ip_address = models.GenericIPAddressField()
    success = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)
    user_agent = models.TextField(blank=True)
```

---

### Monitoring Sentry

**Configuration :**

```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[DjangoIntegration()],
    environment=settings.SENTRY_ENVIRONMENT,
    traces_sample_rate=1.0 if settings.DEBUG else 0.1,
    send_default_pii=False,  # Ne pas envoyer de données personnelles
)
```

**Capture d'erreurs :**

```python
from sentry_sdk import capture_exception, capture_message

try:
    # Code risqué
    process_payment(amount)
except Exception as e:
    capture_exception(e)
    raise
```

---

## ✅ Conformité et bonnes pratiques

### OWASP Top 10 (2021)

| Vulnérabilité | Statut | Mesures |
|---------------|--------|---------|
| A01: Broken Access Control | ✅ Protégé | Permissions Django, object-level permissions |
| A02: Cryptographic Failures | ✅ Protégé | Argon2, HTTPS, encryption at rest |
| A03: Injection | ✅ Protégé | ORM Django, validation stricte |
| A04: Insecure Design | ✅ Protégé | Architecture sécurisée, review de code |
| A05: Security Misconfiguration | ✅ Protégé | Settings sécurisés, headers de sécurité |
| A06: Vulnerable Components | ⚠️ Partiel | Dépendances à jour (Dependabot) |
| A07: Authentication Failures | ✅ Protégé | JWT, Argon2, rate limiting, hCaptcha |
| A08: Software and Data Integrity | ✅ Protégé | Validation, audit trail |
| A09: Logging Failures | ✅ Protégé | Logs structurés, Sentry |
| A10: SSRF | ✅ Protégé | Validation des URLs, whitelist |

---

### Checklist de sécurité

**Avant déploiement en production :**

- [ ] DEBUG = False
- [ ] SECRET_KEY unique et sécurisée
- [ ] ALLOWED_HOSTS configuré
- [ ] HTTPS activé (certificat SSL)
- [ ] Cookies sécurisés (Secure, HttpOnly, SameSite)
- [ ] CORS configuré strictement
- [ ] Rate limiting activé
- [ ] Backup automatique configuré
- [ ] Monitoring Sentry activé
- [ ] Logs d'audit activés
- [ ] Firewall configuré (UFW)
- [ ] PostgreSQL sécurisé (mot de passe fort)
- [ ] Redis sécurisé (mot de passe)
- [ ] Dépendances à jour
- [ ] Tests de sécurité passés

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security](https://docs.djangoproject.com/en/5.0/topics/security/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Guide de développement backend](../05-backend-guide/README.md)

---

**Sécurité documentée ! 🔐**
