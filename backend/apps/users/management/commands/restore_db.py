"""
Commande Django pour restaurer un backup de la base de données
Usage: python manage.py restore_db <backup_file>
"""
import os
import subprocess
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings


class Command(BaseCommand):
    help = 'Restaure un backup de la base de données PostgreSQL'
    
    def add_arguments(self, parser):
        parser.add_argument(
            'backup_file',
            type=str,
            help='Chemin vers le fichier de backup (.sql.gz)'
        )
        parser.add_argument(
            '--no-confirm',
            action='store_true',
            help='Ne pas demander de confirmation (DANGEREUX)'
        )
    
    def handle(self, *args, **options):
        backup_file = options['backup_file']
        no_confirm = options['no_confirm']
        
        # Vérifier que le fichier existe
        if not os.path.exists(backup_file):
            raise CommandError(f'Fichier introuvable: {backup_file}')
        
        # Vérifier l'intégrité du fichier
        self.stdout.write('🔍 Vérification de l\'intégrité du fichier...')
        try:
            subprocess.run(['gzip', '-t', backup_file], check=True, capture_output=True)
            self.stdout.write(self.style.SUCCESS('✅ Fichier valide'))
        except subprocess.CalledProcessError:
            raise CommandError('Le fichier de backup est corrompu')
        
        # Récupérer la configuration
        db_config = settings.DATABASES['default']
        db_name = db_config['NAME']
        db_user = db_config['USER']
        db_password = db_config['PASSWORD']
        db_host = db_config.get('HOST', 'localhost')
        db_port = db_config.get('PORT', '5432')
        
        # Confirmation
        if not no_confirm:
            self.stdout.write(self.style.WARNING('⚠️  ATTENTION: Cette opération va ÉCRASER la base de données actuelle!'))
            self.stdout.write(f'   Base de données: {db_name}')
            self.stdout.write(f'   Fichier de backup: {backup_file}')
            self.stdout.write('')
            
            confirm = input('Tapez "OUI" pour confirmer: ')
            if confirm != 'OUI':
                self.stdout.write('Restauration annulée')
                return
        
        self.stdout.write(self.style.WARNING('🔄 Restauration en cours...'))
        
        try:
            env = os.environ.copy()
            env['PGPASSWORD'] = db_password
            
            # Décompresser et restaurer
            with open(backup_file, 'rb') as f:
                # gunzip
                gunzip = subprocess.Popen(
                    ['gunzip', '-c'],
                    stdin=f,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                
                # psql
                psql = subprocess.Popen(
                    [
                        'psql',
                        '-h', db_host,
                        '-p', str(db_port),
                        '-U', db_user,
                        '-d', db_name,
                    ],
                    stdin=gunzip.stdout,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=env
                )
                
                gunzip.stdout.close()
                stdout, stderr = psql.communicate()
                
                if psql.returncode != 0:
                    raise Exception(f"Erreur psql: {stderr.decode()}")
            
            self.stdout.write(self.style.SUCCESS('✅ Base de données restaurée avec succès'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur: {e}'))
            raise CommandError('Échec de la restauration')
