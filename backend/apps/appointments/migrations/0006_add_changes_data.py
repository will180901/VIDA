# Generated migration for adding changes_data field to AppointmentHistory

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0005_make_email_optional'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointmenthistory',
            name='changes_data',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Stocke tous les changements de champs sous forme JSON',
                verbose_name='données des changements'
            ),
        ),
    ]
