# 🎯 Vue d'ensemble de l'architecture - VIDA

Documentation complète de l'architecture globale du système VIDA.

---

## 📋 Table des matières

1. [Architecture globale](#-architecture-globale)
2. [Composants principaux](#-composants-principaux)
3. [Flux de données](#-flux-de-données)
4. [Communication inter-services](#-communication-inter-services)
5. [Déploiement](#-déploiement)
6. [Décisions architecturales](#-décisions-architecturales)

---

## 🏗️ Architecture globale

### Diagramme de haut niveau

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VIDA - Architecture                          │
└─────────────────────────────────────────────────────────────────────┘

                              Internet
                                 │
                                 │ HTTPS
                                 ▼
                    ┌────────────────────────┐
                    │    Load Balancer       │
                    │       (Nginx)          │
                    └────────────┬───────────┘
                                 │
                    ┌────────────┴───────────┐
                    │                        │
         ┌──────────▼──────────┐  ┌─────────▼──────────┐
         │   Frontend Server   │  │   Backend Server   │
         │     Next.js 15      │  │    Django 5.0      │
         │   React 19 + TS     │  │   DRF + Python     │
         │   Port: 3000        │  │   Port: 8000       │
         └──────────┬──────────┘  └─────────┬──────────┘
                    │                       │
                    │    API REST (JSON)    │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
         ┌──────────▼──────────┐ ┌─────────▼──────────┐
         │   PostgreSQL 15+    │ │     Redis 7+       │
         │   Base de données   │ │   Cache + Broker   │
         │   Port: 5432        │ │   Port: 6379       │
         └─────────────────────┘ └─────────┬──────────┘
                                           │
                                ┌──────────▼──────────┐
                                │   Celery Workers    │
                                │  Tâches async       │
                                └─────────────────────┘
```

---

## 🧩 Composants principaux

### 1. Frontend (Next.js)

**Responsabilités :**
- Interface utilisateur (UI/UX)
- Validation côté client
- Gestion d'état local
- Routing et navigation
- Optimisation SEO

**Technologies :**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query (React Query)
- Framer Motion
- React Hook Form + Zod

**Caractéristiques :**
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- Image optimization automatique
- Code splitting automatique

### 2. Backend (Django)

**Responsabilités :**
- API REST
- Logique métier
- Authentification & autorisation
- Validation des données
- Accès à la base de données
- Gestion des emails

**Technologies :**
- Django 5.0.1
- Django REST Framework 3.14+
- PostgreSQL 15+
- Redis 7+
- Celery 5.3+
- Argon2 (hashing)
- Simple JWT

**Caractéristiques :**
- API RESTful avec versioning
- Documentation OpenAPI/Swagger automatique
- Authentification JWT avec cookies httpOnly
- Rate limiting avancé
- Audit trail complet
- Monitoring Sentry

### 3. Base de données (PostgreSQL)

**Responsabilités :**
- Stockage persistant des données
- Intégrité référentielle
- Transactions ACID
- Recherche full-text

**Caractéristiques :**
- PostgreSQL 15+
- Indexes optimisés
- Contraintes de validation
- Triggers pour audit
- Backup automatique quotidien

**Schéma principal :**
- Users (utilisateurs)
- Appointments (rendez-vous)
- Content Management (contenu du site)
- Audit Logs (logs d'audit)

### 4. Cache & Message Broker (Redis)

**Responsabilités :**
- Cache en mémoire
- Sessions utilisateurs
- Rate limiting
- Message broker pour Celery
- Verrouillage distribué

**Utilisation :**
- Cache des créneaux disponibles (5 min)
- Cache des paramètres clinique (1h)
- Sessions Django
- Throttling des requêtes
- Queue Celery

### 5. Tâches asynchrones (Celery)

**Responsabilités :**
- Envoi d'emails
- Tâches planifiées (cron)
- Nettoyage de données
- Backup automatique
- Génération de rapports

**Tâches principales :**
- Envoi emails de confirmation RDV
- Envoi rappels 24h avant RDV
- Nettoyage tokens expirés (quotidien)
- Backup base de données (quotidien 2h)
- Nettoyage logs d'audit > 90 jours (mensuel)

---

## 🔄 Flux de données

### 1. Flux de lecture (GET)

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. GET /api/v1/appointments/
     ▼
┌─────────────┐
│   Nginx     │
└─────┬───────┘
      │ 2. Route vers Django
      ▼
┌─────────────────┐
│ Django          │
│ ┌─────────────┐ │
│ │ Middleware  │ │ 3. Auth + Throttling
│ └──────┬──────┘ │
│        │        │
│ ┌──────▼──────┐ │
│ │    View     │ │ 4. Traitement
│ └──────┬──────┘ │
│        │        │
│ ┌──────▼──────┐ │
│ │   Cache?    │ │ 5. Vérifier cache Redis
│ └──────┬──────┘ │
│        │        │
│   ┌────▼────┐   │
│   │ Cache   │   │ 6a. Si cache hit → retour
│   │  Hit    │   │
│   └─────────┘   │
│        │        │
│   ┌────▼────┐   │
│   │ Cache   │   │ 6b. Si cache miss → DB
│   │  Miss   │   │
│   └────┬────┘   │
│        │        │
│ ┌──────▼──────┐ │
│ │ PostgreSQL  │ │ 7. Requête SQL
│ └──────┬──────┘ │
│        │        │
│ ┌──────▼──────┐ │
│ │ Serializer  │ │ 8. Transformation JSON
│ └──────┬──────┘ │
└────────┼────────┘
         │ 9. Response JSON
         ▼
    ┌─────────┐
    │ Client  │
    └─────────┘
```

### 2. Flux d'écriture (POST/PUT)

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. POST /api/v1/appointments/
     │    + JSON data
     ▼
┌─────────────┐
│   Nginx     │
└─────┬───────┘
      │ 2. Route vers Django
      ▼
┌─────────────────────┐
│ Django              │
│ ┌─────────────────┐ │
│ │ Middleware      │ │ 3. Auth + Throttling + CSRF
│ └────────┬────────┘ │
│          │          │
│ ┌────────▼────────┐ │
│ │   Serializer    │ │ 4. Validation des données
│ │   Validation    │ │
│ └────────┬────────┘ │
│          │          │
│     ┌────▼────┐     │
│     │ Valid?  │     │ 5. Données valides ?
│     └────┬────┘     │
│          │          │
│    ┌─────▼─────┐    │
│    │   NO      │    │ 6a. Si invalide → 400 Bad Request
│    └───────────┘    │
│          │          │
│    ┌─────▼─────┐    │
│    │   YES     │    │ 6b. Si valide → continuer
│    └─────┬─────┘    │
│          │          │
│ ┌────────▼────────┐ │
│ │ Business Logic  │ │ 7. Logique métier
│ │ (View)          │ │
│ └────────┬────────┘ │
│          │          │
│ ┌────────▼────────┐ │
│ │   PostgreSQL    │ │ 8. INSERT/UPDATE
│ │   Transaction   │ │
│ └────────┬────────┘ │
│          │          │
│ ┌────────▼────────┐ │
│ │ Invalidate      │ │ 9. Invalider cache
│ │    Cache        │ │
│ └────────┬────────┘ │
│          │          │
│ ┌────────▼────────┐ │
│ │  Celery Task    │ │ 10. Tâche async (email)
│ │  (async)        │ │
│ └────────┬────────┘ │
└──────────┼──────────┘
           │ 11. Response 201 Created
           ▼
      ┌─────────┐
      │ Client  │
      └─────────┘
```

### 3. Flux d'authentification

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. POST /api/v1/auth/login/
     │    {email, password, captcha}
     ▼
┌─────────────────────┐
│ Django              │
│ ┌─────────────────┐ │
│ │ Verify hCaptcha │ │ 2. Vérifier CAPTCHA
│ └────────┬────────┘ │
│          │          │
│ ┌────────▼────────┐ │
│ │ Check Password  │ │ 3. Vérifier mot de passe (Argon2)
│ └────────┬────────┘ │
│          │          │
│ ┌────────▼────────┐ │
│ │ Generate JWT    │ │ 4. Générer access + refresh tokens
│ └────────┬────────┘ │
│          │          │
│ ┌────────▼────────┐ │
│ │ Set httpOnly    │ │ 5. Définir cookies sécurisés
│ │   Cookies       │ │
│ └────────┬────────┘ │
│          │          │
│ ┌────────▼────────┐ │
│ │  Audit Log      │ │ 6. Logger la connexion
│ └────────┬────────┘ │
└──────────┼──────────┘
           │ 7. Response 200 OK
           │    + Set-Cookie headers
           ▼
      ┌─────────┐
      │ Client  │ (cookies stockés automatiquement)
      └─────────┘
```

---

## 🔗 Communication inter-services

### 1. Frontend ↔ Backend

**Protocole :** HTTP/HTTPS  
**Format :** JSON  
**Authentification :** JWT (cookies httpOnly)

**Exemple de requête :**

```typescript
// Frontend (TypeScript)
const response = await axios.post('/api/v1/appointments/', {
  patient_first_name: 'Jean',
  patient_last_name: 'Dupont',
  patient_email: 'jean@example.com',
  patient_phone: '06 123 45 67',
  date: '2026-02-01',
  time: '10:00',
  consultation_type: 'generale',
  reason: 'Contrôle de routine'
}, {
  withCredentials: true // Envoyer les cookies
});
```

**Réponse :**

```json
{
  "id": 123,
  "patient_first_name": "Jean",
  "patient_last_name": "Dupont",
  "date": "2026-02-01",
  "time": "10:00:00",
  "status": "pending",
  "created_at": "2026-01-24T10:30:00Z"
}
```

### 2. Backend ↔ PostgreSQL

**Protocole :** PostgreSQL wire protocol  
**ORM :** Django ORM  
**Connection pooling :** Oui (pgbouncer en production)

**Exemple de requête :**

```python
# Backend (Python/Django)
from apps.appointments.models import Appointment

# Créer un rendez-vous
appointment = Appointment.objects.create(
    patient_first_name='Jean',
    patient_last_name='Dupont',
    patient_email='jean@example.com',
    patient_phone='06 123 45 67',
    date='2026-02-01',
    time='10:00',
    consultation_type='generale',
    reason='Contrôle de routine'
)

# SQL généré automatiquement par Django ORM
# INSERT INTO appointments_appointment (...)
# VALUES (...) RETURNING id;
```

### 3. Backend ↔ Redis

**Protocole :** Redis protocol  
**Client :** django-redis  
**Usage :** Cache, sessions, rate limiting

**Exemple de cache :**

```python
from django.core.cache import cache

# Mettre en cache
cache.set('available_slots_2026-02-01', slots_data, timeout=300)

# Récupérer du cache
slots = cache.get('available_slots_2026-02-01')

# Invalider le cache
cache.delete('available_slots_2026-02-01')
```

### 4. Backend ↔ Celery

**Protocole :** AMQP (via Redis)  
**Broker :** Redis  
**Result backend :** Redis

**Exemple de tâche :**

```python
# Définir une tâche
@shared_task
def send_appointment_confirmation(appointment_id):
    appointment = Appointment.objects.get(id=appointment_id)
    send_email(
        to=appointment.patient_email,
        subject='Confirmation de rendez-vous',
        template='appointment_confirmation.html',
        context={'appointment': appointment}
    )

# Lancer la tâche (asynchrone)
send_appointment_confirmation.delay(appointment.id)
```

---

## 🚀 Déploiement

### Architecture de déploiement

```
┌─────────────────────────────────────────────────────────┐
│                    Production Server                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Nginx (Port 80/443)                │    │
│  │  - SSL/TLS Termination                          │    │
│  │  - Load Balancing                               │    │
│  │  - Static Files Serving                         │    │
│  └────────┬────────────────────────┬─────────────┘    │
│           │                        │                    │
│  ┌────────▼────────┐      ┌────────▼────────┐         │
│  │  Next.js        │      │  Gunicorn       │         │
│  │  (PM2/systemd)  │      │  (systemd)      │         │
│  │  Port: 3000     │      │  Port: 8000     │         │
│  └─────────────────┘      └────────┬────────┘         │
│                                    │                    │
│  ┌─────────────────────────────────┼─────────────┐    │
│  │                                 │             │    │
│  │  ┌──────────────┐  ┌───────────▼──────┐  ┌──▼───┐│
│  │  │ PostgreSQL   │  │     Redis        │  │Celery││
│  │  │ Port: 5432   │  │   Port: 6379     │  │Worker││
│  │  └──────────────┘  └──────────────────┘  └──────┘│
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Environnements

| Environnement | URL | Base de données | Cache |
|---------------|-----|-----------------|-------|
| **Development** | localhost:3000 | PostgreSQL local | Redis local |
| **Staging** | staging.vida.cg | PostgreSQL staging | Redis staging |
| **Production** | vida.cg | PostgreSQL prod | Redis prod |

### Stratégie de déploiement

**Blue-Green Deployment :**
1. Déployer la nouvelle version (Green)
2. Tester la nouvelle version
3. Basculer le trafic vers Green
4. Garder Blue en backup
5. Si problème → rollback vers Blue

---

## 🎯 Décisions architecturales

### ADR 001 : Séparation Frontend/Backend

**Contexte :**  
Besoin d'une architecture scalable et maintenable.

**Décision :**  
Séparer complètement le frontend (Next.js) du backend (Django).

**Conséquences :**
- ✅ Développement indépendant des équipes
- ✅ Scalabilité horizontale
- ✅ Réutilisation de l'API (mobile futur)
- ❌ Complexité accrue du déploiement
- ❌ Latence réseau entre frontend et backend

### ADR 002 : JWT avec cookies httpOnly

**Contexte :**  
Besoin d'authentification sécurisée contre XSS.

**Décision :**  
Utiliser JWT stockés dans des cookies httpOnly au lieu de localStorage.

**Conséquences :**
- ✅ Protection contre XSS
- ✅ Rotation automatique des tokens
- ✅ Révocation possible (blacklist)
- ❌ Nécessite CORS configuré correctement
- ❌ Cookies plus complexes à gérer

### ADR 003 : PostgreSQL comme base de données

**Contexte :**  
Besoin d'une base de données relationnelle robuste.

**Décision :**  
Utiliser PostgreSQL au lieu de MySQL ou MongoDB.

**Conséquences :**
- ✅ ACID compliant
- ✅ JSON support natif
- ✅ Extensions puissantes (PostGIS, etc.)
- ✅ Performances excellentes
- ❌ Courbe d'apprentissage plus élevée

### ADR 004 : Celery pour tâches asynchrones

**Contexte :**  
Besoin d'envoyer des emails sans bloquer les requêtes HTTP.

**Décision :**  
Utiliser Celery avec Redis comme broker.

**Conséquences :**
- ✅ Tâches asynchrones non-bloquantes
- ✅ Retry automatique en cas d'échec
- ✅ Tâches planifiées (cron)
- ❌ Complexité d'infrastructure (Redis + workers)
- ❌ Debugging plus difficile

### ADR 005 : Next.js App Router

**Contexte :**  
Besoin de SEO et de performances optimales.

**Décision :**  
Utiliser Next.js 15 avec App Router (au lieu de Pages Router).

**Conséquences :**
- ✅ Server Components par défaut
- ✅ Streaming et Suspense
- ✅ Layouts imbriqués
- ✅ Meilleur SEO
- ❌ Nouvelle API à apprendre
- ❌ Moins de ressources communautaires (nouveau)

---

## 📊 Métriques et KPIs

### Performance

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Time to First Byte (TTFB) | < 200ms | ~150ms |
| First Contentful Paint (FCP) | < 1.5s | ~1.2s |
| Largest Contentful Paint (LCP) | < 2.5s | ~2.0s |
| API Response Time (p95) | < 500ms | ~300ms |
| Database Query Time (p95) | < 100ms | ~50ms |

### Disponibilité

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Uptime | > 99.9% | 99.95% |
| Error Rate | < 0.1% | 0.05% |
| API Success Rate | > 99.5% | 99.8% |

### Scalabilité

| Métrique | Capacité actuelle | Limite |
|----------|-------------------|--------|
| Requêtes/seconde | ~100 | ~500 |
| Utilisateurs concurrents | ~50 | ~200 |
| Taille base de données | 500 MB | 100 GB |

---

## 🔮 Évolution future

### Court terme (3-6 mois)

- [ ] WebSockets pour notifications temps réel
- [ ] Progressive Web App (PWA)
- [ ] Optimisation des requêtes SQL
- [ ] CDN pour assets statiques

### Moyen terme (6-12 mois)

- [ ] Application mobile (React Native)
- [ ] GraphQL API (optionnel)
- [ ] Elasticsearch pour recherche avancée
- [ ] Microservices pour modules complexes

### Long terme (12+ mois)

- [ ] Multi-tenant (plusieurs centres médicaux)
- [ ] IA pour aide au diagnostic
- [ ] Téléconsultation vidéo
- [ ] Intégration avec systèmes hospitaliers

---

## 📚 Ressources

- [Architecture backend détaillée](./backend-architecture.md)
- [Architecture frontend détaillée](./frontend-architecture.md)
- [Schéma de base de données](./database-schema.md)
- [Documentation sécurité](./security.md)

---

**Architecture documentée ! 🎯**
