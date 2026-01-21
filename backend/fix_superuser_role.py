"""
Script pour corriger le rôle des superusers existants
À exécuter avec: python fix_superuser_role.py
"""

import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

# Trouver tous les superusers
superusers = User.objects.filter(is_superuser=True)

print(f"🔍 Trouvé {superusers.count()} superuser(s)")

for user in superusers:
    print(f"\n👤 User: {user.email}")
    print(f"   Rôle actuel: {user.role}")
    
    if user.role != 'admin':
        user.role = 'admin'
        user.save()
        print(f"   ✅ Rôle mis à jour: admin")
    else:
        print(f"   ✓ Rôle déjà correct")

print("\n✅ Correction terminée!")

