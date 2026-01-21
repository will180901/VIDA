"""
Commande Django pour tester Sentry
Usage: python manage.py test_sentry
"""
from django.core.management.base import BaseCommand
from config.sentry import capture_message, capture_exception


class Command(BaseCommand):
    help = 'Teste la configuration Sentry en envoyant un événement de test'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🔍 Test de Sentry...'))
        
        try:
            # Envoyer un message de test
            capture_message('Test Sentry depuis Django management command', level='info')
            
            # Générer une exception de test
            try:
                1 / 0
            except ZeroDivisionError as e:
                capture_exception(e)
            
            self.stdout.write(self.style.SUCCESS('✅ Événements envoyés à Sentry'))
            self.stdout.write('📊 Vérifiez votre dashboard Sentry pour voir les événements')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur: {e}'))
