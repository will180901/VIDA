# 🚀 Guide de déploiement - VIDA

Guide complet pour déployer VIDA en production.

---

## 📋 Table des matières

1. **[Checklist production](./production-checklist.md)** - Vérifications avant déploiement
2. **[Docker](./docker.md)** - Déploiement avec Docker

---

## 🎯 Options de déploiement

### Option 1 : Docker Compose (Recommandé)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2 : Déploiement manuel

Voir [Guide d'installation](../01-getting-started/installation.md)

---

## 🔐 Sécurité

Avant le déploiement :

- ✅ `DEBUG = False`
- ✅ `SECRET_KEY` unique et sécurisée
- ✅ HTTPS activé
- ✅ Firewall configuré
- ✅ Backup automatique

Voir [Checklist production](./production-checklist.md)

---

## 📚 Ressources

- [Checklist production](./production-checklist.md)
- [Docker](./docker.md)
- [Configuration](../01-getting-started/configuration.md)
- [Sécurité](../02-architecture/security.md)

---

**Déploiement documenté ! 🚀**
