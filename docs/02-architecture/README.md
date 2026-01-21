# 🏗️ Architecture - VIDA

Documentation complète de l'architecture technique du projet VIDA.

---

## 📋 Table des matières

1. **[Vue d'ensemble](./overview.md)** - Architecture globale du système
2. **[Backend Django](./backend-architecture.md)** - Architecture backend détaillée
3. **[Frontend Next.js](./frontend-architecture.md)** - Architecture frontend détaillée
4. **[Base de données](./database-schema.md)** - Schéma et modèles de données
5. **[Sécurité](./security.md)** - Mesures de sécurité implémentées

---

## 🎯 Vue d'ensemble rapide

### Stack technique

```
┌─────────────────────────────────────────────────────────┐
│                    VIDA - Architecture                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (Next.js 15)          Backend (Django 5.0)     │
│  ┌──────────────────┐           ┌──────────────────┐    │
│  │  React 19        │◄─────────►│  Django REST     │    │
│  │  TypeScript      │   API     │  Framework       │    │
│  │  Tailwind CSS    │   REST    │  PostgreSQL 15   │    │
│  │  TanStack Query  │           │  Redis 7         │    │
│  │  Framer Motion   │           │  Celery 5        │    │
│  └──────────────────┘           └──────────────────┘    │
│         │                               │                │
│         │                               │                │
│         ▼                               ▼                │
│  ┌──────────────────┐           ┌──────────────────┐    │
│  │   Vercel/Nginx   │           │  Gunicorn/Nginx  │    │
│  └──────────────────┘           └──────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Diagrammes d'architecture

### Architecture globale

```
                    ┌─────────────────┐
                    │   Utilisateurs  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Load Balancer │
                    │     (Nginx)     │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌────────▼────────┐
     │   Frontend      │          │    Backend      │
     │   Next.js 15    │◄────────►│   Django 5.0    │
     │   Port 3000     │   API    │   Port 8000     │
     └─────────────────┘          └────────┬────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
           ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
           │   PostgreSQL    │   │     Redis       │   │    Celery       │
           │   Database      │   │     Cache       │   │    Workers      │
           │   Port 5432     │   │   Port 6379     │   │                 │
           └─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Flux de données

```
┌──────────┐     HTTP/HTTPS      ┌──────────┐      SQL       ┌──────────┐
│          │────────────────────►│          │───────────────►│          │
│  Client  │                     │  Django  │                │PostgreSQL│
│ (Browser)│◄────────────────────│   API    │◄───────────────│          │
└──────────┘      JSON           └──────────┘     Results    └──────────┘
                                       │
                                       │ Cache
                                       ▼
                                  ┌──────────┐
                                  │  Redis   │
                                  │  Cache   │
                                  └──────────┘
                                       │
                                       │ Tasks
                                       ▼
                                  ┌──────────┐
                                  │  Celery  │
                                  │  Worker  │
                                  └──────────┘
```

---

## 🔑 Principes architecturaux

### 1. Séparation Frontend/Backend

- **Frontend** : Interface utilisateur (UI/UX)
- **Backend** : Logique métier et données
- **Communication** : API REST avec JWT

**Avantages :**
- ✅ Développement indépendant
- ✅ Scalabilité horizontale
- ✅ Réutilisation de l'API (mobile, etc.)

### 2. Architecture en couches

**Backend (Django) :**
```
┌─────────────────────────────────┐
│         Views (API)             │  ← Endpoints REST
├─────────────────────────────────┤
│       Serializers               │  ← Validation & Transformation
├─────────────────────────────────┤
│      Business Logic             │  ← Logique métier
├─────────────────────────────────┤
│         Models (ORM)            │  ← Accès aux données
├─────────────────────────────────┤
│        Database (SQL)           │  ← Stockage persistant
└─────────────────────────────────┘
```

**Frontend (Next.js) :**
```
┌─────────────────────────────────┐
│      Pages/Routes               │  ← Routing
├─────────────────────────────────┤
│       Components                │  ← UI Components
├─────────────────────────────────┤
│      Hooks/Context              │  ← State Management
├─────────────────────────────────┤
│      API Client (Axios)         │  ← Communication Backend
└─────────────────────────────────┘
```

### 3. Microservices légers

- **API REST** : Communication synchrone
- **Celery** : Tâches asynchrones (emails, backups)
- **Redis** : Cache et message broker

### 4. Sécurité par défaut

- JWT avec cookies httpOnly
- HTTPS obligatoire en production
- Rate limiting sur tous les endpoints
- Validation stricte des données
- Protection XSS, CSRF, SQL Injection

---

## 📦 Modules et applications

### Backend (Django Apps)

| App | Responsabilité | Modèles principaux |
|-----|----------------|-------------------|
| **users** | Authentification & utilisateurs | User, EmailVerificationToken, PasswordResetToken |
| **appointments** | Gestion des rendez-vous | Appointment, AppointmentSlotLock |
| **content_management** | Contenu du site | ClinicSetting, HeroSlide, MedicalService |

### Frontend (Structure)

| Dossier | Responsabilité | Contenu |
|---------|----------------|---------|
| **app/** | Pages & routing | Routes Next.js (App Router) |
| **components/** | Composants UI | Composants réutilisables |
| **hooks/** | Hooks personnalisés | Logique réutilisable |
| **lib/** | Utilitaires | Helpers, API client, animations |
| **contexts/** | State global | Contextes React |
| **types/** | Types TypeScript | Interfaces & types |

---

## 🔄 Flux de requêtes

### 1. Requête authentifiée

```
1. Client envoie requête avec cookie JWT
   │
   ▼
2. Nginx route vers Django
   │
   ▼
3. Middleware d'authentification vérifie JWT
   │
   ▼
4. Middleware de throttling vérifie rate limit
   │
   ▼
5. View traite la requête
   │
   ▼
6. Serializer valide/transforme les données
   │
   ▼
7. Model accède à la base de données
   │
   ▼
8. Réponse JSON retournée au client
```

### 2. Création de rendez-vous

```
1. Client remplit formulaire
   │
   ▼
2. Frontend valide avec Zod
   │
   ▼
3. POST /api/v1/appointments/
   │
   ▼
4. Backend valide avec DRF Serializer
   │
   ▼
5. Vérification créneau disponible
   │
   ▼
6. Création en base de données
   │
   ▼
7. Tâche Celery : envoi email confirmation
   │
   ▼
8. Réponse 201 Created au client
```

---

## 🚀 Performance et scalabilité

### Stratégies de cache

**Redis Cache :**
- Créneaux disponibles (5 min)
- Paramètres clinique (1 heure)
- Sessions utilisateurs
- Rate limiting

**Next.js Cache :**
- Static Generation (SSG) pour pages publiques
- Incremental Static Regeneration (ISR)
- Image optimization automatique

### Optimisations

**Backend :**
- ✅ Requêtes SQL optimisées (select_related, prefetch_related)
- ✅ Pagination sur toutes les listes
- ✅ Compression gzip
- ✅ Connection pooling PostgreSQL

**Frontend :**
- ✅ Code splitting automatique (Next.js)
- ✅ Lazy loading des composants
- ✅ Image optimization (next/image)
- ✅ Prefetching des données (TanStack Query)

---

## 🔐 Sécurité

### Couches de sécurité

```
┌─────────────────────────────────────────┐
│  1. Network (Firewall, HTTPS)           │
├─────────────────────────────────────────┤
│  2. Application (Rate limiting, CORS)   │
├─────────────────────────────────────────┤
│  3. Authentication (JWT, Argon2)        │
├─────────────────────────────────────────┤
│  4. Authorization (Permissions)         │
├─────────────────────────────────────────┤
│  5. Data (Validation, Sanitization)     │
├─────────────────────────────────────────┤
│  6. Database (Encryption, Backups)      │
└─────────────────────────────────────────┘
```

**Détails** → [Documentation sécurité](./security.md)

---

## 📊 Monitoring et observabilité

### Outils de monitoring

| Outil | Usage | Métriques |
|-------|-------|-----------|
| **Sentry** | Tracking erreurs | Exceptions, performance |
| **Logs** | Audit & debug | Actions utilisateurs, erreurs |
| **PostgreSQL logs** | Performance DB | Requêtes lentes, erreurs |
| **Redis Monitor** | Cache performance | Hit rate, mémoire |

### Logs structurés

```python
# Exemple de log
{
    "timestamp": "2026-01-24T10:30:00Z",
    "level": "INFO",
    "user": "patient@example.com",
    "action": "appointment_created",
    "ip": "192.168.1.100",
    "details": {
        "appointment_id": 123,
        "date": "2026-02-01",
        "time": "10:00"
    }
}
```

---

## 🧪 Tests

### Stratégie de tests

**Backend :**
- ✅ Tests unitaires (pytest)
- ✅ Tests d'intégration (API)
- ✅ Tests de sécurité
- ✅ Couverture > 80%

**Frontend :**
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Tests de build

### Environnements

| Environnement | Usage | Base de données |
|---------------|-------|-----------------|
| **Development** | Développement local | SQLite ou PostgreSQL local |
| **Testing** | Tests automatisés | PostgreSQL test |
| **Staging** | Pré-production | PostgreSQL staging |
| **Production** | Production | PostgreSQL production |

---

## 📚 Documentation détaillée

### Pour aller plus loin

1. **[Vue d'ensemble complète](./overview.md)**
   - Architecture détaillée
   - Diagrammes de flux
   - Décisions architecturales

2. **[Backend Django](./backend-architecture.md)**
   - Structure des apps
   - Modèles de données
   - API endpoints
   - Tâches Celery

3. **[Frontend Next.js](./frontend-architecture.md)**
   - Structure des composants
   - Gestion d'état
   - Routing
   - Styling

4. **[Base de données](./database-schema.md)**
   - Schéma complet
   - Relations
   - Indexes
   - Migrations

5. **[Sécurité](./security.md)**
   - Authentification
   - Autorisation
   - Protection des données
   - Audit

---

## 🎯 Décisions architecturales clés

### Pourquoi Django REST Framework ?

✅ **Avantages :**
- Framework mature et stable
- Excellente documentation
- Sérialisation automatique
- Authentification intégrée
- Admin Django puissant

### Pourquoi Next.js ?

✅ **Avantages :**
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Routing automatique
- Optimisation images
- Excellent DX (Developer Experience)

### Pourquoi PostgreSQL ?

✅ **Avantages :**
- ACID compliant
- Performances excellentes
- JSON support natif
- Extensions puissantes
- Open source

### Pourquoi Redis ?

✅ **Avantages :**
- Cache ultra-rapide (in-memory)
- Message broker pour Celery
- Sessions distribuées
- Rate limiting efficace

---

## 🔄 Évolution future

### Roadmap architecture

**Version 1.1 :**
- [ ] WebSockets pour notifications temps réel
- [ ] GraphQL API (optionnel)
- [ ] CDN pour assets statiques

**Version 2.0 :**
- [ ] Microservices (si nécessaire)
- [ ] Kubernetes pour orchestration
- [ ] Multi-tenant (multi-centres)

---

## 🆘 Support

- 📖 [Guide de développement backend](../05-backend-guide/README.md)
- 📖 [Guide de développement frontend](../04-frontend-guide/README.md)
- 💬 [Forum de discussion](https://github.com/your-repo/vida/discussions)

---

**Architecture documentée ! 🏗️**
