"""
Commande Django pour générer un rapport d'audit
Usage: python manage.py audit_report [--days=7] [--user=email] [--action=login]
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import models
from datetime import timedelta
from apps.users.models_audit import AuditLog, LoginAttempt
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Génère un rapport d\'audit des actions utilisateurs'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Nombre de jours à analyser (défaut: 7)'
        )
        parser.add_argument(
            '--user',
            type=str,
            help='Filtrer par email utilisateur'
        )
        parser.add_argument(
            '--action',
            type=str,
            help='Filtrer par type d\'action'
        )
        parser.add_argument(
            '--level',
            type=str,
            choices=['debug', 'info', 'warning', 'error', 'critical'],
            help='Filtrer par niveau'
        )
        parser.add_argument(
            '--export',
            type=str,
            help='Exporter vers un fichier CSV'
        )
    
    def handle(self, *args, **options):
        days = options['days']
        user_email = options.get('user')
        action = options.get('action')
        level = options.get('level')
        export_file = options.get('export')
        
        # Date de début
        start_date = timezone.now() - timedelta(days=days)
        
        # Filtrer les logs
        logs = AuditLog.objects.filter(timestamp__gte=start_date)
        
        if user_email:
            try:
                user = User.objects.get(email=user_email)
                logs = logs.filter(user=user)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Utilisateur {user_email} introuvable'))
                return
        
        if action:
            logs = logs.filter(action=action)
        
        if level:
            logs = logs.filter(level=level)
        
        # Statistiques
        total_logs = logs.count()
        
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS(f'📊 RAPPORT D\'AUDIT - {days} derniers jours'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write('')
        
        # Statistiques générales
        self.stdout.write(self.style.WARNING('📈 Statistiques générales:'))
        self.stdout.write(f'   Total d\'actions: {total_logs}')
        
        # Par action
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('🎯 Par type d\'action:'))
        actions_stats = logs.values('action').annotate(
            count=models.Count('id')
        ).order_by('-count')[:10]
        
        for stat in actions_stats:
            action_display = dict(AuditLog.ACTION_CHOICES).get(stat['action'], stat['action'])
            self.stdout.write(f'   • {action_display}: {stat["count"]}')
        
        # Par niveau
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('⚠️  Par niveau:'))
        levels_stats = logs.values('level').annotate(
            count=models.Count('id')
        ).order_by('-count')
        
        for stat in levels_stats:
            level_display = dict(AuditLog.LEVEL_CHOICES).get(stat['level'], stat['level'])
            count = stat['count']
            
            if stat['level'] == 'critical':
                self.stdout.write(self.style.ERROR(f'   • {level_display}: {count}'))
            elif stat['level'] == 'error':
                self.stdout.write(self.style.ERROR(f'   • {level_display}: {count}'))
            elif stat['level'] == 'warning':
                self.stdout.write(self.style.WARNING(f'   • {level_display}: {count}'))
            else:
                self.stdout.write(f'   • {level_display}: {count}')
        
        # Utilisateurs les plus actifs
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('👥 Utilisateurs les plus actifs:'))
        users_stats = logs.exclude(user__isnull=True).values(
            'user__email'
        ).annotate(
            count=models.Count('id')
        ).order_by('-count')[:10]
        
        for stat in users_stats:
            self.stdout.write(f'   • {stat["user__email"]}: {stat["count"]} actions')
        
        # IPs les plus actives
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('🌐 IPs les plus actives:'))
        ips_stats = logs.exclude(ip_address__isnull=True).values(
            'ip_address'
        ).annotate(
            count=models.Count('id')
        ).order_by('-count')[:10]
        
        for stat in ips_stats:
            self.stdout.write(f'   • {stat["ip_address"]}: {stat["count"]} actions')
        
        # Tentatives de connexion
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('🔐 Tentatives de connexion:'))
        login_attempts = LoginAttempt.objects.filter(timestamp__gte=start_date)
        total_attempts = login_attempts.count()
        successful = login_attempts.filter(success=True).count()
        failed = login_attempts.filter(success=False).count()
        
        self.stdout.write(f'   • Total: {total_attempts}')
        self.stdout.write(self.style.SUCCESS(f'   • Réussies: {successful}'))
        if failed > 0:
            self.stdout.write(self.style.ERROR(f'   • Échouées: {failed}'))
        else:
            self.stdout.write(f'   • Échouées: {failed}')
        
        # Échecs récents
        if failed > 0:
            self.stdout.write('')
            self.stdout.write(self.style.ERROR('❌ Échecs de connexion récents:'))
            recent_failures = login_attempts.filter(success=False).order_by('-timestamp')[:5]
            
            for attempt in recent_failures:
                self.stdout.write(
                    f'   • {attempt.timestamp.strftime("%Y-%m-%d %H:%M:%S")} - '
                    f'{attempt.username} - {attempt.ip_address} - {attempt.failure_reason}'
                )
        
        # Export CSV
        if export_file:
            self._export_csv(logs, export_file)
            self.stdout.write('')
            self.stdout.write(self.style.SUCCESS(f'✅ Rapport exporté vers: {export_file}'))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 80))
    
    def _export_csv(self, logs, filename):
        """Exporter les logs vers un fichier CSV"""
        import csv
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow([
                'Timestamp', 'User', 'Action', 'Level', 'Description',
                'IP Address', 'User Agent', 'Request Path'
            ])
            
            # Données
            for log in logs:
                writer.writerow([
                    log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    log.username or 'Anonyme',
                    log.get_action_display(),
                    log.get_level_display(),
                    log.description,
                    log.ip_address or '',
                    log.user_agent or '',
                    log.request_path or ''
                ])
