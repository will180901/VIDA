# 🔌 Documentation API - VIDA

Documentation complète de l'API REST du projet VIDA.

---

## 📋 Table des matières

1. **[Authentification](./authentication.md)** - Endpoints d'authentification
2. **[Rendez-vous](./appointments.md)** - Gestion des rendez-vous
3. **[Gestion du contenu](./content-management.md)** - Contenu du site
4. **[Exemples d'utilisation](./examples.md)** - Exemples pratiques

---

## 🎯 Vue d'ensemble

### URL de base

| Environnement | URL |
|---------------|-----|
| **Development** | http://localhost:8000/api/v1 |
| **Staging** | https://api-staging.vida.cg/api/v1 |
| **Production** | https://api.vida.cg/api/v1 |

### Versioning

L'API utilise le versioning dans l'URL : `/api/v1/`

**Versions disponibles :**
- `v1` - Version actuelle (stable)

---

## 🔐 Authentification

### Méthode

L'API utilise **JWT (JSON Web Tokens)** stockés dans des **cookies httpOnly**.

**Avantages :**
- ✅ Protection contre XSS
- ✅ Envoi automatique des cookies
- ✅ Pas de gestion manuelle des tokens

### Obtenir un token

```bash
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "MotDePasse123!Secure",
  "captcha": "hcaptcha_token_here"
}
```

**Réponse :**

```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "email": "patient@example.com"
  }
}
```

Les tokens sont automatiquement stockés dans les cookies :
- `vida_access_token` (60 min)
- `vida_refresh_token` (7 jours)

### Utiliser un token

Les cookies sont envoyés automatiquement avec chaque requête :

```bash
GET /api/v1/appointments/
Cookie: vida_access_token=xxx; vida_refresh_token=yyy
```

**Avec curl :**

```bash
curl -X GET http://localhost:8000/api/v1/appointments/ \
  --cookie "vida_access_token=xxx; vida_refresh_token=yyy"
```

**Avec Axios (JavaScript) :**

```javascript
axios.get('/api/v1/appointments/', {
  withCredentials: true  // Envoyer les cookies
});
```

---

## 📊 Format des réponses

### Succès (200, 201)

**Objet unique :**

```json
{
  "id": 123,
  "field1": "value1",
  "field2": "value2",
  "created_at": "2026-01-24T10:30:00Z"
}
```

**Liste paginée :**

```json
{
  "count": 50,
  "next": "http://api.vida.cg/api/v1/appointments/?page=2",
  "previous": null,
  "results": [
    {"id": 1, "...": "..."},
    {"id": 2, "...": "..."}
  ]
}
```

### Erreur de validation (400)

```json
{
  "field1": ["Ce champ est requis."],
  "field2": ["Format invalide."],
  "non_field_errors": ["Erreur globale."]
}
```

### Erreur d'authentification (401)

```json
{
  "detail": "Identifiants invalides."
}
```

### Erreur de permission (403)

```json
{
  "detail": "Vous n'avez pas la permission d'effectuer cette action."
}
```

### Ressource non trouvée (404)

```json
{
  "detail": "Non trouvé."
}
```

### Rate limiting (429)

```json
{
  "detail": "Trop de requêtes. Réessayez dans 15 minutes."
}
```

### Erreur serveur (500)

```json
{
  "detail": "Erreur interne du serveur."
}
```

---

## 🔄 Pagination

### Paramètres

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `page` | integer | 1 | Numéro de page |
| `page_size` | integer | 20 | Nombre d'éléments par page (max: 100) |

### Exemple

```bash
GET /api/v1/appointments/?page=2&page_size=10
```

**Réponse :**

```json
{
  "count": 50,
  "next": "http://api.vida.cg/api/v1/appointments/?page=3&page_size=10",
  "previous": "http://api.vida.cg/api/v1/appointments/?page=1&page_size=10",
  "results": [...]
}
```

---

## 🔍 Filtrage

### Paramètres de filtrage

Les endpoints supportent différents paramètres de filtrage :

**Rendez-vous :**

```bash
GET /api/v1/appointments/?status=confirmed&date=2026-02-01
```

**Paramètres disponibles :**
- `status` - Filtrer par statut (pending, confirmed, cancelled, completed, no_show)
- `date` - Filtrer par date (format: YYYY-MM-DD)
- `date_after` - Rendez-vous après cette date
- `date_before` - Rendez-vous avant cette date
- `consultation_type` - Type de consultation (generale, specialisee)

---

## 📝 Tri

### Paramètre ordering

```bash
GET /api/v1/appointments/?ordering=-created_at
```

**Valeurs possibles :**
- `created_at` - Tri croissant par date de création
- `-created_at` - Tri décroissant par date de création
- `date` - Tri par date de rendez-vous
- `-date` - Tri décroissant par date de rendez-vous

---

## 🚦 Rate Limiting

### Limites par défaut

| Type d'utilisateur | Limite | Période |
|-------------------|--------|---------|
| **Anonyme** | 100 requêtes | 1 heure |
| **Authentifié** | 1000 requêtes | 1 heure |
| **Login** | 5 tentatives | 15 minutes |

### Headers de réponse

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706097600
```

### Dépassement de limite

**Réponse 429 :**

```json
{
  "detail": "Trop de requêtes. Réessayez dans 15 minutes."
}
```

---

## 📚 Documentation interactive

### Swagger UI

Interface interactive pour tester l'API :

**URL :** http://localhost:8000/api/schema/swagger-ui/

**Fonctionnalités :**
- ✅ Tester les endpoints directement
- ✅ Voir les schémas de requête/réponse
- ✅ Authentification intégrée
- ✅ Exemples de code

### ReDoc

Documentation alternative plus lisible :

**URL :** http://localhost:8000/api/schema/redoc/

**Fonctionnalités :**
- ✅ Navigation claire
- ✅ Recherche intégrée
- ✅ Export en PDF
- ✅ Responsive

### OpenAPI Schema

Schéma OpenAPI 3.0 au format JSON :

**URL :** http://localhost:8000/api/schema/

**Utilisation :**
- Import dans Postman
- Génération de clients API
- Documentation automatique

---

## 🛠️ Outils recommandés

### Postman

**Collection Postman :**

Télécharger : `docs/postman/VIDA_API.postman_collection.json`

**Variables d'environnement :**

```json
{
  "base_url": "http://localhost:8000",
  "api_url": "http://localhost:8000/api/v1",
  "access_token": "",
  "refresh_token": ""
}
```

### cURL

**Exemples de base :**

```bash
# GET
curl -X GET http://localhost:8000/api/v1/appointments/

# POST
curl -X POST http://localhost:8000/api/v1/appointments/ \
  -H "Content-Type: application/json" \
  -d '{"patient_first_name":"Jean","patient_last_name":"Dupont",...}'

# Avec authentification
curl -X GET http://localhost:8000/api/v1/appointments/ \
  --cookie "vida_access_token=xxx"
```

### HTTPie

**Alternative à cURL (plus lisible) :**

```bash
# Installation
pip install httpie

# GET
http GET http://localhost:8000/api/v1/appointments/

# POST
http POST http://localhost:8000/api/v1/appointments/ \
  patient_first_name=Jean \
  patient_last_name=Dupont
```

---

## 📖 Endpoints disponibles

### Authentification

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/auth/register/` | POST | Inscription |
| `/auth/login/` | POST | Connexion |
| `/auth/logout/` | POST | Déconnexion |
| `/auth/refresh/` | POST | Refresh token |
| `/auth/profile/` | GET, PUT, PATCH | Profil utilisateur |
| `/auth/change-password/` | POST | Changer mot de passe |
| `/auth/password-reset/` | POST | Demander reset |
| `/auth/password-reset-confirm/` | POST | Confirmer reset |
| `/auth/verify-email/` | POST | Vérifier email |

**Détails :** [Documentation authentification](./authentication.md)

### Rendez-vous

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/appointments/` | GET, POST | Liste/Créer RDV |
| `/appointments/{id}/` | GET, PUT, PATCH, DELETE | Détail RDV |
| `/appointments/{id}/cancel/` | POST | Annuler RDV |
| `/appointments/slots/` | GET | Créneaux disponibles |
| `/appointments/lock-slot/` | POST, DELETE | Verrouiller créneau |

**Détails :** [Documentation rendez-vous](./appointments.md)

### Contenu

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/content/clinic-settings/` | GET | Paramètres clinique |
| `/content/hero-slides/` | GET | Slides hero |
| `/content/services/` | GET | Services médicaux |
| `/content/schedules/` | GET | Horaires |
| `/content/holidays/` | GET | Jours fériés |
| `/content/contact/` | POST | Envoyer message |

**Détails :** [Documentation contenu](./content-management.md)

---

## 🔒 Sécurité

### HTTPS

**Production :** HTTPS obligatoire

```bash
# ✅ Correct
https://api.vida.cg/api/v1/appointments/

# ❌ Incorrect (redirigé vers HTTPS)
http://api.vida.cg/api/v1/appointments/
```

### CORS

**Origines autorisées :**
- `https://vida.cg`
- `https://www.vida.cg`
- `http://localhost:3000` (dev)

**Headers CORS :**

```
Access-Control-Allow-Origin: https://vida.cg
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### CSRF

**Protection CSRF :** Activée pour les requêtes modifiant l'état (POST, PUT, PATCH, DELETE)

**Avec cookies :** CSRF token automatique via cookies SameSite

---

## 📊 Codes de statut HTTP

| Code | Signification | Utilisation |
|------|---------------|-------------|
| **200** | OK | Requête réussie (GET, PUT, PATCH) |
| **201** | Created | Ressource créée (POST) |
| **204** | No Content | Suppression réussie (DELETE) |
| **400** | Bad Request | Données invalides |
| **401** | Unauthorized | Non authentifié |
| **403** | Forbidden | Pas de permission |
| **404** | Not Found | Ressource non trouvée |
| **429** | Too Many Requests | Rate limit dépassé |
| **500** | Internal Server Error | Erreur serveur |

---

## 🧪 Tests

### Tester l'API

**1. Vérifier que l'API est accessible :**

```bash
curl http://localhost:8000/api/v1/
```

**2. Tester l'authentification :**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","captcha":"test"}'
```

**3. Tester un endpoint protégé :**

```bash
curl -X GET http://localhost:8000/api/v1/appointments/ \
  --cookie "vida_access_token=xxx"
```

---

## 📚 Ressources

- **[Authentification](./authentication.md)** - Endpoints d'authentification détaillés
- **[Rendez-vous](./appointments.md)** - Gestion des rendez-vous
- **[Contenu](./content-management.md)** - Gestion du contenu
- **[Exemples](./examples.md)** - Exemples pratiques avec code

---

## 🆘 Support

- 📖 [Architecture backend](../02-architecture/backend-architecture.md)
- 💬 [Forum de discussion](https://github.com/your-repo/vida/discussions)
- 🐛 [Signaler un bug](https://github.com/your-repo/vida/issues)

---

**API documentée ! 🔌**
