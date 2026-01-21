# ⚡ Guide des tâches Celery - VIDA

Documentation des tâches asynchrones.

---

## 📧 Tâches d'emails

```python
from celery import shared_task

@shared_task
def send_appointment_confirmation(appointment_id):
    appointment = Appointment.objects.get(id=appointment_id)
    send_email(appointment.patient_email, 'confirmation.html', {...})
```

## 🧹 Tâches de nettoyage

```python
@shared_task
def cleanup_expired_tokens():
    EmailVerificationToken.objects.filter(
        expires_at__lt=timezone.now()
    ).delete()
```

---

## 📚 Voir aussi

- [Architecture backend](../02-architecture/backend-architecture.md)
