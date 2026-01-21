# API - Content Management

## Endpoints

### Services Médicaux
```
GET /cms/services/
```

**Réponse :**
```json
[
    {
        "id": 1,
        "name": "Consultation",
        "description": "Consultation ophtalmologique",
        "icon": "consultation.png",
        "price": 15000
    }
]
```

### Questions Fréquentes (FAQ)
```
GET /cms/faqs/
```

### Slides Page d'Accueil
```
GET /cms/hero-slides/
```

### Paramètres de la Clinique
```
GET /cms/settings/
```

**Réponse :**
```json
{
    "clinic_name": "VIDA",
    "address": "08 Bis rue Mboko, Moungali, Brazzaville",
    "phone": "+242 06 569 12 35",
    "email": "centremedvida@gmail.com",
    "opening_hours": {
        "monday": "08:00-18:00",
        "tuesday": "08:00-18:00",
        // ...
    }
}
```

### Horaires d'Ouverture
```
GET /cms/schedules/
```

### Jours Fériés
```
GET /cms/holidays/
```

### Envoyer un Message de Contact
```
POST /cms/contact-messages/
```

**Corps de la requête :**
```json
{
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+242012345678",
    "subject": "Demande d'information",
    "message": "Je souhaiterais avoir plus d'informations sur...",
    "hcaptcha_token": "token_hcaptcha"
}
```

### Raisons de Choisir VIDA
```
GET /cms/why-vida/
```

### Tarifs des Consultations
```
GET /cms/consultation-fees/
```
