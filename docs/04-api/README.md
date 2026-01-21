# Documentation API - VIDA

## Vue d'Ensemble

L'API VIDA est une API RESTful construite avec Django REST Framework.

## Base URL

| Environnement | URL |
|---------------|-----|
| Développement | http://localhost:8000/api/v1/ |
| Production | https://api.vida.cg/api/v1/ |

## Documentation Interactive

| Endpoint | Description |
|----------|-------------|
| `/api/schema/swagger/` | Documentation Swagger UI |
| `/api/schema/redoc/` | Documentation ReDoc |

## Structure des Endpoints

| Prefix | Module | Description |
|--------|--------|-------------|
| `/auth/` | Authentication | Inscription, connexion, tokens |
| `/appointments/` | Appointments | Gestion des rendez-vous |
| `/cms/` | Content Management | Contenu du site |

## Format des Réponses

### Succès
```json
{
    "data": {
        "id": 1,
        "name": "Exemple"
    },
    "message": "Opération réussie"
}
```

### Erreur
```json
{
    "error": {
        "code": "ERROR_CODE",
        "message": "Description de l'erreur"
    }
}
```

## Authentification

Tous les endpoints (sauf mention contraire) nécessitent un token JWT :

```bash
# Exemple de requête authentifiée
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/appointments/
```

## Endpoints

- [Authentification](authentification.md)
- [Appointments](appointments.md)
- [Content Management](content-management.md)
