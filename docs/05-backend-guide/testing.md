# 🧪 Guide des tests - VIDA

Documentation des tests automatisés.

---

## 🚀 Lancer les tests

```bash
# Tous les tests
pytest

# Avec couverture
pytest --cov=apps --cov-report=html

# Tests spécifiques
pytest tests/test_authentication.py
```

## 📝 Écrire un test

```python
from django.test import TestCase

class MyTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(...)
    
    def test_something(self):
        self.assertEqual(1 + 1, 2)
```

---

## 📚 Voir aussi

- [Architecture backend](../02-architecture/backend-architecture.md)
