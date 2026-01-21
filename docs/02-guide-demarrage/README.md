# Guide de Démarrage - VIDA

## Présentation

VIDA est une plateforme web complète de gestion d'un centre médical ophtalmologique située à Brazzaville, Congo.

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Backend** | Django 5.0, Django REST Framework |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Gestionnaire Python** | venv avec requirements.txt |
| **Gestionnaire Frontend** | pnpm |
| **Base de données (dev)** | SQLite |
| **Base de données (prod)** | PostgreSQL |
| **Authentification** | JWT (SimpleJWT), hCaptcha |

## Prérequis

- Python 3.10+
- Node.js 20+
- pnpm 9+
- Git

## Installation

### Backend

```bash
# Créer l'environnement virtuel
cd backend
python -m venv venv

# Activer l'environnement virtuel (Windows)
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cp .env.example .env

# Appliquer les migrations
python manage.py migrate

# Charger les données initiales
python manage.py loaddata ../backend/fixtures/*.json

# Lancer le serveur
python manage.py runserver
```

### Frontend

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances avec pnpm
pnpm install

# Lancer le serveur de développement
pnpm dev
```

## Accès aux Services

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **Admin Django** | http://localhost:8000/admin |

## Documentation

- [Installation](installation.md) - Procédure détaillée
- [Configuration](configuration.md) - Variables d'environnement
