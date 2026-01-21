# 🔐 API Authentification - VIDA

Documentation complète des endpoints d'authentification.

---

## 📋 Table des matières

1. [Inscription](#-inscription)
2. [Connexion](#-connexion)
3. [Déconnexion](#-déconnexion)
4. [Refresh Token](#-refresh-token)
5. [Profil utilisateur](#-profil-utilisateur)
6. [Changement de mot de passe](#-changement-de-mot-de-passe)
7. [Réinitialisation de mot de passe](#-réinitialisation-de-mot-de-passe)
8. [Vérification d'email](#-vérification-demail)

---

## 📝 Inscription

### POST `/api/v1/auth/register/`

Créer un nouveau compte utilisateur.

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
  "email": "patient@example.com",
  "password": "MotDePasse123!Secure",
  "password_confirm": "MotDePasse123!Secure",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "06 123 45 67",
  "captcha": "hcaptcha_token_here"
}
```

**Paramètres :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| email | string | ✅ | Email (identifiant unique) |
| password | string | ✅ | Mot de passe (min 12 caractères) |
| password_confirm | string | ✅ | Confirmation du mot de passe |
| first_name | string | ✅ | Prénom (max 150 caractères) |
| last_name | string | ✅ | Nom (max 150 caractères) |
| phone | string | ✅ | Téléphone (format Congo: 06/05/04 XXX XX XX) |
| captcha | string | ✅ | Token hCaptcha |

**Règles de validation :**

**Mot de passe :**
- Minimum 12 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial (!@#$%^&*(),.?":{}|<>)

**Email :**
- Format valide
- Unique (pas déjà utilisé)

**Téléphone :**
- Format Congo : `06 XXX XX XX`, `05 XXX XX XX`, ou `04 XXX XX XX`

#### Réponse

**Succès (201 Created) :**

```json
{
  "message": "Inscription réussie. Vérifiez votre email.",
  "user": {
    "id": 123,
    "email": "patient@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "06 123 45 67",
    "email_verified": false,
    "created_at": "2026-01-24T10:30:00Z"
  }
}
```

**Cookies définis :**
- `vida_access_token` (HttpOnly, Secure, SameSite=Lax, 60 min)
- `vida_refresh_token` (HttpOnly, Secure, SameSite=Lax, 7 jours)

**Erreur (400 Bad Request) :**

```json
{
  "email": ["Un utilisateur avec cet email existe déjà."],
  "password": ["Le mot de passe doit contenir au moins 12 caractères."],
  "phone": ["Format invalide. Utilisez: 06 XXX XX XX"],
  "captcha": ["CAPTCHA invalide."]
}
```

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "MotDePasse123!Secure",
    "password_confirm": "MotDePasse123!Secure",
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "06 123 45 67",
    "captcha": "hcaptcha_token"
  }'
```

**JavaScript (Axios) :**

```javascript
const response = await axios.post('/api/v1/auth/register/', {
  email: 'patient@example.com',
  password: 'MotDePasse123!Secure',
  password_confirm: 'MotDePasse123!Secure',
  first_name: 'Jean',
  last_name: 'Dupont',
  phone: '06 123 45 67',
  captcha: hcaptchaToken
}, {
  withCredentials: true  // Important pour les cookies
});
```

**Python (requests) :**

```python
import requests

response = requests.post('http://localhost:8000/api/v1/auth/register/', json={
    'email': 'patient@example.com',
    'password': 'MotDePasse123!Secure',
    'password_confirm': 'MotDePasse123!Secure',
    'first_name': 'Jean',
    'last_name': 'Dupont',
    'phone': '06 123 45 67',
    'captcha': 'hcaptcha_token'
})
```

---

## 🔓 Connexion

### POST `/api/v1/auth/login/`

Se connecter avec email et mot de passe.

**Authentification :** Non requise

**Rate limiting :** 5 tentatives / 15 minutes

#### Requête

**Headers :**
```
Content-Type: application/json
```

**Body :**
```json
{
  "email": "patient@example.com",
  "password": "MotDePasse123!Secure",
  "captcha": "hcaptcha_token_here"
}
```

**Paramètres :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| email | string | ✅ | Email de l'utilisateur |
| password | string | ✅ | Mot de passe |
| captcha | string | ✅ | Token hCaptcha |

#### Réponse

**Succès (200 OK) :**

```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 123,
    "email": "patient@example.com"
  }
}
```

**Cookies définis :**
- `vida_access_token` (HttpOnly, Secure, SameSite=Lax, 60 min)
- `vida_refresh_token` (HttpOnly, Secure, SameSite=Lax, 7 jours)

**Erreur (401 Unauthorized) :**

```json
{
  "detail": "Identifiants invalides."
}
```

**Erreur (400 Bad Request) :**

```json
{
  "captcha": ["CAPTCHA invalide."]
}
```

**Erreur (429 Too Many Requests) :**

```json
{
  "detail": "Trop de tentatives. Réessayez dans 15 minutes."
}
```

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "patient@example.com",
    "password": "MotDePasse123!Secure",
    "captcha": "hcaptcha_token"
  }'
```

**JavaScript (Axios) :**

```javascript
const response = await axios.post('/api/v1/auth/login/', {
  email: 'patient@example.com',
  password: 'MotDePasse123!Secure',
  captcha: hcaptchaToken
}, {
  withCredentials: true
});

// Les cookies sont automatiquement stockés
console.log(response.data.user);
```

---

## 🚪 Déconnexion

### POST `/api/v1/auth/logout/`

Se déconnecter et invalider les tokens.

**Authentification :** Requise

**Rate limiting :** 100 requêtes / heure

#### Requête

**Headers :**
```
Cookie: vida_access_token=xxx; vida_refresh_token=yyy
```

**Body :** Aucun

#### Réponse

**Succès (200 OK) :**

```json
{
  "message": "Déconnexion réussie"
}
```

**Cookies supprimés :**
- `vida_access_token`
- `vida_refresh_token`

**Le refresh token est ajouté à la blacklist.**

**Erreur (401 Unauthorized) :**

```json
{
  "detail": "Identifiants d'authentification non fournis."
}
```

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout/ \
  -b cookies.txt
```

**JavaScript (Axios) :**

```javascript
await axios.post('/api/v1/auth/logout/', {}, {
  withCredentials: true
});

// Les cookies sont automatiquement supprimés
```

---

## 🔄 Refresh Token

### POST `/api/v1/auth/refresh/`

Obtenir un nouveau access token avec le refresh token.

**Authentification :** Refresh token requis

**Rate limiting :** 100 requêtes / heure

#### Requête

**Headers :**
```
Cookie: vida_refresh_token=yyy
```

**Body :** Aucun

#### Réponse

**Succès (200 OK) :**

```json
{
  "message": "Token rafraîchi"
}
```

**Cookies mis à jour :**
- `vida_access_token` (nouveau token, 60 min)
- `vida_refresh_token` (nouveau token si rotation activée, 7 jours)

**L'ancien refresh token est blacklisté.**

**Erreur (401 Unauthorized) :**

```json
{
  "detail": "Refresh token manquant"
}
```

```json
{
  "detail": "Token invalide ou expiré"
}
```

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh/ \
  -b cookies.txt \
  -c cookies.txt
```

**JavaScript (Axios) :**

```javascript
// Axios interceptor pour refresh automatique
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        await axios.post('/api/v1/auth/refresh/', {}, {
          withCredentials: true
        });
        // Réessayer la requête originale
        return axios.request(error.config);
      } catch {
        // Refresh échoué → rediriger vers login
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 👤 Profil utilisateur

### GET `/api/v1/auth/profile/`

Récupérer le profil de l'utilisateur connecté.

**Authentification :** Requise

**Rate limiting :** 1000 requêtes / heure

#### Requête

**Headers :**
```
Cookie: vida_access_token=xxx
```

#### Réponse

**Succès (200 OK) :**

```json
{
  "id": 123,
  "email": "patient@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "06 123 45 67",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "address": "123 Rue Example, Brazzaville",
  "avatar": "/media/avatars/user_123.jpg",
  "emergency_contact": "Marie Dupont",
  "emergency_phone": "06 987 65 43",
  "email_verified": true,
  "created_at": "2026-01-24T10:30:00Z",
  "updated_at": "2026-01-24T10:30:00Z"
}
```

#### Exemple

**cURL :**

```bash
curl -X GET http://localhost:8000/api/v1/auth/profile/ \
  -b cookies.txt
```

---

### PUT/PATCH `/api/v1/auth/profile/`

Modifier le profil de l'utilisateur connecté.

**Authentification :** Requise

**Rate limiting :** 1000 requêtes / heure

#### Requête

**Headers :**
```
Content-Type: application/json
Cookie: vida_access_token=xxx
```

**Body (PUT - tous les champs requis) :**
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "06 123 45 67",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "address": "123 Rue Example, Brazzaville",
  "emergency_contact": "Marie Dupont",
  "emergency_phone": "06 987 65 43"
}
```

**Body (PATCH - champs partiels) :**
```json
{
  "phone": "06 999 88 77",
  "address": "Nouvelle adresse"
}
```

**Paramètres :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| first_name | string | PUT: ✅ | Prénom |
| last_name | string | PUT: ✅ | Nom |
| phone | string | PUT: ✅ | Téléphone |
| date_of_birth | date | ❌ | Date de naissance (YYYY-MM-DD) |
| gender | string | ❌ | Genre (male, female, other) |
| address | string | ❌ | Adresse complète |
| emergency_contact | string | ❌ | Contact d'urgence |
| emergency_phone | string | ❌ | Téléphone d'urgence |

#### Réponse

**Succès (200 OK) :**

```json
{
  "id": 123,
  "email": "patient@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "06 999 88 77",
  "address": "Nouvelle adresse",
  "updated_at": "2026-01-24T11:00:00Z"
}
```

#### Exemple

**cURL :**

```bash
curl -X PATCH http://localhost:8000/api/v1/auth/profile/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "phone": "06 999 88 77",
    "address": "Nouvelle adresse"
  }'
```

---

## 🔑 Changement de mot de passe

### POST `/api/v1/auth/change-password/`

Changer le mot de passe de l'utilisateur connecté.

**Authentification :** Requise

**Rate limiting :** 10 requêtes / heure

#### Requête

**Headers :**
```
Content-Type: application/json
Cookie: vida_access_token=xxx
```

**Body :**
```json
{
  "old_password": "AncienMotDePasse123!",
  "new_password": "NouveauMotDePasse456!Secure",
  "new_password_confirm": "NouveauMotDePasse456!Secure"
}
```

**Paramètres :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| old_password | string | ✅ | Ancien mot de passe |
| new_password | string | ✅ | Nouveau mot de passe (min 12 caractères) |
| new_password_confirm | string | ✅ | Confirmation du nouveau mot de passe |

#### Réponse

**Succès (200 OK) :**

```json
{
  "message": "Mot de passe modifié avec succès."
}
```

**Erreur (400 Bad Request) :**

```json
{
  "old_password": ["Mot de passe incorrect."]
}
```

```json
{
  "new_password": ["Le mot de passe doit contenir au moins 12 caractères."]
}
```

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/auth/change-password/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "old_password": "AncienMotDePasse123!",
    "new_password": "NouveauMotDePasse456!Secure",
    "new_password_confirm": "NouveauMotDePasse456!Secure"
  }'
```

---

## 🔓 Réinitialisation de mot de passe

### POST `/api/v1/auth/password-reset/`

Demander un lien de réinitialisation de mot de passe.

**Authentification :** Non requise

**Rate limiting :** 3 requêtes / heure

#### Requête

**Headers :**
```
Content-Type: application/json
```

**Body :**
```json
{
  "email": "patient@example.com"
}
```

#### Réponse

**Succès (200 OK) :**

```json
{
  "message": "Si cet email existe, vous recevrez un lien de réinitialisation."
}
```

**Note :** Le message est identique que l'email existe ou non (protection contre l'énumération d'utilisateurs).

**Un email est envoyé avec un lien valide 1 heure.**

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com"
  }'
```

---

### POST `/api/v1/auth/password-reset-confirm/`

Confirmer la réinitialisation avec le token reçu par email.

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
  "token": "reset_token_from_email",
  "new_password": "NouveauMotDePasse456!Secure",
  "new_password_confirm": "NouveauMotDePasse456!Secure"
}
```

**Paramètres :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| token | string | ✅ | Token reçu par email |
| new_password | string | ✅ | Nouveau mot de passe |
| new_password_confirm | string | ✅ | Confirmation |

#### Réponse

**Succès (200 OK) :**

```json
{
  "message": "Mot de passe réinitialisé avec succès."
}
```

**Erreur (400 Bad Request) :**

```json
{
  "token": ["Token invalide ou expiré."]
}
```

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/auth/password-reset-confirm/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123xyz789",
    "new_password": "NouveauMotDePasse456!Secure",
    "new_password_confirm": "NouveauMotDePasse456!Secure"
  }'
```

---

## ✉️ Vérification d'email

### POST `/api/v1/auth/verify-email/`

Vérifier l'adresse email avec le token reçu.

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
  "token": "verification_token_from_email"
}
```

#### Réponse

**Succès (200 OK) :**

```json
{
  "message": "Email vérifié avec succès."
}
```

**Un email de bienvenue est envoyé.**

**Erreur (400 Bad Request) :**

```json
{
  "token": ["Token invalide ou expiré."]
}
```

#### Exemple

**cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-email/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification_token_123"
  }'
```

---

## 📚 Ressources

- [Documentation API](./README.md)
- [Rendez-vous](./appointments.md)
- [Exemples](./examples.md)
- [Architecture sécurité](../02-architecture/security.md)

---

**Authentification documentée ! 🔐**
