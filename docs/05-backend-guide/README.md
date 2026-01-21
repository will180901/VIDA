# 🔧 Guide Backend - VIDA

Guide complet de développement backend avec Django.

---

## 📋 Table des matières

1. **[Modèles](./models.md)** - Guide des modèles Django
2. **[Views](./views.md)** - Views et API endpoints
3. **[Serializers](./serializers.md)** - Serializers DRF
4. **[Tasks](./tasks.md)** - Tâches Celery
5. **[Testing](./testing.md)** - Tests automatisés

---

## 🚀 Démarrage rapide

### Prérequis

- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Configuration

```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

### Migrations

```bash
python manage.py migrate
python manage.py createsuperuser
```

### Lancer le serveur

```bash
python manage.py runserver
```

---

## 📁 Structure

```
backend/
├── apps/
│   ├── users/
│   ├── appointments/
│   └── content_management/
├── config/
│   ├── settings/
│   └── *.py
├── fixtures/
├── templates/
└── tests/
```

---

## 🛠️ Commandes utiles

```bash
# Migrations
python manage.py makemigrations
python manage.py migrate

# Shell Django
python manage.py shell

# Créer un superutilisateur
python manage.py createsuperuser

# Charger les fixtures
python manage.py loaddata clinic_settings hero_slides medical_services

# Tests
pytest
pytest --cov=apps

# Celery
celery -A config worker -l info
celery -A config beat -l info
```

---

## 📚 Ressources

- [Architecture backend](../02-architecture/backend-architecture.md)
- [Documentation API](../03-api-documentation/README.md)
- [Base de données](../02-architecture/database-schema.md)
- [Sécurité](../02-architecture/security.md)

---

**Guide backend ! 🔧**
