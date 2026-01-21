# Installation de VIDA

## Prérequis Système

| Outil | Version Minimale |
|-------|----------------|
| Python | 3.10+ |
| Node.js | 20+ |
| pnpm | 9+ |
| Git | 2.0+ |

## Installation du Backend

### 1. Cloner le Projet

```bash
git clone <repository-url>
cd VIDA/backend
```

### 2. Créer l'Environnement Virtuel

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python -m venv venv
source venv/bin/activate
```

### 3. Installer les Dépendances

```bash
pip install -r requirements.txt
```

### 4. Configuration

```bash
cp .env.example .env
```

Modifier le fichier `.env` selon vos besoins.

### 5. Migrations et Données

```bash
python manage.py migrate
python manage.py loaddata ../fixtures/*.json
```

### 6. Lancer le Serveur

```bash
python manage.py runserver
```

## Installation du Frontend

### 1. Aller dans le Dossier Frontend

```bash
cd ../frontend
```

### 2. Installer les Dépendances

```bash
pnpm install
```

### 3. Lancer le Serveur de Développement

```bash
pnpm dev
```

## Vérification

- Backend : http://localhost:8000
- Frontend : http://localhost:3000
- Admin : http://localhost:8000/admin
