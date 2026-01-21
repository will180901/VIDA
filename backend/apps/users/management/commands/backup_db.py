"""
Commande Django pour effectuer un backup de la base de données
Usage: python manage.py backup_db
"""
import os
import subprocess
from datetime import datetime
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Effectue un backup de la base de données PostgreSQL'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--output-dir',
            type=str,
            default='/var/backups/vida',
            help='Répertoire de destination des backups'
        )
        parser.add_argument(
            '--retention-days',
            type=int,
            default=30,
            help='Nombre de jours de rétention des backups'
        )
    
    def handle(self, *args, **options):
        output_dir = options['output_dir']
        retention_days = options['retention_days']
        
        # Créer le répertoire si nécessaire
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Récupérer la configuration de la base de données
        db_config = settings.DATABASES['default']
        db_name = db_config['NAME']
        db_user = db_config['USER']
        db_password = db_config['PASSWORD']
        db_host = db_config.get('HOST', 'localhost')
        db_port = db_config.get('PORT', '5432')
        
        # Nom du fichier de backup
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(output_dir, f'vida_db_{timestamp}.sql.gz')
        
        self.stdout.write(self.style.WARNING('🔄 Début du backup...'))
        self.stdout.write(f'   Base de données: {db_name}')
        self.stdout.write(f'   Fichier: {backup_file}')
        
        try:
            # Commande pg_dump
            cmd = [
                'pg_dump',
                '-h', db_host,
                '-p', str(db_port),
                '-U', db_user,
                '-d', db_name,
                '--format=plain',
                '--no-owner',
                '--no-acl',
            ]
            
            # Exécuter pg_dump et compresser
            env = os.environ.copy()
            env['PGPASSWORD'] = db_password
            
            with open(backup_file, 'wb') as f:
                # pg_dump | gzip
                pg_dump = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=env
                )
                
                gzip = subprocess.Popen(
                    ['gzip'],
                    stdin=pg_dump.stdout,
                    stdout=f,
                    stderr=subprocess.PIPE
                )
                
                pg_dump.stdout.close()
                gzip.communicate()
                
                if gzip.returncode != 0:
                    raise Exception("Erreur lors de la compression")
            
            # Vérifier la taille du fichier
            size = os.path.getsize(backup_file)
            size_mb = size / (1024 * 1024)
            
            self.stdout.write(self.style.SUCCESS(f'✅ Backup créé: {backup_file}'))
            self.stdout.write(f'   Taille: {size_mb:.2f} MB')
            
            # Nettoyer les anciens backups
            self._cleanup_old_backups(output_dir, retention_days)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur: {e}'))
            if os.path.exists(backup_file):
                os.remove(backup_file)
            raise
    
    def _cleanup_old_backups(self, output_dir, retention_days):
        """Supprimer les backups de plus de X jours"""
        from datetime import timedelta
        
        cutoff_date = datetime.now() - timedelta(days=retention_days)
        deleted_count = 0
        
        for filename in os.listdir(output_dir):
            if filename.startswith('vida_db_') and filename.endswith('.sql.gz'):
                filepath = os.path.join(output_dir, filename)
                file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
                
                if file_time < cutoff_date:
                    os.remove(filepath)
                    deleted_count += 1
        
        if deleted_count > 0:
            self.stdout.write(f'🗑️  {deleted_count} ancien(s) backup(s) supprimé(s)')
        
        # Afficher les statistiques
        total_backups = len([f for f in os.listdir(output_dir) 
                           if f.startswith('vida_db_') and f.endswith('.sql.gz')])
        self.stdout.write(f'📊 Backups actuels: {total_backups}')
