# 🚀 Guide de démarrage - VIDA

Bienvenue dans le guide de démarrage du projet VIDA. Ce guide vous accompagnera pas à pas pour installer, configurer et lancer le projet sur votre machine.

---

## 📋 Table des matières

1. **[Installation](./installation.md)** - Installation complète du projet
2. **[Configuration](./configuration.md)** - Configuration des environnements
3. **[Premiers pas](./first-steps.md)** - Tutoriel de démarrage

---

## ⚡ Démarrage ultra-rapide (Docker)

Si vous avez Docker installé, vous pouvez lancer le projet en 2 minutes :

```bash
# Cloner le projet
git clone https://github.com/your-repo/vida.git
cd vida

# Copier les fichiers d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Lancer avec Docker Compose
docker-compose up -d

# Créer un superutilisateur
docker-compose exec backend python manage.py createsuperuser

# Charger les données initiales
docker-compose exec backend python manage.py loaddata clinic_settings hero_slides medical_services
```

**Accès :**
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000
- Admin Django : http://localhost:8000/admin
- API Docs : http://localhost:8000/api/schema/swagger-ui/

---

## 🎯 Prérequis

### Obligatoires

| Outil | Version minimale | Vérification |
|-------|------------------|--------------|
| Python | 3.11+ | `python --version` |
| Node.js | 20+ | `node --version` |
| PostgreSQL | 15+ | `psql --version` |
| Redis | 7+ | `redis-cli --version` |

### Optionnels (mais recommandés)

| Outil | Usage | Installation |
|-------|-------|--------------|
| Docker | Déploiement simplifié | [docker.com](https://www.docker.com/) |
| Docker Compose | Orchestration | Inclus avec Docker Desktop |
| Git | Gestion de version | [git-scm.com](https://git-scm.com/) |
| VS Code | Éditeur recommandé | [code.visualstudio.com](https://code.visualstudio.com/) |

---

## 🗺️ Parcours d'installation

### Pour les débutants
1. ✅ Vérifier les prérequis
2. 📖 Suivre le [guide d'installation complet](./installation.md)
3. ⚙️ Configurer les [variables d'environnement](./configuration.md)
4. 🎓 Faire le [tutoriel premiers pas](./first-steps.md)

### Pour les développeurs expérimentés
1. ⚡ Installation rapide avec Docker (voir ci-dessus)
2. 📝 Consulter la [configuration avancée](./configuration.md#configuration-avancée)
3. 🏗️ Explorer l'[architecture](../02-architecture/overview.md)

---

## 🆘 Besoin d'aide ?

### Problèmes courants

| Problème | Solution |
|----------|----------|
| Port 3000 déjà utilisé | Modifier `PORT=3001` dans `frontend/.env.local` |
| Port 8000 déjà utilisé | Modifier `PORT=8001` dans `backend/.env` |
| Erreur PostgreSQL | Vérifier que PostgreSQL est démarré : `sudo service postgresql start` |
| Erreur Redis | Vérifier que Redis est démarré : `sudo service redis start` |

### Ressources

- 📖 [Guide de dépannage complet](../07-maintenance/troubleshooting.md)
- 💬 [Forum de discussion](https://github.com/your-repo/vida/discussions)
- 🐛 [Signaler un bug](https://github.com/your-repo/vida/issues)

---

## 📚 Prochaines étapes

Après avoir installé et configuré le projet :

1. **Comprendre l'architecture** → [Architecture overview](../02-architecture/overview.md)
2. **Explorer l'API** → [Documentation API](../03-api-documentation/README.md)
3. **Développer des fonctionnalités** → [Guide frontend](../04-frontend-guide/README.md) | [Guide backend](../05-backend-guide/README.md)

---

**Bonne installation ! 🎉**
