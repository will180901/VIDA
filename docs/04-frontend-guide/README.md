# 🎨 Guide Frontend - VIDA

Guide complet de développement frontend avec Next.js 15.

---

## 📋 Table des matières

1. **[Composants](./components.md)** - Guide des composants React
2. **[Hooks](./hooks.md)** - Hooks personnalisés
3. **[Styling](./styling.md)** - Tailwind CSS et design system
4. **[State Management](./state-management.md)** - Gestion d'état

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- pnpm 8+

### Installation

```bash
cd frontend
pnpm install
```

### Lancer le serveur de développement

```bash
pnpm dev
# Ouvrir http://localhost:3000
```

### Build de production

```bash
pnpm build
pnpm start
```

---

## 📁 Structure du projet

```
frontend/
├── app/                    # App Router (Next.js 15)
│   ├── layout.tsx         # Layout racine
│   ├── page.tsx           # Page d'accueil
│   ├── globals.css        # Styles globaux
│   └── (auth)/            # Groupe de routes auth
│
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   ├── auth/             # Composants d'authentification
│   ├── layout/           # Header, Footer, Navigation
│   └── modals/           # Modals
│
├── hooks/                # Hooks personnalisés
├── contexts/             # Contextes React
├── lib/                  # Utilitaires
├── types/                # Types TypeScript
└── public/               # Assets statiques
```

---

## 🛠️ Stack technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 15 | Framework React |
| **React** | 19 | UI Library |
| **TypeScript** | 5+ | Typage statique |
| **Tailwind CSS** | 4 | Styling |
| **TanStack Query** | 5+ | Gestion état serveur |
| **Framer Motion** | 11+ | Animations |
| **React Hook Form** | 7+ | Formulaires |
| **Zod** | 3+ | Validation |
| **Axios** | 1+ | HTTP client |

---

## 🎯 Conventions de code

### Nommage

**Composants :**
```typescript
// PascalCase pour les composants
export function MyComponent() {}
export const MyComponent = () => {}
```

**Hooks :**
```typescript
// camelCase avec préfixe "use"
export function useMyHook() {}
```

**Fichiers :**
```
MyComponent.tsx      // Composants
useMyHook.ts         // Hooks
myUtils.ts           // Utilitaires
types.ts             // Types
```

### Structure d'un composant

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onSubmit: () => void;
}

// 3. Composant
export function MyComponent({ title, onSubmit }: MyComponentProps) {
  // 3.1. Hooks
  const [isOpen, setIsOpen] = useState(false);
  
  // 3.2. Handlers
  const handleClick = () => {
    setIsOpen(true);
    onSubmit();
  };
  
  // 3.3. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click me</Button>
    </div>
  );
}
```

---

## 🎨 Design System VIDA

### Couleurs

```typescript
// tailwind.config.ts
colors: {
  'vida-teal': '#1D9A94',      // Primaire
  'vida-orange': '#F97316',    // Accent
}
```

### Typographie

```typescript
fontFamily: {
  hero: ['Sora', 'sans-serif'],
  heading: ['Plus Jakarta Sans', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
}
```

### Composants de base

```typescript
// Button
<Button variant="primary" size="md">Click me</Button>

// Input
<Input type="text" placeholder="Email" />

// Modal
<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Header>Titre</Modal.Header>
  <Modal.Body>Contenu</Modal.Body>
</Modal>
```

---

## 🔄 Gestion d'état

### État serveur (TanStack Query)

```typescript
// hooks/useAppointments.ts
export function useAvailableSlots(date: string) {
  return useQuery({
    queryKey: ['slots', date],
    queryFn: () => api.get(`/appointments/slots/?date=${date}`),
    enabled: !!date,
  });
}
```

### État global (Context)

```typescript
// contexts/AuthContext.tsx
const { user, login, logout } = useAuth();
```

### État local (useState)

```typescript
const [isOpen, setIsOpen] = useState(false);
```

---

## 📝 Formulaires

### Avec React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data: FormData) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && <span>Email invalide</span>}
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

---

## 🎬 Animations

### Avec Framer Motion

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Contenu animé
</motion.div>
```

---

## 🧪 Tests

### Linting

```bash
pnpm lint
```

### Type checking

```bash
pnpm type-check
```

### Build test

```bash
pnpm build
```

---

## 📚 Ressources

- [Composants](./components.md)
- [Hooks](./hooks.md)
- [Styling](./styling.md)
- [State Management](./state-management.md)
- [Architecture frontend](../02-architecture/frontend-architecture.md)

---

**Guide frontend ! 🎨**
