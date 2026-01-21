# Configuration de VIDA

## Fichier .env

Copier le fichier d'exemple :

```bash
cp .env.example .env
```

### Variables Obligatoires

```env
# ===================
# SÉCURITÉ
# ===================
DEBUG=True
SECRET_KEY=votre-cle-secrete-min-32-caracteres

# ===================
# BASE DE DONNÉES (SQLite en local)
# ===================
DATABASE_URL=sqlite:///db.sqlite3

# ===================
# AUTHENTIFICATION
# ===================
SIMPLE_JWT_ACCESS_TOKEN_LIFETIME=60
SIMPLE_JWT_REFRESH_TOKEN_LIFETIME=1440
HCAPTCHA_SITE_KEY=votre-hcaptcha-site-key
HCAPTCHA_SECRET_KEY=votre-hcaptcha-secret-key

# ===================
# FRONTEND
# ===================
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Base de Données

### Développement (SQLite)

```env
DATABASE_URL=sqlite:///db.sqlite3
```

### Production (PostgreSQL)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vida
```

## Commandes Utiles

```bash
# Créer les migrations après modification des modèles
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Collecter les fichiers statiques
python manage.py collectstatic
```

## Variables Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend |
| `NEXT_PUBLIC_APP_URL` | URL de l'application |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | Clé publique hCaptcha |
