# 📚 Documentation VIDA - Centre Médical Ophtalmologique

> Documentation complète du projet VIDA - Système de gestion de centre médical ophtalmologique à Brazzaville, Congo

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-repo/vida)
[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

---

## 🎯 À propos du projet

**VIDA** est une plateforme web complète de gestion de centre médical ophtalmologique comprenant :

- 🌐 **Site vitrine** moderne et responsive
- 📅 **Système de prise de rendez-vous** en ligne
- 👥 **Gestion des patients** et dossiers médicaux
- 🔐 **Authentification sécurisée** avec JWT
- 📧 **Notifications automatiques** par email
- 📊 **Tableau de bord administrateur**
- 💳 **Gestion de la facturation**

### Informations du centre

- **Nom** : Centre Médical VIDA
- **Adresse** : 08 Bis rue Mboko, Moungali, Brazzaville, Congo
- **Téléphones** : 06 569 12 35 | 05 745 36 88
- **Email** : centremedvida@gmail.com
- **RCCM** : B13-0506
- **NIU** : M2300009961883

---

## 📖 Navigation de la documentation

### 🚀 Pour démarrer rapidement
- **[Guide d'installation](./01-getting-started/installation.md)** - Installation complète du projet
- **[Configuration](./01-getting-started/configuration.md)** - Configuration des environnements
- **[Premiers pas](./01-getting-started/first-steps.md)** - Tutoriel de démarrage

### 🏗️ Architecture technique
- **[Vue d'ensemble](./02-architecture/overview.md)** - Architecture globale du système
- **[Backend Django](./02-architecture/backend-architecture.md)** - Architecture backend détaillée
- **[Frontend Next.js](./02-architecture/frontend-architecture.md)** - Architecture frontend détaillée
- **[Base de données](./02-architecture/database-schema.md)** - Schéma et modèles de données
- **[Sécurité](./02-architecture/security.md)** - Mesures de sécurité implémentées

### 🔌 API & Intégrations
- **[Documentation API](./03-api-documentation/README.md)** - Référence complète de l'API REST
- **[Authentification](./03-api-documentation/authentication.md)** - Endpoints d'authentification
- **[Rendez-vous](./03-api-documentation/appointments.md)** - Gestion des rendez-vous
- **[Exemples](./03-api-documentation/examples.md)** - Exemples d'utilisation

### 💻 Guides de développement
- **[Guide Frontend](./04-frontend-guide/README.md)** - Développement frontend
- **[Guide Backend](./05-backend-guide/README.md)** - Développement backend

### 🚢 Déploiement & Production
- **[Guide de déploiement](./06-deployment/README.md)** - Déploiement en production
- **[Checklist production](./06-deployment/production-checklist.md)** - Vérifications avant mise en ligne
- **[Docker](./06-deployment/docker.md)** - Déploiement avec Docker

### 🔧 Maintenance & Support
- **[Guide de maintenance](./07-maintenance/README.md)** - Maintenance du système
- **[Backup & Restore](./07-maintenance/backup-restore.md)** - Sauvegarde et restauration
- **[Dépannage](./07-maintenance/troubleshooting.md)** - Résolution de problèmes

### 📋 Spécifications
- **[Cahiers des charges](./01-specifications/README.md)** - Spécifications fonctionnelles détaillées

---

## 🛠️ Stack technique

### Backend
- **Framework** : Django 5.0.1
- **API** : Django REST Framework 3.14+
- **Base de données** : PostgreSQL 15+
- **Cache** : Redis 7+
- **Tâches asynchrones** : Celery 5.3+
- **Authentification** : JWT (Simple JWT)
- **Documentation API** : drf-spectacular (OpenAPI/Swagger)

### Frontend
- **Framework** : Next.js 15 (App Router)
- **UI** : React 19
- **Langage** : TypeScript
- **Styling** : Tailwind CSS 4
- **Animations** : Framer Motion
- **Formulaires** : React Hook Form + Zod
- **Requêtes** : TanStack Query (React Query)
- **HTTP** : Axios

### DevOps & Outils
- **Conteneurisation** : Docker + Docker Compose
- **Monitoring** : Sentry
- **Emails** : SMTP (configurable)
- **Sécurité** : hCaptcha, django-axes, Argon2

---

## 📊 Statut du projet

### ✅ Modules implémentés

| Module | Statut | Version | Documentation |
|--------|--------|---------|---------------|
| Authentification | ✅ Complet | 1.0 | [Voir](./03-api-documentation/authentication.md) |
| Gestion des rendez-vous | ✅ Complet | 1.0 | [Voir](./03-api-documentation/appointments.md) |
| Gestion du contenu | ✅ Complet | 1.0 | [Voir](./03-api-documentation/content-management.md) |
| Site vitrine | ✅ Complet | 1.0 | [Voir](./04-frontend-guide/README.md) |
| Emails automatiques | ✅ Complet | 1.0 | [Voir](./05-backend-guide/tasks.md) |
| Sécurité avancée | ✅ Complet | 1.0 | [Voir](./02-architecture/security.md) |

### 🚧 Modules en développement

| Module | Statut | Priorité | Documentation |
|--------|--------|----------|---------------|
| Dashboard admin | 🚧 En cours | Haute | [Spécifications](./01-specifications/module-7-partie-1-admin.md) |
| Espace patient | 🚧 En cours | Haute | [Spécifications](./01-specifications/module-7-partie-2-patient.md) |
| Dossiers médicaux | 📋 Planifié | Moyenne | [Spécifications](./01-specifications/cahier-charge-module-4.md) |
| Facturation | 📋 Planifié | Moyenne | [Spécifications](./01-specifications/cahier-charge-module-5.md) |
| Gestion du stock | 📋 Planifié | Basse | [Spécifications](./01-specifications/cahier-charge-module-6.md) |

---

## 🚀 Démarrage rapide

### Prérequis

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optionnel)

### Installation en 5 minutes

```bash
# 1. Cloner le projet
git clone https://github.com/your-repo/vida.git
cd vida

# 2. Lancer avec Docker Compose
docker-compose up -d

# 3. Accéder à l'application
# Frontend : http://localhost:3000
# Backend API : http://localhost:8000
# Admin Django : http://localhost:8000/admin
# API Docs : http://localhost:8000/api/schema/swagger-ui/
```

**👉 [Guide d'installation détaillé](./01-getting-started/installation.md)**

---

## 📞 Support & Contact

### Pour les développeurs

- **Issues GitHub** : [Créer une issue](https://github.com/your-repo/vida/issues)
- **Discussions** : [Forum de discussion](https://github.com/your-repo/vida/discussions)
- **Email technique** : dev@vida.cg

### Pour le centre médical

- **Support utilisateur** : support@vida.cg
- **Téléphone** : 06 569 12 35
- **Email** : centremedvida@gmail.com

---

## 📝 Contribution

Ce projet est propriétaire et destiné au Centre Médical VIDA. Les contributions externes ne sont pas acceptées pour le moment.

Pour les développeurs de l'équipe :
1. Lire le [guide de contribution](./CONTRIBUTING.md)
2. Suivre les [conventions de code](./CODE_STYLE.md)
3. Créer une branche feature
4. Soumettre une pull request

---

## 📄 Licence

Copyright © 2026 Centre Médical VIDA. Tous droits réservés.

Ce logiciel est propriétaire et confidentiel. Toute utilisation, reproduction ou distribution non autorisée est strictement interdite.

---

## 🗺️ Roadmap

### Version 1.1 (Q1 2026)
- [ ] Dashboard administrateur complet
- [ ] Espace patient avec historique
- [ ] Notifications SMS
- [ ] Export PDF des documents

### Version 1.2 (Q2 2026)
- [ ] Dossiers médicaux électroniques
- [ ] Gestion de la facturation
- [ ] Intégration paiement mobile
- [ ] Application mobile (React Native)

### Version 2.0 (Q3 2026)
- [ ] Téléconsultation
- [ ] IA pour aide au diagnostic
- [ ] Gestion multi-centres
- [ ] API publique pour partenaires

---

## 📚 Ressources additionnelles

### Documentation externe
- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)

### Outils recommandés
- **IDE** : VS Code, PyCharm, WebStorm
- **API Testing** : Postman, Insomnia
- **Database** : pgAdmin, DBeaver
- **Monitoring** : Sentry, Grafana

---

**Dernière mise à jour** : 24 janvier 2026  
**Version de la documentation** : 1.0.0  
**Mainteneur** : Équipe VIDA
