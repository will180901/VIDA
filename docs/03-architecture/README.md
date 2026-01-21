# Architecture de VIDA

## Vue d'Ensemble

VIDA est une application web full-stack composée d'un backend Django REST Framework et d'un frontend Next.js.

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │   Patient │  │   Admin   │  │   Public  │               │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘               │
│        │              │              │                      │
│        └──────────────┼──────────────┘                      │
│                       │                                     │
│              ┌────────▼────────┐                            │
│              │  API REST      │                            │
│              │  /api/v1/      │                            │
│              └─────┬──────────┘                            │
│                    │                                       │
└────────────────────┼───────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│                      Backend (Django)                       │
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────┐ │
│  │  Users    │  │Appoint-   │  │  Content  │  │ Notif- │ │
│  │           │  │  ments    │  │  Manage-  │  │ cations│ │
│  │           │  │           │  │   ment    │  │        │ │
│  └───────────┘  └───────────┘  └───────────┘  └────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Django REST Framework                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌───────────┐  ┌───────────┐                            │
│  │  SQLite   │  │ PostgreSQL│                            │
│  │  (dev)    │  │  (prod)   │                            │
│  └───────────┘  └───────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Modules Backend

| Module | Description | Emplacement |
|--------|-------------|-------------|
| **users** | Gestion des utilisateurs, authentification, audit | `backend/apps/users/` |
| **appointments** | Gestion des rendez-vous médicaux | `backend/apps/appointments/` |
| **content_management** | CMS pour le contenu du site | `backend/apps/content_management/` |
| **notifications** | Système de notifications | `backend/apps/notifications/` |

## Structure du Projet

```
VIDA/
├── backend/
│   ├── apps/
│   │   ├── users/
│   │   ├── appointments/
│   │   ├── content_management/
│   │   └── notifications/
│   ├── config/
│   │   ├── settings/
│   │   ├── middleware.py
│   │   └── urls.py
│   ├── fixtures/
│   ├── media/
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   └── lib/
└── docs/
```

## Documentation

- [Backend](backend.md) - Architecture Django et modules
- [Frontend](frontend.md) - Architecture Next.js et composants
- [Sécurité](securite.md) - Authentification et permissions
