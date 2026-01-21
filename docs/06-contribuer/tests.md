# Tests - VIDA

## Introduction

Le projet utilise **pytest** pour les tests backend et les outils natifs de Next.js pour le frontend.

## Backend - Tests Pytest

### Structure

```
backend/
├── apps/
│   └── users/
│       ├── tests/
│       │   ├── __init__.py
│       │   ├── test_models.py
│       │   ├── test_views.py
│       │   └── test_serializers.py
│       └── models.py
```

### Exemple de Test de Modèle

```python
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_create_user():
    """Test de création d'utilisateur."""
    email = "test@example.com"
    password = "testpassword123"
    
    user = User.objects.create_user(
        email=email,
        password=password
    )
    
    assert user.email == email
    assert user.check_password(password)
    assert not user.is_staff
    assert not user.is_superuser


@pytest.mark.django_db
def test_create_superuser():
    """Test de création de superutilisateur."""
    user = User.objects.create_superuser(
        email="admin@example.com",
        password="adminpassword123"
    )
    
    assert user.is_staff
    assert user.is_superuser
```

### Exemple de Test de View

```python
import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_register_user():
    """Test d'inscription utilisateur."""
    client = APIClient()
    url = reverse("register")
    
    data = {
        "email": "newuser@example.com",
        "password": "NewPassword123!",
        "password_confirm": "NewPassword123!",
        "first_name": "Jean",
        "last_name": "Dupont",
        "phone": "+242012345678",
    }
    
    response = client.post(url, data, format="json")
    
    assert response.status_code == 201
    assert response.data["message"] == "Compte créé avec succès."
```

### Exécuter les Tests

```bash
# Tous les tests
pytest

# Tests d'une app spécifique
pytest apps/users/

# Tests avec couverture
pytest --cov=apps

# Tests en parallèle
pytest -n auto
```

## Frontend - Tests

### Lancer les Tests

```bash
# Tests unitaires
pnpm test

# Tests avec couverture
pnpm test:coverage

# Tests en mode watch
pnpm test:watch
```

## Couverture de Code

### Objectifs

| Module | Couverture Minimale |
|--------|-------------------|
| Modèles | 100% |
| Vues/Views | 80% |
| Serializers | 80% |
| Utils | 100% |

### Vérifier la Couverture

```bash
# Backend
pytest --cov=apps --cov-report=html

# Ouvrir le rapport HTML
open htmlcov/index.html
```
