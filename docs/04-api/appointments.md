# API - Appointments

## Endpoints

### Lister les Rendez-vous
```
GET /appointments/
```

**Headers :**
```
Authorization: Bearer <access_token>
```

**Paramètres de query :**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `status` | string | Filtrer par statut |
| `date` | date | Filtrer par date |
| `page` | int | Numéro de page |

**Réponse :**
```json
{
    "count": 10,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "patient": 1,
            "appointment_date": "2025-02-10T10:00:00",
            "status": "pending",
            "type": "consultation",
            "notes": "Notes du patient"
        }
    ]
}
```

### Créer un Rendez-vous
```
POST /appointments/
```

**Headers :**
```
Authorization: Bearer <access_token>
```

**Corps de la requête :**
```json
{
    "appointment_date": "2025-02-10T10:00:00",
    "type": "consultation",
    "notes": "Rendez-vous pour examen de vue"
}
```

### Détails d'un Rendez-vous
```
GET /appointments/<id>/
```

### Modifier un Rendez-vous
```
PUT /appointments/<id>/
```

### Annuler un Rendez-vous
```
POST /appointments/<id>/cancel/
```

**Corps de la requête :**
```json
{
    "reason": "Motif de l'annulation"
}
```

## Statuts des Rendez-vous

| Statut | Description |
|---------|-------------|
| `pending` | En attente de confirmation |
| `confirmed` | Confirmé par l'administration |
| `rejected` | Refusé |
| `cancelled` | Annulé par le patient |
| `completed` | Terminé |
| `no_show` | Non présenté |

## Types de Rendez-vous

| Type | Description |
|------|-------------|
| `consultation` | Consultation générale |
| `specialized` | Consultation spécialisée |
| `follow_up` | Suivi |
| `emergency` | Urgence |
