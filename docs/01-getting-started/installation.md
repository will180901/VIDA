# 📦 Guide d'installation - VIDA

Guide complet pour installer le projet VIDA sur votre machine de développement.

---

## 📋 Table des matières

1. [Prérequis](#-prérequis)
2. [Installation avec Docker](#-installation-avec-docker-recommandé)
3. [Installation manuelle](#-installation-manuelle)
4. [Vérification de l'installation](#-vérification-de-linstallation)
5. [Dépannage](#-dépannage)

---

## 🔧 Prérequis

### Système d'exploitation

- ✅ Linux (Ubuntu 20.04+, Debian 11+)
- ✅ macOS (11+)
- ✅ Windows 10/11 (avec WSL2 recommandé)

### Logiciels requis

#### Python 3.11+

```bash
# Vérifier la version
python --version  # ou python3 --version

# Installation sur Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Installation sur macOS (avec Homebrew)
brew install python@3.11

# Installation sur Windows
# Télécharger depuis https://www.python.org/downloads/
```

#### Node.js 20+

```bash
# Vérifier la version
node --version

# Installation avec nvm (recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Installation sur Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installation sur macOS
brew install node@20

# Installation sur Windows
# Télécharger depuis https://nodejs.org/
```

#### PostgreSQL 15+

```bash
# Vérifier la version
psql --version

# Installation sur Ubuntu/Debian
sudo apt install postgresql-15 postgresql-contrib

# Installation sur macOS
brew install postgresql@15

# Installation sur Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

#### Redis 7+

```bash
# Vérifier la version
redis-cli --version

# Installation sur Ubuntu/Debian
sudo apt install redis-server

# Installation sur macOS
brew install redis

# Installation sur Windows
# Utiliser WSL2 ou télécharger depuis https://github.com/microsoftarchive/redis/releases
```

---

## 🐳 Installation avec Docker (Recommandé)

### 1. Installer Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# macOS/Windows
# Télécharger Docker Desktop depuis https://www.docker.com/products/docker-desktop
```

### 2. Cloner le projet

```bash
git clone https://github.com/your-repo/vida.git
cd vida
```

### 3. Configurer les variables d'environnement

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

**Éditer `backend/.env` :**

```env
# Base de données (Docker)
DB_NAME=vida_db
DB_USER=vida_user
DB_PASSWORD=vida_password_secure_123
DB_HOST=db
DB_PORT=5432

# Redis (Docker)
REDIS_URL=redis://redis:6379/0

# Django
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email (optionnel pour dev)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

**Éditer `frontend/.env.local` :**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
```

### 4. Lancer les conteneurs

```bash
# Construire et démarrer
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Vérifier le statut
docker-compose ps
```

### 5. Initialiser la base de données

```bash
# Appliquer les migrations
docker-compose exec backend python manage.py migrate

# Créer un superutilisateur
docker-compose exec backend python manage.py createsuperuser

# Charger les données initiales
docker-compose exec backend python manage.py loaddata clinic_settings hero_slides medical_services
```

### 6. Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Admin Django** : http://localhost:8000/admin
- **API Docs (Swagger)** : http://localhost:8000/api/schema/swagger-ui/
- **API Docs (ReDoc)** : http://localhost:8000/api/schema/redoc/

---

## 🔨 Installation manuelle

### 1. Cloner le projet

```bash
git clone https://github.com/your-repo/vida.git
cd vida
```

---

### 2. Configuration de la base de données

#### Démarrer PostgreSQL

```bash
# Ubuntu/Debian
sudo service postgresql start

# macOS
brew services start postgresql@15

# Windows (WSL2)
sudo service postgresql start
```

#### Créer la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans psql, exécuter :
CREATE DATABASE vida_db;
CREATE USER vida_user WITH PASSWORD 'vida_password_secure_123';
ALTER ROLE vida_user SET client_encoding TO 'utf8';
ALTER ROLE vida_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE vida_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE vida_db TO vida_user;
\q
```

---

### 3. Installation du Backend

```bash
cd backend

# Créer un environnement virtuel
python3 -m venv venv

# Activer l'environnement virtuel
# Linux/macOS
source venv/bin/activate
# Windows
venv\Scripts\activate

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos paramètres
nano .env  # ou vim, code, etc.
```

**Configuration `.env` :**

```env
# Base de données
DB_NAME=vida_db
DB_USER=vida_user
DB_PASSWORD=vida_password_secure_123
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Django
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email (console pour dev)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

#### Initialiser la base de données

```bash
# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Charger les données initiales
python manage.py loaddata fixtures/clinic_settings.json
python manage.py loaddata fixtures/hero_slides.json
python manage.py loaddata fixtures/medical_services.json

# Collecter les fichiers statiques
python manage.py collectstatic --noinput
```

#### Démarrer le serveur backend

```bash
# Serveur de développement
python manage.py runserver

# Le backend est accessible sur http://localhost:8000
```

---

### 4. Installation du Frontend

**Ouvrir un nouveau terminal :**

```bash
cd frontend

# Installer pnpm (si pas déjà installé)
npm install -g pnpm

# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Éditer .env.local
nano .env.local
```

**Configuration `.env.local` :**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
```

#### Démarrer le serveur frontend

```bash
# Mode développement
pnpm dev

# Le frontend est accessible sur http://localhost:3000
```

---

### 5. Configuration de Redis

```bash
# Démarrer Redis
# Ubuntu/Debian
sudo service redis-server start

# macOS
brew services start redis

# Windows (WSL2)
sudo service redis start

# Vérifier que Redis fonctionne
redis-cli ping
# Doit retourner : PONG
```

---

### 6. Configuration de Celery (Tâches asynchrones)

**Ouvrir un nouveau terminal :**

```bash
cd backend
source venv/bin/activate  # Activer l'environnement virtuel

# Démarrer Celery worker
celery -A config worker -l info

# Dans un autre terminal, démarrer Celery beat (tâches planifiées)
celery -A config beat -l info
```

---

## ✅ Vérification de l'installation

### 1. Vérifier le backend

```bash
# Tester l'API
curl http://localhost:8000/api/v1/

# Accéder à l'admin Django
# Ouvrir http://localhost:8000/admin dans le navigateur
# Se connecter avec le superutilisateur créé
```

### 2. Vérifier le frontend

```bash
# Ouvrir http://localhost:3000 dans le navigateur
# Vous devriez voir la page d'accueil VIDA
```

### 3. Vérifier la connexion frontend-backend

```bash
# Sur la page d'accueil, cliquer sur "Prendre RDV"
# Le modal devrait s'ouvrir et charger les créneaux disponibles
```

### 4. Vérifier Celery

```bash
# Dans le terminal Celery worker, vous devriez voir :
# [tasks]
#   . apps.appointments.tasks.send_appointment_confirmation
#   . apps.appointments.tasks.send_appointment_reminder
#   . apps.users.tasks.cleanup_expired_tokens
```

### 5. Vérifier Redis

```bash
redis-cli
> PING
PONG
> KEYS *
(empty array or list of keys)
> EXIT
```

---

## 🧪 Lancer les tests

### Tests backend

```bash
cd backend
source venv/bin/activate

# Tous les tests
pytest

# Tests avec couverture
pytest --cov=apps --cov-report=html

# Tests spécifiques
pytest tests/test_authentication.py
pytest tests/test_appointments.py
```

### Tests frontend

```bash
cd frontend

# Tests unitaires (si configurés)
pnpm test

# Linter
pnpm lint

# Type checking
pnpm type-check
```

---

## 🐛 Dépannage

### Problème : Port déjà utilisé

```bash
# Backend (port 8000)
# Trouver le processus
lsof -i :8000
# Tuer le processus
kill -9 <PID>

# Frontend (port 3000)
lsof -i :3000
kill -9 <PID>
```

### Problème : PostgreSQL ne démarre pas

```bash
# Vérifier le statut
sudo service postgresql status

# Voir les logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Redémarrer
sudo service postgresql restart
```

### Problème : Redis ne démarre pas

```bash
# Vérifier le statut
sudo service redis-server status

# Voir les logs
sudo tail -f /var/log/redis/redis-server.log

# Redémarrer
sudo service redis-server restart
```

### Problème : Erreur de migration Django

```bash
# Réinitialiser les migrations (ATTENTION : perte de données)
python manage.py migrate --fake-initial

# Ou supprimer la base et recréer
dropdb vida_db
createdb vida_db
python manage.py migrate
```

### Problème : Modules Python manquants

```bash
# Réinstaller les dépendances
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Problème : Modules Node manquants

```bash
# Nettoyer et réinstaller
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📚 Prochaines étapes

Maintenant que l'installation est terminée :

1. **Configuration avancée** → [Guide de configuration](./configuration.md)
2. **Premiers pas** → [Tutoriel de démarrage](./first-steps.md)
3. **Architecture** → [Vue d'ensemble](../02-architecture/overview.md)

---

## 🆘 Besoin d'aide ?

- 📖 [Guide de dépannage complet](../07-maintenance/troubleshooting.md)
- 💬 [Forum de discussion](https://github.com/your-repo/vida/discussions)
- 🐛 [Signaler un bug](https://github.com/your-repo/vida/issues)

---

**Installation terminée ! 🎉**
