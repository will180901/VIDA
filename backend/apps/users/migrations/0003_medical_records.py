# Generated migration for medical records

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_user_avatar_alter_user_emergency_phone_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='MedicalRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('blood_group', models.CharField(blank=True, choices=[('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'), ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-')], max_length=3, null=True, verbose_name='Groupe sanguin')),
                ('allergies', models.TextField(blank=True, help_text='Liste des allergies (médicaments, aliments, etc.)', verbose_name='Allergies connues')),
                ('medical_history', models.TextField(blank=True, help_text='Historique médical du patient', verbose_name='Antécédents médicaux')),
                ('chronic_conditions', models.TextField(blank=True, help_text='Maladies chroniques actuelles', verbose_name='Pathologies chroniques')),
                ('current_treatments', models.TextField(blank=True, help_text='Médicaments et traitements actuels', verbose_name='Traitements en cours')),
                ('vision_left', models.CharField(blank=True, max_length=50, verbose_name='Acuité visuelle œil gauche')),
                ('vision_right', models.CharField(blank=True, max_length=50, verbose_name='Acuité visuelle œil droit')),
                ('intraocular_pressure_left', models.DecimalField(blank=True, decimal_places=1, max_digits=4, null=True, verbose_name='Pression intraoculaire gauche (mmHg)')),
                ('intraocular_pressure_right', models.DecimalField(blank=True, decimal_places=1, max_digits=4, null=True, verbose_name='Pression intraoculaire droite (mmHg)')),
                ('medical_notes', models.TextField(blank=True, help_text='Notes confidentielles du médecin', verbose_name='Notes médicales')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Créé le')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Modifié le')),
                ('patient', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='medical_record', to=settings.AUTH_USER_MODEL, verbose_name='Patient')),
            ],
            options={
                'verbose_name': 'Dossier médical',
                'verbose_name_plural': 'Dossiers médicaux',
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='PatientNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(validators=[django.core.validators.MinLengthValidator(5)], verbose_name='Contenu')),
                ('is_important', models.BooleanField(default=False, verbose_name='Important')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Créé le')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Modifié le')),
                ('author', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='authored_notes', to=settings.AUTH_USER_MODEL, verbose_name='Auteur')),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notes', to=settings.AUTH_USER_MODEL, verbose_name='Patient')),
            ],
            options={
                'verbose_name': 'Note patient',
                'verbose_name_plural': 'Notes patients',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='PatientDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Titre')),
                ('category', models.CharField(choices=[('prescription', 'Ordonnance'), ('exam', 'Examen médical'), ('report', 'Compte-rendu'), ('invoice', 'Facture'), ('consent', 'Consentement'), ('other', 'Autre')], default='other', max_length=20, verbose_name='Catégorie')),
                ('file', models.FileField(upload_to='patient_documents/%Y/%m/', verbose_name='Fichier')),
                ('description', models.TextField(blank=True, verbose_name='Description')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Créé le')),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to=settings.AUTH_USER_MODEL, verbose_name='Patient')),
                ('uploaded_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='uploaded_documents', to=settings.AUTH_USER_MODEL, verbose_name='Uploadé par')),
            ],
            options={
                'verbose_name': 'Document patient',
                'verbose_name_plural': 'Documents patients',
                'ordering': ['-created_at'],
            },
        ),
    ]
