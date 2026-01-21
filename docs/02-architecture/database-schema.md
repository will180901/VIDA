# 🗄️ Schéma de base de données - VIDA

Documentation complète du schéma de base de données PostgreSQL.

---

## 📋 Table des matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Schéma complet](#-schéma-complet)
3. [Tables détaillées](#-tables-détaillées)
4. [Relations](#-relations)
5. [Indexes](#-indexes)
6. [Contraintes](#-contraintes)

---

## 🎯 Vue d'ensemble

### Statistiques

| Métrique | Valeur |
|----------|--------|
| **Nombre de tables** | 15 |
| **Nombre d'applications** | 3 (users, appointments, content_management) |
| **Base de données** | PostgreSQL 15+ |
| **Encodage** | UTF-8 |
| **Timezone** | UTC |

### Applications Django

```
┌─────────────────────────────────────────────────────────┐
│                    Base de données                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  App: users (Utilisateurs)                      │    │
│  │  - users_user                                   │    │
│  │  - users_emailverificationtoken                 │    │
│  │  - users_passwordresettoken                     │    │
│  │  - users_auditlog                               │    │
│  │  - users_loginattempt                           │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  App: appointments (Rendez-vous)                │    │
│  │  - appointments_appointment                     │    │
│  │  - appointments_appointmentslotlock             │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  App: content_management (Contenu)              │    │
│  │  - content_management_clinicsetting             │    │
│  │  - content_management_heroslide                 │    │
│  │  - content_management_medicalservice            │    │
│  │  - content_management_clinicschedule            │    │
│  │  - content_management_clinicholiday             │    │
│  │  - content_management_contactmessage            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Django System Tables                           │    │
│  │  - django_migrations                            │    │
│  │  - django_content_type                          │    │
│  │  - auth_permission                              │    │
│  │  - token_blacklist_*                            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Schéma complet

### Diagramme ERD (Entity-Relationship Diagram)

```
┌─────────────────────────┐
│      users_user         │
├─────────────────────────┤
│ PK  id                  │
│ UQ  email               │
│     password            │
│     first_name          │
│     last_name           │
│     phone               │
│     date_of_birth       │
│     gender              │
│     address             │
│     avatar              │
│     email_verified      │
│     is_active           │
│     is_staff            │
│     is_superuser        │
│     created_at          │
│     updated_at          │
└──────────┬──────────────┘
           │
           │ 1:N
           │
┌──────────▼──────────────────────────┐
│  appointments_appointment           │
├─────────────────────────────────────┤
│ PK  id                              │
│ FK  patient_id (nullable)           │
│     patient_first_name              │
│     patient_last_name               │
│ UQ  patient_email                   │
│     patient_phone                   │
│ UQ  date + time                     │
│     consultation_type               │
│     reason                          │
│     status                          │
│     confirmed_at                    │
│     cancelled_at                    │
│     cancellation_reason             │
│     created_at                      │
│     updated_at                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  appointments_appointmentslotlock   │
├─────────────────────────────────────┤
│ PK  id                              │
│ UQ  date + time                     │
│     locked_by                       │
│     expires_at                      │
│     created_at                      │
└─────────────────────────────────────┘

┌──────────────────────────────────┐
│  users_emailverificationtoken    │
├──────────────────────────────────┤
│ PK  id                           │
│ FK  user_id                      │
│ UQ  token                        │
│     expires_at                   │
│     used                         │
│     created_at                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  users_passwordresettoken        │
├──────────────────────────────────┤
│ PK  id                           │
│ FK  user_id                      │
│ UQ  token                        │
│     expires_at                   │
│     used                         │
│     created_at                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  users_auditlog                  │
├──────────────────────────────────┤
│ PK  id                           │
│ FK  user_id (nullable)           │
│     action                       │
│     model_name                   │
│     object_id                    │
│     changes (JSON)               │
│     ip_address                   │
│     user_agent                   │
│     timestamp                    │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  content_management_clinicsetting│
├──────────────────────────────────┤
│ PK  id                           │
│     name                         │
│     address                      │
│     phone_primary                │
│     phone_secondary              │
│     whatsapp                     │
│     email                        │
│     fee_general                  │
│     fee_specialized              │
│     opening_hours (JSON)         │
│     about_text                   │
│     rccm                         │
│     niu                          │
│     created_at                   │
│     updated_at                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  content_management_heroslide    │
├──────────────────────────────────┤
│ PK  id                           │
│     title                        │
│     subtitle                     │
│     image                        │
│     order                        │
│     is_active                    │
│     created_at                   │
│     updated_at                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  content_management_medicalservice│
├──────────────────────────────────┤
│ PK  id                           │
│     title                        │
│     description                  │
│     details                      │
│     image                        │
│     icon_name                    │
│     order                        │
│     is_active                    │
│     created_at                   │
│     updated_at                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  content_management_clinicschedule│
├──────────────────────────────────┤
│ PK  id                           │
│ UQ  day_of_week                  │
│     is_open                      │
│     morning_start                │
│     morning_end                  │
│     afternoon_start              │
│     afternoon_end                │
│     slot_duration                │
│     created_at                   │
│     updated_at                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  content_management_clinicholiday│
├──────────────────────────────────┤
│ PK  id                           │
│ UQ  date                         │
│     name                         │
│     is_recurring                 │
│     created_at                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  content_management_contactmessage│
├──────────────────────────────────┤
│ PK  id                           │
│     name                         │
│     email                        │
│     phone                        │
│     subject                      │
│     message                      │
│     is_read                      │
│     replied_at                   │
│     created_at                   │
└──────────────────────────────────┘
```

---

## 📋 Tables détaillées

### 1. users_user

**Description :** Table des utilisateurs (patients et staff).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| email | VARCHAR(254) | UNIQUE, NOT NULL | Email (identifiant de connexion) |
| password | VARCHAR(128) | NOT NULL | Mot de passe hashé (Argon2) |
| first_name | VARCHAR(150) | NOT NULL | Prénom |
| last_name | VARCHAR(150) | NOT NULL | Nom |
| phone | VARCHAR(20) | | Téléphone |
| date_of_birth | DATE | | Date de naissance |
| gender | VARCHAR(10) | | Genre (male, female, other) |
| address | TEXT | | Adresse complète |
| avatar | VARCHAR(100) | | Chemin vers l'avatar |
| emergency_contact | VARCHAR(255) | | Contact d'urgence |
| emergency_phone | VARCHAR(20) | | Téléphone d'urgence |
| email_verified | BOOLEAN | DEFAULT FALSE | Email vérifié ? |
| is_active | BOOLEAN | DEFAULT TRUE | Compte actif ? |
| is_staff | BOOLEAN | DEFAULT FALSE | Membre du staff ? |
| is_superuser | BOOLEAN | DEFAULT FALSE | Superutilisateur ? |
| last_login | TIMESTAMP | | Dernière connexion |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |
| updated_at | TIMESTAMP | DEFAULT NOW() | Date de modification |

**Indexes :**
- PRIMARY KEY sur `id`
- UNIQUE sur `email`
- INDEX sur `email_verified`
- INDEX sur `is_active`
- INDEX sur `created_at`

---

### 2. appointments_appointment

**Description :** Table des rendez-vous médicaux.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| patient_id | INTEGER | FOREIGN KEY (users_user), NULL | Lien vers utilisateur (si connecté) |
| patient_first_name | VARCHAR(150) | NOT NULL | Prénom du patient |
| patient_last_name | VARCHAR(150) | NOT NULL | Nom du patient |
| patient_email | VARCHAR(254) | NOT NULL | Email du patient |
| patient_phone | VARCHAR(20) | NOT NULL | Téléphone du patient |
| date | DATE | NOT NULL | Date du rendez-vous |
| time | TIME | NOT NULL | Heure du rendez-vous |
| consultation_type | VARCHAR(20) | NOT NULL | Type (generale, specialisee) |
| reason | TEXT | | Motif de consultation |
| status | VARCHAR(20) | DEFAULT 'pending' | Statut (pending, confirmed, cancelled, completed, no_show) |
| confirmed_at | TIMESTAMP | | Date de confirmation |
| cancelled_at | TIMESTAMP | | Date d'annulation |
| cancellation_reason | TEXT | | Raison d'annulation |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |
| updated_at | TIMESTAMP | DEFAULT NOW() | Date de modification |

**Contraintes :**
- UNIQUE sur `(date, time)` - Un seul RDV par créneau
- CHECK sur `consultation_type` IN ('generale', 'specialisee')
- CHECK sur `status` IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')

**Indexes :**
- PRIMARY KEY sur `id`
- FOREIGN KEY sur `patient_id`
- UNIQUE sur `(date, time)`
- INDEX sur `date`
- INDEX sur `status`
- INDEX sur `patient_email`
- INDEX sur `created_at`

---

### 3. appointments_appointmentslotlock

**Description :** Verrouillage temporaire des créneaux (10 min).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| date | DATE | NOT NULL | Date du créneau |
| time | TIME | NOT NULL | Heure du créneau |
| locked_by | VARCHAR(255) | NOT NULL | Session ID du client |
| expires_at | TIMESTAMP | NOT NULL | Date d'expiration du lock |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |

**Contraintes :**
- UNIQUE sur `(date, time)` - Un seul lock par créneau

**Indexes :**
- PRIMARY KEY sur `id`
- UNIQUE sur `(date, time)`
- INDEX sur `expires_at` (pour nettoyage)

---

### 4. users_emailverificationtoken

**Description :** Tokens de vérification d'email.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| user_id | INTEGER | FOREIGN KEY (users_user), NOT NULL | Utilisateur |
| token | VARCHAR(255) | UNIQUE, NOT NULL | Token de vérification |
| expires_at | TIMESTAMP | NOT NULL | Date d'expiration (24h) |
| used | BOOLEAN | DEFAULT FALSE | Token utilisé ? |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |

**Indexes :**
- PRIMARY KEY sur `id`
- FOREIGN KEY sur `user_id`
- UNIQUE sur `token`
- INDEX sur `expires_at`

---

### 5. users_passwordresettoken

**Description :** Tokens de réinitialisation de mot de passe.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| user_id | INTEGER | FOREIGN KEY (users_user), NOT NULL | Utilisateur |
| token | VARCHAR(255) | UNIQUE, NOT NULL | Token de reset |
| expires_at | TIMESTAMP | NOT NULL | Date d'expiration (1h) |
| used | BOOLEAN | DEFAULT FALSE | Token utilisé ? |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |

**Indexes :**
- PRIMARY KEY sur `id`
- FOREIGN KEY sur `user_id`
- UNIQUE sur `token`
- INDEX sur `expires_at`

---

### 6. users_auditlog

**Description :** Logs d'audit des actions utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| user_id | INTEGER | FOREIGN KEY (users_user), NULL | Utilisateur (si connecté) |
| action | VARCHAR(100) | NOT NULL | Action effectuée |
| model_name | VARCHAR(100) | | Nom du modèle modifié |
| object_id | INTEGER | | ID de l'objet modifié |
| changes | JSONB | | Détails des changements |
| ip_address | INET | | Adresse IP |
| user_agent | TEXT | | User agent du navigateur |
| timestamp | TIMESTAMP | DEFAULT NOW() | Date/heure de l'action |

**Indexes :**
- PRIMARY KEY sur `id`
- FOREIGN KEY sur `user_id`
- INDEX sur `action`
- INDEX sur `timestamp`
- INDEX sur `ip_address`

---

### 7. content_management_clinicsetting

**Description :** Paramètres de la clinique (singleton).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique (toujours 1) |
| name | VARCHAR(255) | NOT NULL | Nom de la clinique |
| address | TEXT | NOT NULL | Adresse complète |
| phone_primary | VARCHAR(20) | NOT NULL | Téléphone principal |
| phone_secondary | VARCHAR(20) | | Téléphone secondaire |
| whatsapp | VARCHAR(20) | | Numéro WhatsApp |
| email | VARCHAR(254) | NOT NULL | Email de contact |
| fee_general | DECIMAL(10,2) | NOT NULL | Tarif consultation générale |
| fee_specialized | DECIMAL(10,2) | NOT NULL | Tarif consultation spécialisée |
| opening_hours | JSONB | | Horaires d'ouverture |
| about_text | TEXT | | Texte "À propos" |
| rccm | VARCHAR(50) | | Numéro RCCM |
| niu | VARCHAR(50) | | Numéro NIU |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |
| updated_at | TIMESTAMP | DEFAULT NOW() | Date de modification |

**Contrainte :**
- Un seul enregistrement autorisé (singleton)

---

### 8. content_management_heroslide

**Description :** Slides du carousel de la page d'accueil.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| title | VARCHAR(255) | NOT NULL | Titre du slide |
| subtitle | TEXT | NOT NULL | Sous-titre |
| image | VARCHAR(100) | NOT NULL | Chemin vers l'image |
| order | INTEGER | DEFAULT 0 | Ordre d'affichage |
| is_active | BOOLEAN | DEFAULT TRUE | Slide actif ? |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |
| updated_at | TIMESTAMP | DEFAULT NOW() | Date de modification |

**Indexes :**
- PRIMARY KEY sur `id`
- INDEX sur `order`
- INDEX sur `is_active`

---

### 9. content_management_medicalservice

**Description :** Services médicaux proposés.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| title | VARCHAR(255) | NOT NULL | Titre du service |
| description | TEXT | NOT NULL | Description courte |
| details | TEXT | NOT NULL | Description détaillée |
| image | VARCHAR(100) | NOT NULL | Chemin vers l'image |
| icon_name | VARCHAR(50) | | Nom de l'icône |
| order | INTEGER | DEFAULT 0 | Ordre d'affichage |
| is_active | BOOLEAN | DEFAULT TRUE | Service actif ? |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |
| updated_at | TIMESTAMP | DEFAULT NOW() | Date de modification |

**Indexes :**
- PRIMARY KEY sur `id`
- INDEX sur `order`
- INDEX sur `is_active`

---

### 10. content_management_clinicschedule

**Description :** Horaires d'ouverture par jour de la semaine.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| day_of_week | INTEGER | UNIQUE, NOT NULL | Jour (0=Lundi, 6=Dimanche) |
| is_open | BOOLEAN | DEFAULT TRUE | Ouvert ce jour ? |
| morning_start | TIME | | Début matin |
| morning_end | TIME | | Fin matin |
| afternoon_start | TIME | | Début après-midi |
| afternoon_end | TIME | | Fin après-midi |
| slot_duration | INTEGER | DEFAULT 30 | Durée créneau (minutes) |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |
| updated_at | TIMESTAMP | DEFAULT NOW() | Date de modification |

**Contrainte :**
- UNIQUE sur `day_of_week` (un seul horaire par jour)

---

### 11. content_management_clinicholiday

**Description :** Jours fériés et fermetures exceptionnelles.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| date | DATE | UNIQUE, NOT NULL | Date du jour férié |
| name | VARCHAR(255) | NOT NULL | Nom du jour férié |
| is_recurring | BOOLEAN | DEFAULT FALSE | Récurrent chaque année ? |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |

**Indexes :**
- PRIMARY KEY sur `id`
- UNIQUE sur `date`
- INDEX sur `is_recurring`

---

### 12. content_management_contactmessage

**Description :** Messages de contact du formulaire.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| name | VARCHAR(255) | NOT NULL | Nom de l'expéditeur |
| email | VARCHAR(254) | NOT NULL | Email de l'expéditeur |
| phone | VARCHAR(20) | | Téléphone |
| subject | VARCHAR(255) | | Sujet du message |
| message | TEXT | NOT NULL | Contenu du message |
| is_read | BOOLEAN | DEFAULT FALSE | Message lu ? |
| replied_at | TIMESTAMP | | Date de réponse |
| created_at | TIMESTAMP | DEFAULT NOW() | Date de création |

**Indexes :**
- PRIMARY KEY sur `id`
- INDEX sur `is_read`
- INDEX sur `created_at`

---

## 🔗 Relations

### Diagramme des relations

```
users_user (1) ──────────────────────────────────┐
                                                  │
                                                  │ 1:N
                                                  │
                                                  ▼
                                    appointments_appointment (N)

users_user (1) ──────────────────────────────────┐
                                                  │
                                                  │ 1:N
                                                  │
                                                  ▼
                              users_emailverificationtoken (N)

users_user (1) ──────────────────────────────────┐
                                                  │
                                                  │ 1:N
                                                  │
                                                  ▼
                              users_passwordresettoken (N)

users_user (1) ──────────────────────────────────┐
                                                  │
                                                  │ 1:N
                                                  │
                                                  ▼
                                    users_auditlog (N)
```

### Relations détaillées

| Table parent | Table enfant | Type | Clé étrangère | On Delete |
|--------------|--------------|------|---------------|-----------|
| users_user | appointments_appointment | 1:N | patient_id | SET NULL |
| users_user | users_emailverificationtoken | 1:N | user_id | CASCADE |
| users_user | users_passwordresettoken | 1:N | user_id | CASCADE |
| users_user | users_auditlog | 1:N | user_id | SET NULL |

---

## 🔍 Indexes

### Indexes de performance

| Table | Colonne(s) | Type | Raison |
|-------|-----------|------|--------|
| users_user | email | UNIQUE | Recherche par email (login) |
| users_user | created_at | INDEX | Tri par date d'inscription |
| appointments_appointment | (date, time) | UNIQUE | Éviter doublons de créneaux |
| appointments_appointment | date | INDEX | Recherche par date |
| appointments_appointment | status | INDEX | Filtrage par statut |
| appointments_appointment | patient_email | INDEX | Recherche par email patient |
| users_auditlog | timestamp | INDEX | Tri chronologique |
| users_auditlog | action | INDEX | Filtrage par action |
| content_management_heroslide | order | INDEX | Tri par ordre |
| content_management_medicalservice | order | INDEX | Tri par ordre |

---

## ✅ Contraintes

### Contraintes d'intégrité

**1. Contraintes UNIQUE :**
- `users_user.email` - Un email par utilisateur
- `appointments_appointment.(date, time)` - Un RDV par créneau
- `appointments_appointmentslotlock.(date, time)` - Un lock par créneau
- `users_emailverificationtoken.token` - Token unique
- `users_passwordresettoken.token` - Token unique
- `content_management_clinicschedule.day_of_week` - Un horaire par jour
- `content_management_clinicholiday.date` - Un jour férié par date

**2. Contraintes CHECK :**
- `appointments_appointment.consultation_type` IN ('generale', 'specialisee')
- `appointments_appointment.status` IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')
- `users_user.gender` IN ('male', 'female', 'other')
- `content_management_clinicschedule.day_of_week` BETWEEN 0 AND 6

**3. Contraintes NOT NULL :**
- Tous les champs essentiels (email, password, date, time, etc.)

---

## 📚 Ressources

- [Architecture backend](./backend-architecture.md)
- [Guide de développement backend](../05-backend-guide/README.md)
- [Documentation sécurité](./security.md)

---

**Base de données documentée ! 🗄️**
