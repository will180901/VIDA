# 📝 API Gestion du contenu - VIDA

Documentation des endpoints de gestion du contenu du site.

---

## 📋 Endpoints disponibles

1. [Paramètres de la clinique](#-paramètres-de-la-clinique)
2. [Slides Hero](#-slides-hero)
3. [Services médicaux](#-services-médicaux)
4. [Horaires d'ouverture](#-horaires-douverture)
5. [Jours fériés](#-jours-fériés)
6. [Messages de contact](#-messages-de-contact)

---

## 🏥 Paramètres de la clinique

### GET `/api/v1/content/clinic-settings/`

Récupérer les paramètres de la clinique (singleton).

**Authentification :** Non requise  
**Rate limiting :** 100 requêtes / heure  
**Cache :** 1 heure

#### Réponse (200 OK)

```json
{
  "id": 1,
  "name": "Centre Médical VIDA",
  "address": "08 Bis rue Mboko, Moungali\nBrazzaville, Congo",
  "phone_primary": "06 569 12 35",
  "phone_secondary": "05 745 36 88",
  "whatsapp": "+242066934735",
  "email": "centremedvida@gmail.com",
  "fee_general": "15000.00",
  "fee_specialized": "25000.00",
  "opening_hours": {
    "lun-ven": "08h30 - 17h00",
    "pause": "12h30 - 14h00",
    "sam": "08h00 - 12h30",
    "dim": "Fermé"
  },
  "about_text": "Centre ophtalmologique situé à Brazzaville...",
  "rccm": "B13-0506",
  "niu": "M2300009961883",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-24T10:00:00Z"
}
```

#### Exemple

```bash
curl -X GET http://localhost:8000/api/v1/content/clinic-settings/
```

---

## 🎯 Slides Hero

### GET `/api/v1/content/hero-slides/`

Récupérer les slides du carousel de la page d'accueil.

**Authentification :** Non requise  
**Rate limiting :** 100 requêtes / heure  
**Cache :** 1 heure

#### Réponse (200 OK)

```json
[
  {
    "id": 1,
    "title": "Votre Vue Mérite une Attention Sérieuse",
    "subtitle": "Centre ophtalmologique moderne à Brazzaville. Équipement professionnel, soins de qualité.",
    "image": "/media/hero/hero-1-vision.jpg",
    "order": 1,
    "is_active": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "title": "Examens Complets et Diagnostics Précis",
    "subtitle": "Dépistage des maladies oculaires. Équipements adaptés pour des résultats fiables.",
    "image": "/media/hero/hero-2-technology.png",
    "order": 2,
    "is_active": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
]
```

#### Exemple

```bash
curl -X GET http://localhost:8000/api/v1/content/hero-slides/
```

---

## 🏥 Services médicaux

### GET `/api/v1/content/services/`

Récupérer la liste des services médicaux proposés.

**Authentification :** Non requise  
**Rate limiting :** 100 requêtes / heure  
**Cache :** 1 heure

#### Réponse (200 OK)

```json
[
  {
    "id": 1,
    "title": "Consultations",
    "description": "Examens de vue complets, dépistage glaucome et cataracte",
    "details": "Nos ophtalmologues réalisent des examens complets de la vue incluant le dépistage du glaucome, de la cataracte et d'autres pathologies oculaires. Consultation sur rendez-vous du lundi au samedi.",
    "image": "/media/services/consultation.png",
    "icon_name": "stethoscope",
    "order": 1,
    "is_active": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "title": "Dépistage",
    "description": "Détection précoce des maladies oculaires (diabète, DMLA)",
    "details": "Dépistage précoce des maladies oculaires liées au diabète, à l'hypertension et à l'âge (DMLA). Un diagnostic précoce permet une meilleure prise en charge.",
    "image": "/media/services/depistage.png",
    "icon_name": "search",
    "order": 2,
    "is_active": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
]
```

#### Exemple

```bash
curl -X GET http://localhost:8000/api/v1/content/services/
```

---

## ⏰ Horaires d'ouverture

### GET `/api/v1/content/schedules/`

Récupérer les horaires d'ouverture par jour de la semaine.

**Authentification :** Non requise  
**Rate limiting :** 100 requêtes / heure  
**Cache :** 1 heure

#### Réponse (200 OK)

```json
[
  {
    "id": 1,
    "day_of_week": 0,
    "day_name": "Lundi",
    "is_open": true,
    "morning_start": "08:30:00",
    "morning_end": "12:00:00",
    "afternoon_start": "14:00:00",
    "afternoon_end": "17:00:00",
    "slot_duration": 30
  },
  {
    "id": 7,
    "day_of_week": 6,
    "day_name": "Dimanche",
    "is_open": false,
    "morning_start": null,
    "morning_end": null,
    "afternoon_start": null,
    "afternoon_end": null,
    "slot_duration": 30
  }
]
```

#### Exemple

```bash
curl -X GET http://localhost:8000/api/v1/content/schedules/
```

---

## 🎉 Jours fériés

### GET `/api/v1/content/holidays/`

Récupérer la liste des jours fériés et fermetures exceptionnelles.

**Authentification :** Non requise  
**Rate limiting :** 100 requêtes / heure  
**Cache :** 1 heure

#### Query Parameters

| Paramètre | Type | Description |
|-----------|------|-------------|
| year | integer | Filtrer par année |
| month | integer | Filtrer par mois |

#### Réponse (200 OK)

```json
[
  {
    "id": 1,
    "date": "2026-01-01",
    "name": "Jour de l'An",
    "is_recurring": true
  },
  {
    "id": 2,
    "date": "2026-05-01",
    "name": "Fête du Travail",
    "is_recurring": true
  },
  {
    "id": 3,
    "date": "2026-08-15",
    "name": "Fête Nationale",
    "is_recurring": true
  }
]
```

#### Exemple

```bash
# Tous les jours fériés
curl -X GET http://localhost:8000/api/v1/content/holidays/

# Jours fériés de 2026
curl -X GET "http://localhost:8000/api/v1/content/holidays/?year=2026"
```

---

## 📧 Messages de contact

### POST `/api/v1/content/contact/`

Envoyer un message via le formulaire de contact.

**Authentification :** Non requise  
**Rate limiting :** 10 requêtes / heure

#### Requête

**Headers :**
```
Content-Type: application/json
```

**Body :**
```json
{
  "name": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "phone": "06 123 45 67",
  "subject": "Demande de renseignements",
  "message": "Bonjour, je souhaiterais obtenir des informations sur vos services."
}
```

**Paramètres :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| name | string | ✅ | Nom complet (max 255 caractères) |
| email | string | ✅ | Email |
| phone | string | ❌ | Téléphone |
| subject | string | ❌ | Sujet (max 255 caractères) |
| message | string | ✅ | Message (max 5000 caractères) |

#### Réponse

**Succès (201 Created) :**

```json
{
  "id": 42,
  "name": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "phone": "06 123 45 67",
  "subject": "Demande de renseignements",
  "message": "Bonjour, je souhaiterais obtenir des informations sur vos services.",
  "is_read": false,
  "replied_at": null,
  "created_at": "2026-01-24T15:00:00Z"
}
```

**Erreur (400 Bad Request) :**

```json
{
  "name": ["Ce champ est requis."],
  "email": ["Saisissez une adresse e-mail valide."],
  "message": ["Ce champ est requis."]
}
```

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/content/contact/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "phone": "06 123 45 67",
    "subject": "Demande de renseignements",
    "message": "Bonjour, je souhaiterais obtenir des informations sur vos services."
  }'
```

**JavaScript (Axios) :**

```javascript
const response = await axios.post('/api/v1/content/contact/', {
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  phone: '06 123 45 67',
  subject: 'Demande de renseignements',
  message: 'Bonjour, je souhaiterais obtenir des informations sur vos services.'
});

console.log('Message envoyé:', response.data);
```

---

## 📚 Ressources

- [Documentation API](./README.md)
- [Authentification](./authentication.md)
- [Rendez-vous](./appointments.md)
- [Exemples](./examples.md)

---

**Contenu documenté ! 📝**
