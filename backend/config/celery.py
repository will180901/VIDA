"""
Celery configuration for VIDA project.
"""

import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("vida")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


# Configuration des tâches périodiques
app.conf.beat_schedule = {
    # Nettoyage des tokens expirés - tous les jours à 2h du matin
    'cleanup-expired-tokens': {
        'task': 'apps.users.tasks.cleanup_expired_tokens',
        'schedule': crontab(hour=2, minute=0),
    },
    
    # Nettoyage des tokens JWT blacklistés - tous les jours à 3h du matin
    'cleanup-blacklisted-tokens': {
        'task': 'apps.users.tasks.cleanup_blacklisted_tokens',
        'schedule': crontab(hour=3, minute=0),
    },
    
    # Nettoyage des locks de créneaux - toutes les 15 minutes
    'cleanup-expired-slot-locks': {
        'task': 'apps.appointments.tasks.cleanup_expired_slot_locks',
        'schedule': crontab(minute='*/15'),
    },
    
    # Envoi des rappels de RDV - tous les jours à 18h
    'send-appointment-reminders': {
        'task': 'apps.appointments.tasks.send_appointment_reminders',
        'schedule': crontab(hour=18, minute=0),
    },
    
    # Mise à jour des RDV passés - tous les jours à minuit
    'mark-past-appointments': {
        'task': 'apps.appointments.tasks.mark_past_appointments_completed',
        'schedule': crontab(hour=0, minute=0),
    },
    
    # Backup automatique de la base de données - tous les jours à 2h du matin
    'backup-database': {
        'task': 'apps.users.tasks.backup_database',
        'schedule': crontab(hour=2, minute=30),
    },
    
    # Nettoyage des logs d'audit - le 1er de chaque mois à 3h
    'cleanup-audit-logs': {
        'task': 'apps.users.tasks.cleanup_old_audit_logs',
        'schedule': crontab(hour=3, minute=0, day_of_month=1),
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
