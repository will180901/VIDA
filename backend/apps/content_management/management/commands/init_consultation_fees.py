"""
Commande pour initialiser les tarifs de consultation
Usage: python manage.py init_consultation_fees
"""
from django.core.management.base import BaseCommand
from apps.content_management.models import ConsultationFee


class Command(BaseCommand):
    help = 'Initialise les tarifs de consultation par défaut'

    def handle(self, *args, **options):
        fees_data = [
            {
                'consultation_type': 'generale',
                'price': 15000,
                'description': 'Examen médical standard pour les consultations courantes',
                'order': 1,
            },
            {
                'consultation_type': 'specialisee',
                'price': 25000,
                'description': 'Consultation approfondie avec un spécialiste',
                'order': 2,
            },
            {
                'consultation_type': 'suivi',
                'price': 10000,
                'description': 'Consultation de suivi pour les patients déjà pris en charge',
                'order': 3,
            },
            {
                'consultation_type': 'urgence',
                'price': 30000,
                'description': 'Prise en charge rapide pour les cas urgents',
                'order': 4,
            },
        ]

        created_count = 0
        updated_count = 0

        for fee_data in fees_data:
            fee, created = ConsultationFee.objects.update_or_create(
                consultation_type=fee_data['consultation_type'],
                defaults={
                    'price': fee_data['price'],
                    'description': fee_data['description'],
                    'order': fee_data['order'],
                    'is_active': True,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Créé: {fee.get_consultation_type_display()} - {fee.price} FCFA'
                    )
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f'↻ Mis à jour: {fee.get_consultation_type_display()} - {fee.price} FCFA'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Terminé: {created_count} créés, {updated_count} mis à jour'
            )
        )
