# Architecture Frontend - Next.js

## Stack Technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 16.1.1 | Framework React |
| React | 19.2.3 | Bibliothèque UI |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 4.x | Framework CSS |
| TanStack Query | 5.x | Gestion d'état serveur |
| React Hook Form | 7.x | Formulaires |
| Framer Motion | 12.x | Animations |
| Axios | 1.x | Client HTTP |
| Zod | 4.x | Validation |

## Structure du Projet

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Groupe d'authentification
│   │   ├── connexion/
│   │   ├── inscription/
│   │   └── mot-de-passe-oublie/
│   ├── admin/             # Espace administrateur
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   └── patients/
│   ├── patient/           # Espace patient
│   │   ├── dashboard/
│   │   └── appointments/
│   ├── cgu/
│   ├── politique-confidentialite/
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Composants React
│   ├── admin/
│   ├── auth/
│   ├── layout/
│   ├── notifications/
│   ├── patient/
│   └── ui/
├── contexts/              # Contextes React
│   ├── AuthContext.tsx
│   ├── NotificationContext.tsx
│   └── DropdownContext.tsx
├── hooks/                 # Hooks personnalisés
│   ├── useAppointments.ts
│   ├── useCMS.ts
│   └── useDashboard.ts
├── lib/                   # Utilitaires
│   ├── api.ts             # Instance Axios
│   ├── animations.ts      # Framer Motion
│   └── utils.ts
├── providers/             # Providers React
│   └── Providers.tsx
├── types/                 # Types TypeScript
│   └── auth.ts
└── public/                # Assets statiques
```

## Organisation des Routes

### Espace Public
- `/` - Page d'accueil
- `/cgu` - Conditions générales d'utilisation
- `/politique-confidentialite` - Politique de confidentialité

### Espace Authentification
- `/connexion` - Page de connexion
- `/inscription` - Page d'inscription
- `/mot-de-passe-oublie` - Mot de passe oublié

### Espace Patient
- `/patient/dashboard` - Tableau de bord patient
- `/patient/appointments` - Gestion des rendez-vous

### Espace Admin
- `/admin/dashboard` - Tableau de bord administrateur
- `/admin/appointments` - Gestion des rendez-vous
- `/admin/patients` - Gestion des patients

## Gestion de l'État

### TanStack Query
```typescript
// Exemple d'utilisation
const { data, isLoading } = useQuery({
  queryKey: ['appointments'],
  queryFn: () => api.get('/appointments/')
});
```

### Authentification (AuthContext)
```typescript
// Accès au contexte d'authentification
const { user, login, logout } = useAuth();
```

## Commandes

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev

# Build pour production
pnpm build

# Lancer en mode production
pnpm start
```
