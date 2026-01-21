# 📊 Guide des modèles - VIDA

Documentation des modèles Django.

---

## 👤 User

```python
from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.create_user(
    email='patient@example.com',
    password='password',
    first_name='Jean',
    last_name='Dupont'
)
```

## 📅 Appointment

```python
from apps.appointments.models import Appointment

appointment = Appointment.objects.create(
    patient_first_name='Jean',
    patient_last_name='Dupont',
    patient_email='jean@example.com',
    patient_phone='06 123 45 67',
    date='2026-02-01',
    time='10:00',
    consultation_type='generale'
)
```

---

## 📚 Voir aussi

- [Architecture backend](../02-architecture/backend-architecture.md)
- [Base de données](../02-architecture/database-schema.md)
