# 📅 API Rendez-vous - VIDA

Documentation complète des endpoints de gestion des rendez-vous.

---

## 📋 Table des matières

1. [Liste des rendez-vous](#-liste-des-rendez-vous)
2. [Créer un rendez-vous](#-créer-un-rendez-vous)
3. [Détail d'un rendez-vous](#-détail-dun-rendez-vous)
4. [Modifier un rendez-vous](#-modifier-un-rendez-vous)
5. [Annuler un rendez-vous](#-annuler-un-rendez-vous)
6. [Créneaux disponibles](#-créneaux-disponibles)
7. [Verrouiller un créneau](#-verrouiller-un-créneau)

---

## 📋 Liste des rendez-vous

### GET `/api/v1/appointments/`

Récupérer la liste des rendez-vous.

**Authentification :** Optionnelle
- **Anonyme** : Aucun rendez-vous retourné
- **Patient** : Ses propres rendez-vous uniquement
- **Staff** : Tous les rendez-vous

**Rate limiting :** 100 requêtes / heure (anonyme), 1000 / heure (authentifié)

#### Requête

**Headers :**
```
Cookie: vida_access_token=xxx (optionnel)
```

**Query Parameters :**

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| page | integer | Numéro de page | `?page=2` |
| page_size | integer | Éléments par page (max: 100) | `?page_size=20` |
| status | string | Filtrer par statut | `?status=confirmed` |
| date | date | Filtrer par date exacte | `?date=2026-02-01` |
| date_after | date | Rendez-vous après cette date | `?date_after=2026-02-01` |
| date_before | date | Rendez-vous avant cette date | `?date_before=2026-02-28` |
| consultation_type | string | Type de consultation | `?consultation_type=generale` |
| ordering | string | Tri | `?ordering=-date` |

**Valeurs possibles :**

**status :**
- `pending` - En attente de confirmation
- `confirmed` - Confirmé
- `cancelled` - Annulé
- `completed` - Terminé
- `no_show` - Patient absent

**consultation_type :**
- `generale` - Consultation générale (15 000 FCFA)
- `specialisee` - Consultation spécialisée (25 000 FCFA)

**ordering :**
- `date` - Tri croissant par date
- `-date` - Tri décroissant par date
- `created_at` - Tri par date de création
- `-created_at` - Tri décroissant par date de création

#### Réponse

**Succès (200 OK) :**

```json
{
  "count": 25,
  "next": "http://api.vida.cg/api/v1/appointments/?page=2",
  "previous": null,
  "results": [
    {
      "id": 123,
      "patient": 45,
      "patient_first_name": "Jean",
      "patient_last_name": "Dupont",
      "patient_email": "jean.dupont@example.com",
      "patient_phone": "06 123 45 67",
      "date": "2026-02-01",
      "time": "10:00:00",
      "consultation_type": "generale",
      "reason": "Contrôle de routine",
      "status": "confirmed",
      "confirmed_at": "2026-01-24T10:30:00Z",
      "cancelled_at": null,
      "cancellation_reason": null,
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:30:00Z"
    },
    {
      "id": 124,
      "patient": null,
      "patient_first_name": "Marie",
      "patient_last_name": "Martin",
      "patient_email": "marie.martin@example.com",
      "patient_phone": "06 987 65 43",
      "date": "2026-02-02",
      "time": "14:30:00",
      "consultation_type": "specialisee",
      "reason": "Examen de vue",
      "status": "pending",
      "confirmed_at": null,
      "cancelled_at": null,
      "cancellation_reason": null,
      "created_at": "2026-01-24T11:00:00Z",
      "updated_at": "2026-01-24T11:00:00Z"
    }
  ]
}
```

#### Exemples

**cURL :**

```bash
# Liste de tous les rendez-vous (authentifié)
curl -X GET http://localhost:8000/api/v1/appointments/ \
  -b cookies.txt

# Filtrer par statut
curl -X GET "http://localhost:8000/api/v1/appointments/?status=confirmed" \
  -b cookies.txt

# Filtrer par date
curl -X GET "http://localhost:8000/api/v1/appointments/?date=2026-02-01" \
  -b cookies.txt

# Rendez-vous futurs uniquement
curl -X GET "http://localhost:8000/api/v1/appointments/?date_after=2026-01-24&ordering=date" \
  -b cookies.txt
```

**JavaScript (Axios) :**

```javascript
// Liste des rendez-vous
const response = await axios.get('/api/v1/appointments/', {
  withCredentials: true,
  params: {
    status: 'confirmed',
    date_after: '2026-01-24',
    ordering: 'date'
  }
});

console.log(response.data.results);
```

---

## ➕ Créer un rendez-vous

### POST `/api/v1/appointments/`

Créer un nouveau rendez-vous.

**Authentification :** Optionnelle
- **Anonyme** : Peut créer un rendez-vous (patient non lié)
- **Authentifié** : Rendez-vous lié à l'utilisateur

**Rate limiting :** 10 requêtes / heure

#### Requête

**Headers :**
```
Content-Type: application/json
Cookie: vida_access_token=xxx (optionnel)
```

**Body :**
```json
{
  "patient_first_name": "Jean",
  "patient_last_name": "Dupont",
  "patient_email": "jean.dupont@example.com",
  "patient_phone": "06 123 45 67",
  "date": "2026-02-01",
  "time": "10:00",
  "consultation_type": "generale",
  "reason": "Contrôle de routine"
}
```

**Paramètres :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| patient_first_name | string | ✅ | Prénom du patient (max 150 caractères) |
| patient_last_name | string | ✅ | Nom du patient (max 150 caractères) |
| patient_email | string | ✅ | Email du patient |
| patient_phone | string | ✅ | Téléphone (format Congo) |
| date | date | ✅ | Date du rendez-vous (YYYY-MM-DD, future) |
| time | time | ✅ | Heure du rendez-vous (HH:MM) |
| consultation_type | string | ✅ | Type (generale, specialisee) |
| reason | string | ❌ | Motif de consultation (max 1000 caractères) |

**Validations :**

- **Date** : Doit être future
- **Créneau** : Doit être disponible (pas déjà réservé)
- **Horaires** : Doit correspondre aux horaires d'ouverture
- **Téléphone** : Format Congo (06/05/04 XXX XX XX)

#### Réponse

**Succès (201 Created) :**

```json
{
  "id": 125,
  "patient": 45,
  "patient_first_name": "Jean",
  "patient_last_name": "Dupont",
  "patient_email": "jean.dupont@example.com",
  "patient_phone": "06 123 45 67",
  "date": "2026-02-01",
  "time": "10:00:00",
  "consultation_type": "generale",
  "reason": "Contrôle de routine",
  "status": "pending",
  "confirmed_at": null,
  "cancelled_at": null,
  "cancellation_reason": null,
  "created_at": "2026-01-24T12:00:00Z",
  "updated_at": "2026-01-24T12:00:00Z"
}
```

**Un email de confirmation est envoyé automatiquement.**

**Erreur (400 Bad Request) :**

```json
{
  "date": ["La date doit être future."],
  "time": ["Ce créneau n'est pas disponible."],
  "patient_phone": ["Format invalide. Utilisez: 06 XXX XX XX"],
  "non_field_errors": ["Ce créneau est déjà réservé."]
}
```

#### Exemples

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/appointments/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "patient_first_name": "Jean",
    "patient_last_name": "Dupont",
    "patient_email": "jean.dupont@example.com",
    "patient_phone": "06 123 45 67",
    "date": "2026-02-01",
    "time": "10:00",
    "consultation_type": "generale",
    "reason": "Contrôle de routine"
  }'
```

**JavaScript (Axios) :**

```javascript
const response = await axios.post('/api/v1/appointments/', {
  patient_first_name: 'Jean',
  patient_last_name: 'Dupont',
  patient_email: 'jean.dupont@example.com',
  patient_phone: '06 123 45 67',
  date: '2026-02-01',
  time: '10:00',
  consultation_type: 'generale',
  reason: 'Contrôle de routine'
}, {
  withCredentials: true
});

console.log('Rendez-vous créé:', response.data);
```

---

## 🔍 Détail d'un rendez-vous

### GET `/api/v1/appointments/{id}/`

Récupérer les détails d'un rendez-vous spécifique.

**Authentification :** Requise

**Permissions :**
- **Patient** : Peut voir uniquement ses propres rendez-vous
- **Staff** : Peut voir tous les rendez-vous

**Rate limiting :** 1000 requêtes / heure

#### Requête

**Headers :**
```
Cookie: vida_access_token=xxx
```

**URL Parameters :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| id | integer | ID du rendez-vous |

#### Réponse

**Succès (200 OK) :**

```json
{
  "id": 123,
  "patient": 45,
  "patient_first_name": "Jean",
  "patient_last_name": "Dupont",
  "patient_email": "jean.dupont@example.com",
  "patient_phone": "06 123 45 67",
  "date": "2026-02-01",
  "time": "10:00:00",
  "consultation_type": "generale",
  "reason": "Contrôle de routine",
  "status": "confirmed",
  "confirmed_at": "2026-01-24T10:30:00Z",
  "cancelled_at": null,
  "cancellation_reason": null,
  "created_at": "2026-01-24T10:00:00Z",
  "updated_at": "2026-01-24T10:30:00Z"
}
```

**Erreur (404 Not Found) :**

```json
{
  "detail": "Non trouvé."
}
```

**Erreur (403 Forbidden) :**

```json
{
  "detail": "Vous n'avez pas la permission d'effectuer cette action."
}
```

#### Exemple

**cURL :**

```bash
curl -X GET http://localhost:8000/api/v1/appointments/123/ \
  -b cookies.txt
```

---

## ✏️ Modifier un rendez-vous

### PUT/PATCH `/api/v1/appointments/{id}/`

Modifier un rendez-vous existant.

**Authentification :** Requise

**Permissions :**
- **Patient** : Peut modifier uniquement ses propres rendez-vous (avant confirmation)
- **Staff** : Peut modifier tous les rendez-vous

**Rate limiting :** 100 requêtes / heure

#### Requête

**Headers :**
```
Content-Type: application/json
Cookie: vida_access_token=xxx
```

**Body (PATCH - champs partiels) :**
```json
{
  "date": "2026-02-02",
  "time": "14:00",
  "reason": "Nouveau motif"
}
```

#### Réponse

**Succès (200 OK) :**

```json
{
  "id": 123,
  "date": "2026-02-02",
  "time": "14:00:00",
  "reason": "Nouveau motif",
  "updated_at": "2026-01-24T13:00:00Z"
}
```

**Erreur (400 Bad Request) :**

```json
{
  "non_field_errors": ["Impossible de modifier un rendez-vous confirmé."]
}
```

#### Exemple

**cURL :**

```bash
curl -X PATCH http://localhost:8000/api/v1/appointments/123/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "date": "2026-02-02",
    "time": "14:00"
  }'
```

---

## ❌ Annuler un rendez-vous

### POST `/api/v1/appointments/{id}/cancel/`

Annuler un rendez-vous.

**Authentification :** Requise

**Permissions :**
- **Patient** : Peut annuler ses propres rendez-vous
- **Staff** : Peut annuler tous les rendez-vous

**Rate limiting :** 100 requêtes / heure

#### Requête

**Headers :**
```
Content-Type: application/json
Cookie: vida_access_token=xxx
```

**Body :**
```json
{
  "reason": "Empêchement personnel"
}
```

**Paramètres :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| reason | string | ❌ | Raison de l'annulation |

#### Réponse

**Succès (200 OK) :**

```json
{
  "message": "Rendez-vous annulé avec succès",
  "appointment": {
    "id": 123,
    "status": "cancelled",
    "cancelled_at": "2026-01-24T14:00:00Z",
    "cancellation_reason": "Empêchement personnel"
  }
}
```

**Un email d'annulation est envoyé automatiquement.**

**Erreur (400 Bad Request) :**

```json
{
  "detail": "Ce rendez-vous est déjà annulé."
}
```

```json
{
  "detail": "Impossible d'annuler un rendez-vous passé."
}
```

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/appointments/123/cancel/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "reason": "Empêchement personnel"
  }'
```

**JavaScript (Axios) :**

```javascript
await axios.post(`/api/v1/appointments/${appointmentId}/cancel/`, {
  reason: 'Empêchement personnel'
}, {
  withCredentials: true
});
```

---

## 📅 Créneaux disponibles

### GET `/api/v1/appointments/slots/`

Récupérer les créneaux horaires disponibles pour une date donnée.

**Authentification :** Non requise

**Rate limiting :** 100 requêtes / heure

#### Requête

**Query Parameters :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| date | date | ✅ | Date (YYYY-MM-DD) |

#### Réponse

**Succès (200 OK) :**

```json
{
  "date": "2026-02-01",
  "day_of_week": 5,
  "is_open": true,
  "slots": [
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30"
  ],
  "unavailable_slots": [
    "10:00",
    "14:30"
  ]
}
```

**Erreur (400 Bad Request) :**

```json
{
  "date": ["Ce champ est requis."]
}
```

```json
{
  "detail": "La clinique est fermée ce jour."
}
```

#### Exemple

**cURL :**

```bash
curl -X GET "http://localhost:8000/api/v1/appointments/slots/?date=2026-02-01"
```

**JavaScript (Axios) :**

```javascript
const response = await axios.get('/api/v1/appointments/slots/', {
  params: { date: '2026-02-01' }
});

console.log('Créneaux disponibles:', response.data.slots);
```

---

## 🔒 Verrouiller un créneau

### POST `/api/v1/appointments/lock-slot/`

Verrouiller temporairement un créneau (10 minutes) pendant la réservation.

**Authentification :** Non requise

**Rate limiting :** 100 requêtes / heure

#### Requête

**Headers :**
```
Content-Type: application/json
```

**Body :**
```json
{
  "date": "2026-02-01",
  "time": "10:00"
}
```

#### Réponse

**Succès (200 OK) :**

```json
{
  "message": "Créneau verrouillé",
  "expires_at": "2026-01-24T10:40:00Z"
}
```

**Erreur (409 Conflict) :**

```json
{
  "detail": "Ce créneau est déjà verrouillé ou réservé."
}
```

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/appointments/lock-slot/ \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-01",
    "time": "10:00"
  }'
```

---

### DELETE `/api/v1/appointments/lock-slot/`

Déverrouiller un créneau (annuler la réservation en cours).

**Authentification :** Non requise

**Rate limiting :** 100 requêtes / heure

#### Requête

**Headers :**
```
Content-Type: application/json
```

**Body :**
```json
{
  "date": "2026-02-01",
  "time": "10:00"
}
```

#### Réponse

**Succès (200 OK) :**

```json
{
  "message": "Créneau déverrouillé"
}
```

#### Exemple

**cURL :**

```bash
curl -X DELETE http://localhost:8000/api/v1/appointments/lock-slot/ \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-01",
    "time": "10:00"
  }'
```

---

## 📚 Ressources

- [Documentation API](./README.md)
- [Authentification](./authentication.md)
- [Exemples](./examples.md)

---

**Rendez-vous documentés ! 📅**
