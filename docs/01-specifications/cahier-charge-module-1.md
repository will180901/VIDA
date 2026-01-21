# 📋 CAHIER DES CHARGES - CENTRE MÉDICAL VIDA
## Module 1 : Vue d'ensemble & Architecture générale

---

## 🎯 INFORMATIONS PROJET

| Élément | Détail |
|---------|--------|
| **Nom du projet** | Centre Médical VIDA - Plateforme digitale |
| **Client** | Centre Médical VIDA |
| **Type** | Site vitrine + Application de gestion |
| **Secteur** | Santé / Ophtalmologie |
| **Localisation** | Brazzaville, Congo |
| **Date création** | Janvier 2026 |
| **Version** | 1.0 |

---

## 📖 CONTEXTE & PRÉSENTATION

### À propos de VIDA
Le **Centre Médical VIDA** est un établissement spécialisé en ophtalmologie créé le 23 décembre 2022 à Brazzaville, Congo. VIDA se positionne comme un acteur de référence dans le diagnostic, le suivi et le traitement des affections oculaires en Afrique centrale.

### Mission
Offrir des soins oculaires de qualité, personnalisés et accessibles à tous, grâce à :
- Une équipe médicale qualifiée
- Des équipements modernes
- Une approche humaine et bienveillante

### Vision stratégique
Devenir **le centre de référence en ophtalmologie** au Congo et en Afrique centrale, reconnu pour :
- L'excellence de ses soins
- Son expertise médicale
- Son approche centrée sur le patient
- Son innovation technologique

---

## 🎯 OBJECTIFS DU PROJET

### Objectifs business
1. **Augmenter la visibilité** du centre médical auprès du grand public
2. **Faciliter l'accès aux soins** via la prise de RDV en ligne
3. **Optimiser la gestion interne** (RDV, patients, stock lunetterie)
4. **Réduire le no-show** grâce aux rappels automatiques
5. **Générer des revenus additionnels** via la lunetterie en ligne
6. **Fidéliser les patients** avec un programme de récompenses
7. **Collecter des données** pour améliorer l'offre de soins

### Objectifs techniques
1. **Performance** : Temps de chargement < 2 secondes
2. **Disponibilité** : Uptime de 99.5%
3. **Sécurité** : Conformité données de santé (RGPD + normes locales)
4. **Scalabilité** : Support de 10 000+ patients
5. **Accessibilité** : WCAG 2.1 niveau AA
6. **Responsive** : Mobile-first design

### Objectifs UX
1. **Simplicité** : Prise de RDV en moins de 3 clics
2. **Clarté** : Navigation intuitive pour tous les âges
3. **Confiance** : Design professionnel et rassurant
4. **Rapidité** : Actions instantanées, feedback immédiat
5. **Accessibilité** : Interface adaptée aux malvoyants

---

## 🏗️ ARCHITECTURE GLOBALE

### Structure du projet

Le projet est composé de **2 applications distinctes** :

#### 1. Site Vitrine Public (Front-office)
**Audience** : Grand public, patients potentiels et existants

**Accès** : `www.centremedicalvida.com`

**Fonctionnalités principales** :
- Pages institutionnelles (Accueil, À propos, Services, Contact)
- Système d'inscription et d'authentification
- Prise de rendez-vous en ligne
- Espace patient personnel (dashboard, historique, dossier médical)
- Téléconsultation
- Lunetterie en ligne avec essayage virtuel
- Chatbot IA 24/7
- Blog santé oculaire
- Multi-langue (Français, Lingala, Kikongo)
- **PWA Offline-First** (fonctionne même sans internet)
- **Notifications push** (Web Push API)
- **Intégration WhatsApp Business** (rappels, notifications)

#### 2. Application Administrative (Back-office)
**Audience** : Personnel médical et administratif de VIDA

**Accès** : `admin.centremedicalvida.com` (sous-domaine sécurisé)

**Fonctionnalités principales** :
- Dashboard analytics en temps réel
- Gestion des rendez-vous (planning, confirmations, annulations)
- Gestion des patients (dossiers médicaux complets)
- Gestion stock lunetterie (inventaire, alertes, ventes)
- Gestion du personnel et des rôles
- **Gestion multi-praticiens** (planning, absences, spécialités)
- **Module paiement VIDA Pay** (Mobile Money, wallet, points fidélité)
- **Module communication** (chat patient-staff, notifications)
- **Module analytics & BI** (statistiques, prédictions ML)
- Module de facturation et comptabilité
- Export de rapports (PDF, Excel)
- Logs d'audit et traçabilité
- Paramètres système

---

## 🛠️ STACK TECHNOLOGIQUE

### Backend (API REST)

**Framework principal** : Django 5.0+
- Django REST Framework (DRF) pour l'API
- Django Channels pour WebSocket (temps réel)
- Django Celery pour tâches asynchrones
- **Django Elasticsearch DSL** (recherche full-text)

**Base de données** :
- **PostgreSQL 15+** (données relationnelles)
- **Redis 7+** (cache + sessions + broker Celery)
- **Elasticsearch 8+** (recherche avancée)

**Authentification & Sécurité** :
- Django-allauth (inscription/connexion sociale optionnelle)
- JWT tokens (djangorestframework-simplejwt)
- Django-cors-headers (gestion CORS)
- Django-ratelimit (limitation requêtes)
- **django-cryptography** (chiffrement champs sensibles)
- **django-axes** (protection brute force)

**Tâches asynchrones** :
- Celery 5+ avec Redis comme broker
- Celery Beat (tâches planifiées : rappels SMS, emails)
- **django-celery-beat** (tâches planifiées dynamiques)

**Stockage fichiers** :
- AWS S3 ou Cloudinary (images, documents médicaux)
- django-storages (abstraction stockage)

**Tests** :
- Pytest + pytest-django
- Factory Boy (fixtures)
- Coverage.py (couverture de code)
- **Locust** (tests de charge)
- **OWASP ZAP** (tests sécurité)

### Frontend

**Framework principal** : React 18+ avec Next.js 14+
- Next.js pour SSR (Server-Side Rendering) et SEO optimal
- TypeScript pour typage statique (optionnel mais recommandé)

**Gestion d'état** :
- React Query (TanStack Query) pour state serveur
- Zustand ou Context API pour state local

**UI & Styling** :
- Tailwind CSS 3+ (respect strict de la charte graphique)
- Framer Motion (animations fluides)
- Headless UI (composants accessibles)

**Formulaires & Validation** :
- React Hook Form
- Zod ou Yup (validation schémas)

**Communication temps réel** :
- Socket.io-client (WebSocket pour chat/téléconsultation)

**Icônes** :
- Lucide React (icônes SVG)

**Gestion dates** :
- date-fns ou Day.js (manipulation dates)

### Gestionnaire de paquets

**Frontend UNIQUEMENT** : **pnpm** (OBLIGATOIRE)
- Jamais npm ou yarn
- Fichier `pnpm-lock.yaml` versionné

**Backend** : pip avec venv
- Fichier `requirements.txt` versionné

### Services externes & APIs

#### Paiement en ligne
- **Stripe** (cartes internationales)
- **MTN MoMo API** (Mobile Money Congo)
- **Airtel Money API** (Mobile Money Congo)
- **Wave** (paiement mobile local Afrique)
- Fallback : Intégration API bancaire locale si nécessaire

#### Notifications
- **Twilio** ou **Africa's Talking** (SMS)
- **SendGrid** ou **Mailgun** (emails transactionnels)
- **WhatsApp Business API** (notifications, rappels)
- **Web Push API** (notifications navigateur)

#### Téléconsultation vidéo
- **Twilio Video API** (recommandé pour fiabilité)
- Alternative : **Agora.io** ou **Jitsi Meet** (open-source)

#### Chatbot IA
- **OpenAI API** (GPT-4 pour réponses contextuelles)
- **Pinecone** (RAG - Retrieval Augmented Generation)
- Alternative : **Anthropic Claude API** ou modèle local open-source

#### Essayage virtuel lunettes
- **MediaPipe Face Mesh** (détection faciale)
- **Three.js** (rendu 3D)
- **TensorFlow.js** (traitement côté client)

#### Intelligence Artificielle
- **Scikit-learn** (modèles ML pour prédictions)
- **Pandas** (analyse de données)

#### Calendrier
- **Google Calendar API** (synchronisation optionnelle)

#### Géolocalisation
- **Google Maps API** (carte interactive page Contact)

---

## 📐 ARCHITECTURE TECHNIQUE

### Architecture applicative

```
                         ┌─────────────────────┐
                         │    CloudFlare       │
                         │   (CDN + WAF)       │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │       Nginx         │
                         │  (Reverse Proxy)    │
                         │  (Load Balancer)    │
                         └──────────┬──────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
  ┌────────▼────────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
  │  Site Vitrine   │    │   Patient App     │    │    Admin App      │
  │  Next.js (SSG)  │    │   Next.js (PWA)   │    │   Next.js (SPA)   │
  │   Port 3000     │    │    Port 3000      │    │    Port 3001      │
  └────────┬────────┘    └─────────┬─────────┘    └─────────┬─────────┘
           │                       │                        │
           └───────────────────────┼────────────────────────┘
                                   │
                         ┌─────────▼─────────┐
                         │   API Gateway     │
                         │ (Rate Limiting)   │
                         └─────────┬─────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────▼───────┐        ┌─────────▼─────────┐      ┌─────────▼─────────┐
│  Django API   │        │  Django Channels  │      │     Celery        │
│   (REST)      │        │   (WebSocket)     │      │    Workers        │
│  Port 8000    │        │   Port 8001       │      │                   │
└───────┬───────┘        └─────────┬─────────┘      └─────────┬─────────┘
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────▼───────┐        ┌─────────▼─────────┐      ┌─────────▼─────────┐
│  PostgreSQL   │        │      Redis        │      │   Elasticsearch   │
│    (BDD)      │        │  (Cache/Broker)   │      │    (Search)       │
│  Port 5432    │        │   Port 6379       │      │   Port 9200       │
└───────────────┘        └───────────────────┘      └───────────────────┘
                                   │
                         ┌─────────▼─────────┐
                         │   Object Storage  │
                         │  (S3/MinIO)       │
                         └───────────────────┘

Services externes :
├── Paiement
│   ├── MTN MoMo API
│   ├── Airtel Money API
│   └── Stripe
├── Communications
│   ├── Twilio (SMS)
│   ├── SendGrid (Email)
│   ├── WhatsApp Business API
│   └── Web Push API
├── IA & ML
│   ├── OpenAI API
│   ├── Pinecone (RAG)
│   ├── Scikit-learn
│   └── TensorFlow.js
└── Autres
    ├── Google Maps API
    ├── Twilio Video (Téléconsultation)
    └── MediaPipe (AR/VR)
```

### Architecture des données (Modèles principaux)

#### Users & Authentication
- **User** (utilisateur système Django étendu)
- **Patient** (profil patient lié à User)
- **Staff** (personnel médical lié à User)
- **Practitioner** (praticien médical avec spécialité, planning)
- **Role** (rôles : admin, médecin, secrétaire, opticien, comptable)

#### Paiement & Finance
- **Payment** (transaction de paiement)
- **VIDAWallet** (portefeuille patient)
- **WalletTransaction** (historique transactions wallet)
- **LoyaltyPointsTransaction** (historique points fidélité)

#### Communication
- **Conversation** (échange patient-staff)
- **Message** (message dans une conversation)
- **NotificationPreference** (préférences de notifications)
- **PushSubscription** (abonnement push d'un appareil)

#### Analytics & BI
- **DailyMetrics** (métriques quotidiennes agrégées)
- **PractitionerMetrics** (métriques par praticien)
- **PatientBehavior** (analyse comportementale pour ML)

#### Gamification
- **LoyaltyLevel** (niveaux de fidélité)
- **Achievement** (badges/accomplissements)
- **PatientAchievement** (accomplissements débloqués par patient)

#### Gestion des rendez-vous
- **Appointment** (rendez-vous)
- **AppointmentType** (type consultation : première visite, suivi, urgence)
- **TimeSlot** (créneaux horaires disponibles)
- **Reminder** (rappels envoyés)

#### Dossiers médicaux
- **MedicalRecord** (dossier médical patient)
- **Consultation** (consultation passée)
- **Prescription** (ordonnances)
- **ExamResult** (résultats d'examens)
- **Document** (fichiers PDF, images)

#### Lunetterie
- **Product** (produit lunetterie)
- **Category** (catégorie : montures, verres, accessoires)
- **Stock** (inventaire)
- **Order** (commande)
- **OrderItem** (ligne de commande)

#### Contenu & Communication
- **BlogPost** (articles blog)
- **ContactMessage** (messages formulaire contact)
- **ChatConversation** (conversations chatbot)
- **TeleconsultationSession** (sessions vidéo)

#### Système
- **Notification** (notifications utilisateurs)
- **AuditLog** (logs système pour traçabilité)
- **Setting** (paramètres application)

---

## 🔐 SÉCURITÉ & CONFORMITÉ

### Mesures de sécurité obligatoires

#### Protection des données de santé
1. **Chiffrement** :
   - Chiffrement en transit (HTTPS/TLS 1.3)
   - Chiffrement au repos (PostgreSQL encrypted storage)
   - Chiffrement des données sensibles avec Fernet (numéros patients, résultats, antécédents)
   - **Chiffrement E2E** pour les dossiers médicaux critiques

2. **Authentification renforcée** :
   - JWT tokens avec expiration courte (15 min)
   - Refresh tokens (30 jours)
   - 2FA obligatoire pour admin et personnel médical
   - Rate limiting uniformisé à **5 tentatives par 15 minutes** (correction incohérence)
   - Device fingerprinting pour détection connexions suspectes
   - MFA avec TOTP pour accès admin

3. **Autorisation granulaire** :
   - RBAC (Role-Based Access Control) **corrigé** : ajout rôle "opticien" avec permissions spécifiques
   - Permissions par endpoint
   - Séparation stricte patient/staff/admin
   - **Gestion multi-praticiens** : accès aux dossiers limité par praticien

4. **Traçabilité** :
   - Logs d'audit **immuables** avec chaînage cryptographique (blockchain light)
   - Qui a consulté quel dossier et quand
   - Historique des modifications
   - **Audit trail** pour toutes les actions critiques

#### Conformité réglementaire
- **RGPD** : Droit à l'oubli, export données, consentement
- **Données de santé** : Hébergement certifié (HDS si applicable)
- **Consentement éclairé** : Conditions d'utilisation + politique confidentialité
- **Droit d'accès** : Export complet des données patient (ZIP avec JSON + PDFs)
- **Droit de rectification** : Mise à jour par patient et admin
- **Droit à l'oubli** : Anonymisation des données médicales (obligation légale 20 ans) tout en supprimant données identifiantes

#### Protection contre les attaques
- **CSRF** : Tokens CSRF Django
- **XSS** : Sanitization inputs, CSP headers
- **SQL Injection** : ORM Django (requêtes paramétrées)
- **Rate Limiting** : Throttling DRF + django-ratelimit
- **CORS** : Whitelist domaines autorisés
- **DDoS** : Protection via CloudFlare + rate limiting intelligent
- **Brute Force** : django-axes pour protection contre attaques par force brute
- **Injection NoSQL** : Validation et sanitization des entrées

#### Sauvegarde & Disaster Recovery
- Backups automatiques quotidiens (base de données + fichiers)
- Rétention 30 jours
- Plan de reprise d'activité (RTO < 4h, RPO < 24h)
- **Sauvegarde BDD** : Script backup automatisé avec compression et encryption
- **Monitoring** : Surveillance 24/7 avec alertes
- **Rollback** : Procédure de restauration rapide en cas de problème

---

## 📱 RESPONSIVE & ACCESSIBILITÉ

### Breakpoints (identiques charte graphique)
| Appareil | Largeur | Layout |
|----------|---------|--------|
| Mobile | < 768px | 1 colonne |
| Tablet | 768px - 1023px | 2 colonnes |
| Desktop | ≥ 1024px | 3 colonnes |

### Accessibilité WCAG 2.1 AA
- Contraste minimum 4.5:1 (texte normal)
- Navigation au clavier complète
- Balises ARIA appropriées
- Textes alternatifs pour images
- Focus visible
- Lecteurs d'écran compatibles

### Performance cibles
- **Lighthouse Score** : > 90/100
- **First Contentful Paint** : < 1.5s
- **Time to Interactive** : < 3s
- **Largest Contentful Paint** : < 2.5s

---

## 🎨 CHARTE GRAPHIQUE VIDA (Résumé)

### Couleurs
```
Primaire : #1D9A94 (Teal/Turquoise)
Secondaire : #E89B6E (Orange doux)
Texte principal : #2D3748
Texte secondaire : #718096
Backgrounds : #FFFFFF, #F7FAFC
```

### Typographie
- **Titres** : Poppins (Bold, Semibold)
- **Corps** : Inter (Regular, Medium)

### Effets
- **Grain subtil** : Obligatoire sur toutes surfaces (opacity 15%)
- **Glassmorphism** : Headers fixes
- **Border-radius** : 4px (boutons, cards), 8px (containers), 12px (modales)
- **Ombres** : 5 niveaux de depth

### Espacement (base 4px)
Voir charte ARCEE pour détails complets.

---

## 📊 INDICATEURS DE SUCCÈS (KPIs)

### Adoption utilisateurs
- Nombre d'inscriptions mensuelles
- Taux de conversion visiteur → patient inscrit
- Nombre de RDV pris en ligne vs téléphone

### Engagement
- Taux de show-up (présence aux RDV)
- Nombre de connexions par patient/mois
- Utilisation téléconsultation

### Business
- Chiffre d'affaires lunetterie en ligne
- Réduction coûts administratifs
- Taux de fidélisation patients

### Technique
- Uptime (cible 99.5%)
- Temps de réponse API (< 200ms)
- Taux d'erreurs (< 0.1%)

---

## 🚀 MÉTHODOLOGIE DE DÉVELOPPEMENT

### Approche Agile (Scrum)
- **Sprints** : 2 semaines
- **Cérémonies** : Daily, Planning, Review, Retro
- **Outils** : GitHub Projects ou Jira

### Workflow Git
```
main (production)
  ↑
develop (pré-production)
  ↑
feature/* (fonctionnalités)
bugfix/* (corrections)
hotfix/* (urgences production)
```

### Branches principales
- `main` : Code en production (protégée)
- `develop` : Code en développement
- `feature/nom-fonctionnalite` : Nouvelle fonctionnalité
- `bugfix/nom-bug` : Correction de bug

### Convention commits
```
feat: Ajout prise RDV en ligne
fix: Correction email confirmation
docs: Mise à jour README
refactor: Optimisation queries database
test: Ajout tests endpoint patients
chore: Mise à jour dépendances
```

### Environnements
1. **Local** : Développement (venv + Docker optionnel)
2. **Staging** : Tests pré-production (identique prod)
3. **Production** : Site live

### Tests
- **Backend** :
  - Tests unitaires (Pytest) : > 80% coverage
  - Tests d'intégration (API endpoints)
  - Tests de charge (Locust)

- **Frontend** :
  - Tests unitaires (Jest + React Testing Library)
  - Tests E2E (Playwright ou Cypress)
  - Tests accessibilité (axe-core)

### CI/CD
- **GitHub Actions** ou **GitLab CI**
- Pipeline automatique :
  1. Lint code (Black, ESLint, Prettier)
  2. Run tests
  3. Build application
  4. Deploy staging (auto si tests passent)
  5. Deploy production (manuel après validation)

---

## 📅 PLANNING GLOBAL (Estimation)

### Phase 1 : MVP (4-6 semaines)
- Infrastructure & configuration projets
- Site vitrine (pages statiques)
- Système inscription/authentification
- Prise de RDV basique
- Espace patient minimal
- Admin : Gestion RDV + patients

### Phase 2 : Différenciation (4 semaines)
- Dossier médical complet
- Téléconsultation
- Chatbot IA
- Rappels automatiques
- Essayage virtuel lunettes
- Paiement en ligne

### Phase 3 : Excellence (3 semaines)
- Programme fidélité
- Multi-langue
- Blog + SEO
- Analytics avancés
- Optimisations performances
- Tests utilisateurs

### Phase 4 : Déploiement & Maintenance
- Migration données (si existantes)
- Formation personnel
- Documentation utilisateur
- Support & maintenance continue

---

## ⚠️ CONTRAINTES & RISQUES

### Contraintes techniques
- **Gestionnaire paquets** : pnpm OBLIGATOIRE (pas npm/yarn)
- **Environnement backend** : venv Python exclusivement
- **Compatibilité navigateurs** : Support IE11 non requis
- **Bande passante** : Optimisation images pour connexions lentes

### Risques identifiés
| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Latence APIs SMS/Paiement | Moyen | Moyenne | Gestion asynchrone + fallback |
| Adoption faible personnel | Élevé | Faible | Formation intensive + support |
| Sécurité données patients | Critique | Faible | Audit sécurité + pentesting |
| Coûts services externes | Moyen | Moyenne | Budget prévisionnel + alternatives |

### Dépendances externes
- Disponibilité APIs tierces (Stripe, Twilio)
- Connexion internet stable
- Hébergement fiable

---

## 📞 PARTIES PRENANTES

### Côté client (VIDA)
- **Sponsor projet** : Direction Centre Médical VIDA
- **Product Owner** : Responsable administratif
- **Utilisateurs finaux** :
  - Patients
  - Médecins ophtalmologues
  - Secrétariat médical
  - Opticiens

### Côté développement
- **Chef de projet** : Coordination globale
- **Backend Developer** : API Django
- **Frontend Developer** : Interfaces React
- **UI/UX Designer** : Design système
- **DevOps** : Infrastructure & déploiement
- **QA Tester** : Tests & validation

---

## 📚 DOCUMENTATION À PRODUIRE

### Documentation technique
1. **README.md** : Installation, configuration, contribution
2. **API Documentation** : Swagger/OpenAPI
3. **Architecture Decision Records** (ADR)
4. **Guide déploiement**
5. **Procédures backup/restore**

### Documentation utilisateur
1. **Guide patient** : Comment utiliser la plateforme
2. **Guide administrateur** : Gestion back-office
3. **FAQ**
4. **Tutoriels vidéo** (optionnel)

### Documentation maintenance
1. **Procédures de surveillance**
2. **Plan de reprise d'activité**
3. **Contacts support technique**

---

## ✅ CRITÈRES D'ACCEPTATION MODULE 1

Ce module est validé lorsque :
- [ ] L'architecture globale est approuvée
- [ ] Le stack technologique est validé
- [ ] Les objectifs sont clairs et mesurables
- [ ] Les contraintes sont comprises et acceptées
- [ ] Le planning est réaliste
- [ ] Les risques sont identifiés
- [ ] Les parties prenantes sont alignées

---

## 🔄 PROCHAINES ÉTAPES

Une fois ce module validé, passage à :
- **Module 2** : Site vitrine public (pages statiques)
- **Module 3** : Système inscription/authentification
- **Module 4** : Prise de rendez-vous
- **Module 5** : Espace patient
- **Module 6** : Admin - Gestion RDV & patients
- **Module 7** : Admin - Lunetterie
- **Module 8** : Fonctionnalités avancées
- **Module 9** : Intégrations tierces

---

**Document créé le** : 04 janvier 2026  
**Version** : 1.0  
**Statut** : En attente de validation  
**Auteur** : Équipe projet VIDA