# ⚙️ Guide de configuration - VIDA

Guide complet pour configurer les environnements de développement, staging et production.

---

## 📋 Table des matières

1. [Configuration Backend](#-configuration-backend)
2. [Configuration Frontend](#-configuration-frontend)
3. [Configuration Base de données](#-configuration-base-de-données)
4. [Configuration Redis](#-configuration-redis)
5. [Configuration Email](#-configuration-email)
6. [Configuration Sécurité](#-configuration-sécurité)
7. [Configuration Production](#-configuration-production)

---

## 🔧 Configuration Backend

### Fichier `.env`

Le backend utilise un fichier `.env` pour toutes les variables d'environnement.

**Emplacement** : `backend/.env`

```bash
# Copier le fichier exemple
cp backend/.env.example backend/.env
```

### Variables essentielles

#### Django Core

```env
# Clé secrète Django (CHANGER EN PRODUCTION)
SECRET_KEY=django-insecure-change-this-in-production-xyz123

# Mode debug (False en production)
DEBUG=True

# Hosts autorisés (séparer par des virgules)
ALLOWED_HOSTS=localhost,127.0.0.1,vida.cg

# URL du frontend (pour CORS)
FRONTEND_URL=http://localhost:3000
```

**Générer une SECRET_KEY sécurisée :**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### Base de données

```env
# PostgreSQL
DB_NAME=vida_db
DB_USER=vida_user
DB_PASSWORD=vida_password_secure_123
DB_HOST=localhost
DB_PORT=5432

# Pour Docker
# DB_HOST=db
```

#### Redis

```env
# URL Redis
REDIS_URL=redis://localhost:6379/0

# Pour Docker
# REDIS_URL=redis://redis:6379/0

# Cache timeout (secondes)
CACHE_TTL=300
```

#### Celery

```env
# Broker URL (Redis)
CELERY_BROKER_URL=redis://localhost:6379/0

# Result backend
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Timezone
CELERY_TIMEZONE=Africa/Brazzaville
```

---

### Configuration Email

#### Développement (Console)

```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

Les emails s'affichent dans la console au lieu d'être envoyés.

#### Production (SMTP)

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=centremedvida@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=Centre Médical VIDA <centremedvida@gmail.com>
```

**Pour Gmail :**
1. Activer l'authentification à 2 facteurs
2. Générer un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe dans `EMAIL_HOST_PASSWORD`

#### Autres fournisseurs SMTP

**SendGrid :**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
```

**Mailgun :**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_HOST_USER=postmaster@your-domain.com
EMAIL_HOST_PASSWORD=your-mailgun-password
```

---

### Configuration Sécurité

#### JWT (Authentification)

```env
# Durée de vie des tokens (minutes)
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=10080  # 7 jours

# Cookies sécurisés (True en production)
JWT_AUTH_COOKIE_SECURE=False
JWT_AUTH_COOKIE_HTTP_ONLY=True
JWT_AUTH_COOKIE_SAMESITE=Lax
```

#### hCaptcha

```env
# Clés hCaptcha (obtenir sur https://www.hcaptcha.com/)
HCAPTCHA_SECRET_KEY=0x0000000000000000000000000000000000000000
HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001

# Désactiver en dev (optionnel)
HCAPTCHA_VERIFY=True
```

#### CORS

```env
# Origines autorisées (séparer par des virgules)
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://vida.cg

# Autoriser les credentials
CORS_ALLOW_CREDENTIALS=True
```

#### Rate Limiting

```env
# Throttling (requêtes par heure)
THROTTLE_ANON_RATE=100/hour
THROTTLE_USER_RATE=1000/hour
THROTTLE_LOGIN_RATE=5/15min

# Whitelist IPs (séparer par des virgules)
THROTTLE_WHITELIST_IPS=127.0.0.1,::1
```

---

### Configuration Monitoring

#### Sentry

```env
# Sentry DSN (obtenir sur https://sentry.io/)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Environnement
SENTRY_ENVIRONMENT=development

# Taux d'échantillonnage (0.0 à 1.0)
SENTRY_TRACES_SAMPLE_RATE=1.0
```

#### Logging

```env
# Niveau de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_LEVEL=INFO

# Fichier de log
LOG_FILE=/var/log/vida/django.log
```

---

### Configuration Backup

```env
# Répertoire de backup
BACKUP_DIR=/var/backups/vida

# Rétention (jours)
BACKUP_RETENTION_DAYS=30

# Email de notification
BACKUP_NOTIFICATION_EMAIL=admin@vida.cg
```

---

## 🎨 Configuration Frontend

### Fichier `.env.local`

Le frontend utilise `.env.local` pour les variables d'environnement.

**Emplacement** : `frontend/.env.local`

```bash
# Copier le fichier exemple
cp frontend/.env.example frontend/.env.local
```

### Variables essentielles

```env
# URL de l'API backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# hCaptcha site key
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001

# Environnement
NEXT_PUBLIC_ENV=development

# URL du site (pour SEO)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Variables par environnement

#### Développement

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ENV=development
NODE_ENV=development
```

#### Staging

```env
NEXT_PUBLIC_API_URL=https://api-staging.vida.cg/api/v1
NEXT_PUBLIC_ENV=staging
NODE_ENV=production
```

#### Production

```env
NEXT_PUBLIC_API_URL=https://api.vida.cg/api/v1
NEXT_PUBLIC_ENV=production
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://vida.cg
```

---

## 🗄️ Configuration Base de données

### PostgreSQL

#### Configuration de base

**Fichier** : `/etc/postgresql/15/main/postgresql.conf`

```conf
# Connexions
max_connections = 100
shared_buffers = 256MB

# Performance
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 4MB

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d.log'
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

#### Authentification

**Fichier** : `/etc/postgresql/15/main/pg_hba.conf`

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
host    vida_db         vida_user       172.18.0.0/16           md5
```

#### Backup automatique

**Créer un script de backup** : `/usr/local/bin/backup-vida-db.sh`

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/vida"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -U vida_user vida_db | gzip > "$BACKUP_DIR/vida_db_$TIMESTAMP.sql.gz"
find "$BACKUP_DIR" -name "vida_db_*.sql.gz" -mtime +30 -delete
```

**Ajouter au crontab** :

```bash
# Backup quotidien à 2h du matin
0 2 * * * /usr/local/bin/backup-vida-db.sh
```

---

## 🔴 Configuration Redis

### Configuration de base

**Fichier** : `/etc/redis/redis.conf`

```conf
# Bind
bind 127.0.0.1 ::1

# Port
port 6379

# Mot de passe (recommandé en production)
# requirepass your-redis-password-here

# Persistence
save 900 1
save 300 10
save 60 10000

# Mémoire maximale
maxmemory 256mb
maxmemory-policy allkeys-lru

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
```

### Sécurisation Redis

```bash
# Générer un mot de passe fort
openssl rand -base64 32

# Éditer redis.conf
sudo nano /etc/redis/redis.conf

# Ajouter :
requirepass your-generated-password-here

# Redémarrer Redis
sudo service redis-server restart
```

**Mettre à jour `.env` :**

```env
REDIS_URL=redis://:your-generated-password-here@localhost:6379/0
```

---

## 🔐 Configuration Sécurité

### HTTPS (Production)

#### Avec Nginx + Let's Encrypt

**Installer Certbot :**

```bash
sudo apt install certbot python3-certbot-nginx
```

**Obtenir un certificat :**

```bash
sudo certbot --nginx -d vida.cg -d www.vida.cg
```

**Configuration Nginx** : `/etc/nginx/sites-available/vida`

```nginx
server {
    listen 80;
    server_name vida.cg www.vida.cg;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vida.cg www.vida.cg;

    ssl_certificate /etc/letsencrypt/live/vida.cg/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vida.cg/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 🚀 Configuration Production

### Backend Production

**Fichier** : `backend/.env.production`

```env
# Django
SECRET_KEY=your-super-secret-production-key-here
DEBUG=False
ALLOWED_HOSTS=vida.cg,www.vida.cg,api.vida.cg

# Base de données
DB_NAME=vida_production
DB_USER=vida_prod_user
DB_PASSWORD=super-secure-password-here
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://:redis-password@localhost:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=centremedvida@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# JWT
JWT_AUTH_COOKIE_SECURE=True
JWT_AUTH_COOKIE_SAMESITE=Strict

# CORS
CORS_ALLOWED_ORIGINS=https://vida.cg,https://www.vida.cg

# Sentry
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Backup
BACKUP_DIR=/var/backups/vida
BACKUP_NOTIFICATION_EMAIL=admin@vida.cg
```

### Frontend Production

**Fichier** : `frontend/.env.production`

```env
NEXT_PUBLIC_API_URL=https://api.vida.cg/api/v1
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-production-hcaptcha-key
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SITE_URL=https://vida.cg
NODE_ENV=production
```

### Build Production

```bash
# Backend
cd backend
python manage.py collectstatic --noinput
python manage.py migrate

# Frontend
cd frontend
pnpm build
```

### Services systemd

**Backend** : `/etc/systemd/system/vida-backend.service`

```ini
[Unit]
Description=VIDA Backend (Gunicorn)
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=vida
Group=vida
WorkingDirectory=/var/www/vida/backend
Environment="PATH=/var/www/vida/backend/venv/bin"
ExecStart=/var/www/vida/backend/venv/bin/gunicorn \
    --workers 4 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /var/log/vida/gunicorn-access.log \
    --error-logfile /var/log/vida/gunicorn-error.log \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

**Celery Worker** : `/etc/systemd/system/vida-celery.service`

```ini
[Unit]
Description=VIDA Celery Worker
After=network.target redis.service

[Service]
Type=forking
User=vida
Group=vida
WorkingDirectory=/var/www/vida/backend
Environment="PATH=/var/www/vida/backend/venv/bin"
ExecStart=/var/www/vida/backend/venv/bin/celery -A config worker \
    --loglevel=info \
    --logfile=/var/log/vida/celery-worker.log

[Install]
WantedBy=multi-user.target
```

**Frontend** : `/etc/systemd/system/vida-frontend.service`

```ini
[Unit]
Description=VIDA Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=vida
Group=vida
WorkingDirectory=/var/www/vida/frontend
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/pnpm start

[Install]
WantedBy=multi-user.target
```

**Activer les services :**

```bash
sudo systemctl daemon-reload
sudo systemctl enable vida-backend vida-celery vida-frontend
sudo systemctl start vida-backend vida-celery vida-frontend
```

---

## 📊 Variables d'environnement complètes

### Backend (`.env`)

```env
# Django Core
SECRET_KEY=
DEBUG=
ALLOWED_HOSTS=
FRONTEND_URL=

# Database
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

# Redis
REDIS_URL=
CACHE_TTL=

# Celery
CELERY_BROKER_URL=
CELERY_RESULT_BACKEND=
CELERY_TIMEZONE=

# Email
EMAIL_BACKEND=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USE_TLS=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=

# JWT
JWT_ACCESS_TOKEN_LIFETIME=
JWT_REFRESH_TOKEN_LIFETIME=
JWT_AUTH_COOKIE_SECURE=
JWT_AUTH_COOKIE_HTTP_ONLY=
JWT_AUTH_COOKIE_SAMESITE=

# hCaptcha
HCAPTCHA_SECRET_KEY=
HCAPTCHA_SITE_KEY=
HCAPTCHA_VERIFY=

# CORS
CORS_ALLOWED_ORIGINS=
CORS_ALLOW_CREDENTIALS=

# Throttling
THROTTLE_ANON_RATE=
THROTTLE_USER_RATE=
THROTTLE_LOGIN_RATE=
THROTTLE_WHITELIST_IPS=

# Sentry
SENTRY_DSN=
SENTRY_ENVIRONMENT=
SENTRY_TRACES_SAMPLE_RATE=

# Logging
LOG_LEVEL=
LOG_FILE=

# Backup
BACKUP_DIR=
BACKUP_RETENTION_DAYS=
BACKUP_NOTIFICATION_EMAIL=
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
NEXT_PUBLIC_ENV=
NEXT_PUBLIC_SITE_URL=
NODE_ENV=
```

---

## 🔍 Vérification de la configuration

### Script de vérification

**Créer** : `backend/check_config.py`

```python
import os
from django.core.management.utils import get_random_secret_key

def check_config():
    errors = []
    warnings = []
    
    # Vérifier SECRET_KEY
    if os.getenv('SECRET_KEY', '').startswith('django-insecure'):
        errors.append("SECRET_KEY utilise la valeur par défaut (DANGEREUX)")
    
    # Vérifier DEBUG
    if os.getenv('DEBUG', 'False') == 'True':
        warnings.append("DEBUG=True (désactiver en production)")
    
    # Vérifier DB
    if not os.getenv('DB_PASSWORD'):
        errors.append("DB_PASSWORD non défini")
    
    # Afficher les résultats
    if errors:
        print("❌ ERREURS:")
        for error in errors:
            print(f"  - {error}")
    
    if warnings:
        print("⚠️  AVERTISSEMENTS:")
        for warning in warnings:
            print(f"  - {warning}")
    
    if not errors and not warnings:
        print("✅ Configuration OK")

if __name__ == '__main__':
    check_config()
```

**Exécuter :**

```bash
cd backend
python check_config.py
```

---

## 📚 Prochaines étapes

- **Premiers pas** → [Tutoriel de démarrage](./first-steps.md)
- **Architecture** → [Vue d'ensemble](../02-architecture/overview.md)
- **Déploiement** → [Guide de déploiement](../06-deployment/README.md)

---

**Configuration terminée ! ⚙️**
