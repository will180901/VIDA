# 💾 Backup & Restore - VIDA

Guide de sauvegarde et restauration.

---

## 📦 Backup automatique

### Configuration

Le backup automatique est configuré dans Celery :

```python
# Quotidien à 2h du matin
@shared_task
def backup_database():
    # Backup PostgreSQL avec pg_dump
    # Compression gzip
    # Rétention 30 jours
```

### Script manuel

```bash
cd backend
./scripts/backup_database.sh
```

---

## 🔄 Restauration

### Depuis un backup

```bash
cd backend
./scripts/restore_database.sh /path/to/backup.sql.gz
```

### Vérification

```bash
# Tester la connexion
psql -U vida_user -d vida_db -c "SELECT COUNT(*) FROM users_user;"
```

---

## 📚 Voir aussi

- [Configuration](../01-getting-started/configuration.md)
- [Troubleshooting](./troubleshooting.md)

---

**Backup documenté ! 💾**
