# Guide de Contribution - VIDA

## Introduction

Ce guide décrit les conventions et procédures pour contribuer au projet VIDA.

## Prérequis

- Python 3.10+
- Node.js 20+
- pnpm 9+
- Git

## Cloner le Projet

```bash
git clone <repository-url>
cd VIDA
```

## Configuration de l'Environnement

### Backend

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/macOS

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
```

### Frontend

```bash
cd frontend

# Installer les dépendances
pnpm install
```

## Structure des Branches

| Branche | Description |
|---------|-------------|
| `main` | Branche principale (production) |
| `develop` | Branche de développement |
| `feature/*` | Nouvelles fonctionnalités |
| `bugfix/*` | Corrections de bugs |
| `hotfix/*` | Corrections urgentes |

## Workflow Git

```bash
# 1. Créer une branche
git checkout develop
git pull origin develop
git checkout -b feature/nouvelle-fonctionnalite

# 2. Travailler sur la fonctionnalité
# ... modifications ...

# 3. Commit (suivre les conventions)
git add .
git commit -m "feat: ajout de la fonctionnalité X"

# 4. Pousser la branche
git push origin feature/nouvelle-fonctionnalite

# 5. Créer une Pull Request
```

## Conventions de Commit

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage de code |
| `refactor` | Refactoring |
| `test` | Tests |
| `chore` | Tâches de maintenance |

## Documentation

- [Conventions de Code](conventions.md)
- [Tests](tests.md)
