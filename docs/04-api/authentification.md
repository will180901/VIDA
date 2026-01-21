# API - Authentification

## Endpoints

### Inscription
```
POST /auth/register/
```

**Corps de la requête :**
```json
{
    "email": "user@example.com",
    "password": "MotDePasse123!",
    "password_confirm": "MotDePasse123!",
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "+242012345678",
    "hcaptcha_token": "token_hcaptcha"
}
```

**Réponse :**
```json
{
    "message": "Compte créé. Vérifiez votre email.",
    "user_id": 1
}
```

### Connexion
```
POST /auth/login/
```

**Corps de la requête :**
```json
{
    "email": "user@example.com",
    "password": "MotDePasse123!",
    "hcaptcha_token": "token_hcaptcha"
}
```

**Réponse :**
```json
{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "patient"
    }
}
```

### Rafraîchir le Token
```
POST /auth/token/refresh/
```

**Corps de la requête :**
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Déconnexion
```
POST /auth/logout/
```

**Headers :**
```
Authorization: Bearer <access_token>
```

### Demande de Reset Mot de Passe
```
POST /auth/password/reset/
```

**Corps de la requête :**
```json
{
    "email": "user@example.com",
    "hcaptcha_token": "token_hcaptcha"
}
```

### Nouveau Mot de Passe
```
POST /auth/password/reset/confirm/
```

**Corps de la requête :**
```json
{
    "token": "reset_token",
    "new_password": "NouveauMotDePasse123!",
    "new_password_confirm": "NouveauMotDePasse123!"
}
```
