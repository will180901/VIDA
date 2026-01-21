from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class Notification(models.Model):
    """
    Modèle de notification pour le système de notifications en temps réel.
    
    Utilisé pour notifier les admins et patients des événements importants :
    - Nouveau rendez-vous
    - Confirmation/Refus de RDV
    - Modification de RDV
    - Annulation
    - Rappels
    
    Fonctionnalités :
    - Notifications non lues avec badge
    - Groupement par date
    - Actions rapides (marquer lu, supprimer)
    - Redirection intelligente
    """
    
    # Types de notifications
    TYPE_CHOICES = [
        ('new_appointment', 'Nouveau rendez-vous'),
        ('appointment_confirmed', 'Rendez-vous confirmé'),
        ('appointment_rejected', 'Rendez-vous refusé'),
        ('appointment_cancelled', 'Rendez-vous annulé'),
        ('appointment_modified', 'Rendez-vous modifié'),
        ('counter_proposal', 'Contre-proposition'),
        ('proposal_accepted', 'Proposition acceptée'),
        ('proposal_rejected', 'Proposition rejetée'),
        ('appointment_reminder', 'Rappel de rendez-vous'),
        ('system', 'Notification système'),
    ]
    
    # Icônes Lucide React pour chaque type
    ICON_MAP = {
        'new_appointment': 'calendar-plus',
        'appointment_confirmed': 'check-circle',
        'appointment_rejected': 'x-circle',
        'appointment_cancelled': 'calendar-x',
        'appointment_modified': 'calendar-clock',
        'counter_proposal': 'message-square',
        'proposal_accepted': 'thumbs-up',
        'proposal_rejected': 'thumbs-down',
        'appointment_reminder': 'bell',
        'system': 'info',
    }
    
    # Couleurs pour chaque type (Tailwind classes)
    COLOR_MAP = {
        'new_appointment': 'blue',
        'appointment_confirmed': 'green',
        'appointment_rejected': 'red',
        'appointment_cancelled': 'red',
        'appointment_modified': 'orange',
        'counter_proposal': 'purple',
        'proposal_accepted': 'green',
        'proposal_rejected': 'red',
        'appointment_reminder': 'yellow',
        'system': 'gray',
    }
    
    # Champs principaux
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Utilisateur',
        help_text='Utilisateur qui reçoit la notification'
    )
    
    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        verbose_name='Type',
        help_text='Type de notification'
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name='Titre',
        help_text='Titre court de la notification'
    )
    
    message = models.TextField(
        verbose_name='Message',
        help_text='Message détaillé de la notification'
    )
    
    # Métadonnées
    icon = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Icône',
        help_text='Nom de l\'icône Lucide React (auto-généré si vide)'
    )
    
    color = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Couleur',
        help_text='Couleur de la notification (auto-générée si vide)'
    )
    
    # Lien d'action
    action_url = models.CharField(
        max_length=500,
        blank=True,
        verbose_name='URL d\'action',
        help_text='URL de redirection au clic (ex: /admin/appointments/123)'
    )
    
    # Relation avec le RDV (optionnel)
    related_appointment = models.ForeignKey(
        'appointments.Appointment',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name='Rendez-vous lié',
        help_text='Rendez-vous concerné par la notification'
    )
    
    # État
    is_read = models.BooleanField(
        default=False,
        verbose_name='Lu',
        help_text='La notification a été lue'
    )
    
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Lu le',
        help_text='Date et heure de lecture'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Créé le'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Modifié le'
    )
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['type']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email} ({'Lu' if self.is_read else 'Non lu'})"
    
    def save(self, *args, **kwargs):
        """Auto-générer l'icône et la couleur si non fournis"""
        if not self.icon:
            self.icon = self.ICON_MAP.get(self.type, 'bell')
        
        if not self.color:
            self.color = self.COLOR_MAP.get(self.type, 'gray')
        
        super().save(*args, **kwargs)
    
    def mark_as_read(self):
        """Marquer la notification comme lue"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_unread(self):
        """Marquer la notification comme non lue"""
        if self.is_read:
            self.is_read = False
            self.read_at = None
            self.save(update_fields=['is_read', 'read_at'])
    
    def get_time_ago(self):
        """
        Retourner le temps écoulé depuis la création de la notification
        Format : "Il y a X minutes/heures/jours"
        """
        now = timezone.now()
        diff = now - self.created_at
        
        if diff < timedelta(minutes=1):
            return "À l'instant"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"Il y a {minutes} minute{'s' if minutes > 1 else ''}"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"Il y a {hours} heure{'s' if hours > 1 else ''}"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"Il y a {days} jour{'s' if days > 1 else ''}"
        elif diff < timedelta(days=30):
            weeks = diff.days // 7
            return f"Il y a {weeks} semaine{'s' if weeks > 1 else ''}"
        else:
            months = diff.days // 30
            return f"Il y a {months} mois"
    
    def get_date_group(self):
        """
        Retourner le groupe de date pour le groupement dans l'UI
        Valeurs possibles : "Aujourd'hui", "Hier", "Cette semaine", "Plus ancien"
        """
        now = timezone.now()
        diff = now.date() - self.created_at.date()
        
        if diff.days == 0:
            return "Aujourd'hui"
        elif diff.days == 1:
            return "Hier"
        elif diff.days < 7:
            return "Cette semaine"
        else:
            return "Plus ancien"
    
    @classmethod
    def get_unread_count(cls, user):
        """Retourner le nombre de notifications non lues pour un utilisateur"""
        return cls.objects.filter(user=user, is_read=False).count()
    
    @classmethod
    def mark_all_as_read(cls, user):
        """Marquer toutes les notifications d'un utilisateur comme lues"""
        return cls.objects.filter(user=user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
    
    @classmethod
    def delete_all_read(cls, user):
        """Supprimer toutes les notifications lues d'un utilisateur"""
        return cls.objects.filter(user=user, is_read=True).delete()
    
    @classmethod
    def create_notification(cls, user, notification_type, title, message, 
                          action_url='', related_appointment=None):
        """
        Méthode helper pour créer une notification
        
        Args:
            user: Utilisateur qui reçoit la notification
            notification_type: Type de notification (voir TYPE_CHOICES)
            title: Titre de la notification
            message: Message détaillé
            action_url: URL de redirection (optionnel)
            related_appointment: Rendez-vous lié (optionnel)
        
        Returns:
            Notification créée
        """
        return cls.objects.create(
            user=user,
            type=notification_type,
            title=title,
            message=message,
            action_url=action_url,
            related_appointment=related_appointment
        )
