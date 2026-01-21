# 🔍 Dépannage - VIDA

Guide de résolution des problèmes courants.

---

## 🐛 Problèmes courants

### Backend ne démarre pas

**Symptôme :** Erreur au démarrage de Django

**Solutions :**
```bash
# Vérifier PostgreSQL
sudo service postgresql status

# Vérifier Redis
redis-cli ping

# Vérifier les migrations
python manage.py showmigrations

# Réappliquer les migrations
python manage.py migrate
```

### Frontend ne démarre pas

**Symptôme :** Erreur au démarrage de Next.js

**Solutions :**
```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
pnpm install

# Vérifier les variables d'environnement
cat .env.local
```

### Erreur 500 en production

**Symptôme :** Erreur serveur

**Solutions :**
```bash
# Vérifier les logs
tail -f /var/log/vida/django.log

# Vérifier Sentry
# Aller sur sentry.io

# Vérifier la base de données
psql -U vida_user -d vida_db
```

---

## 📚 Voir aussi

- [Backup & Restore](./backup-restore.md)
- [Sécurité](../02-architecture/security.md)

---

**Dépannage documenté ! 🔍**
