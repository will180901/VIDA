"""
Commande Django pour nettoyer les anciens logs d'audit
Usage: python manage.py cleanup_audit_logs [--days=90]
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.users.models_audit import AuditLog, LoginAttempt


class Command(BaseCommand):
    help = 'Nettoie les logs d\'audit de plus de X jours'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Supprimer les logs de plus de X jours (défaut: 90)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Afficher ce qui serait supprimé sans supprimer'
        )
    
    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Logs d'audit
        audit_logs = AuditLog.objects.filter(timestamp__lt=cutoff_date)
        audit_count = audit_logs.count()
        
        # Tentatives de connexion
        login_attempts = LoginAttempt.objects.filter(timestamp__lt=cutoff_date)
        login_count = login_attempts.count()
        
        self.stdout.write(self.style.WARNING('🗑️  Nettoyage des logs d\'audit'))
        self.stdout.write(f'   Date limite: {cutoff_date.strftime("%Y-%m-%d %H:%M:%S")}')
        self.stdout.write(f'   Logs d\'audit à supprimer: {audit_count}')
        self.stdout.write(f'   Tentatives de connexion à supprimer: {login_count}')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\n⚠️  Mode dry-run: aucune suppression effectuée'))
            return
        
        # Confirmation
        if audit_count + login_count > 0:
            confirm = input(f'\nSupprimer {audit_count + login_count} enregistrements? (oui/non): ')
            if confirm.lower() != 'oui':
                self.stdout.write('Annulé')
                return
        
        # Suppression
        if audit_count > 0:
            audit_logs.delete()
            self.stdout.write(self.style.SUCCESS(f'✅ {audit_count} logs d\'audit supprimés'))
        
        if login_count > 0:
            login_attempts.delete()
            self.stdout.write(self.style.SUCCESS(f'✅ {login_count} tentatives de connexion supprimées'))
        
        if audit_count + login_count == 0:
            self.stdout.write(self.style.SUCCESS('✅ Aucun log à supprimer'))
