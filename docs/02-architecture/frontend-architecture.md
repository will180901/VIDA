# 🎨 Architecture Frontend - VIDA

Documentation détaillée de l'architecture frontend Next.js du projet VIDA.

---

## 📋 Table des matières

1. [Structure du projet](#-structure-du-projet)
2. [Architecture des composants](#-architecture-des-composants)
3. [Gestion d'état](#-gestion-détat)
4. [Routing et navigation](#-routing-et-navigation)
5. [Styling et design system](#-styling-et-design-system)
6. [Performance et optimisation](#-performance-et-optimisation)
7. [Communication avec l'API](#-communication-avec-lapi)

---

## 📁 Structure du projet

```
frontend/
├── app/                           # App Router (Next.js 15)
│   ├── layout.tsx                # Layout racine
│   ├── page.tsx                  # Page d'accueil
│   ├── globals.css               # Styles globaux
│   ├── (auth)/                   # Groupe de routes auth
│   │   ├── connexion/
│   │   │   └── page.tsx         # Page de connexion
│   │   ├── inscription/
│   │   │   └── page.tsx         # Page d'inscription
│   │   └── mot-de-passe-oublie/
│   │       └── page.tsx         # Page reset password
│   └── not-found.tsx            # Page 404
│
├── components/                    # Composants React
│   ├── ui/                       # Composants UI réutilisables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── HeroSlider.tsx
│   │   ├── ServiceCard.tsx
│   │   └── ...
│   │
│   ├── auth/                     # Composants d'authentification
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── layout/                   # Composants de layout
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── MobileMenu.tsx
│   │
│   └── modals/                   # Modals
│       ├── AppointmentModal.tsx
│       └── ContactModal.tsx
│
├── hooks/                         # Hooks personnalisés
│   ├── useAuth.ts                # Hook d'authentification
│   ├── useAppointments.ts        # Hook rendez-vous
│   ├── useContent.ts             # Hook contenu
│   ├── useToast.ts               # Hook notifications
│   └── useMediaQuery.ts          # Hook responsive
│
├── contexts/                      # Contextes React
│   ├── AuthContext.tsx           # Contexte authentification
│   └── ToastContext.tsx          # Contexte notifications
│
├── providers/                     # Providers
│   ├── QueryProvider.tsx         # TanStack Query provider
│   └── ThemeProvider.tsx         # Theme provider
│
├── lib/                          # Utilitaires
│   ├── api.ts                    # Client API (Axios)
│   ├── animations.ts             # Animations Framer Motion
│   ├── utils.ts                  # Fonctions utilitaires
│   └── validators.ts             # Validateurs Zod
│
├── types/                        # Types TypeScript
│   ├── api.ts                    # Types API
│   ├── auth.ts                   # Types authentification
│   ├── appointment.ts            # Types rendez-vous
│   └── content.ts                # Types contenu
│
├── public/                       # Assets statiques
│   ├── images/
│   │   ├── hero/
│   │   └── services/
│   └── favicon.ico
│
├── .next/                        # Build Next.js (généré)
├── node_modules/                 # Dépendances (généré)
│
├── next.config.ts                # Configuration Next.js
├── tailwind.config.ts            # Configuration Tailwind
├── tsconfig.json                 # Configuration TypeScript
├── postcss.config.mjs            # Configuration PostCSS
├── eslint.config.mjs             # Configuration ESLint
├── package.json                  # Dépendances npm
├── pnpm-lock.yaml                # Lock file pnpm
└── .env.local                    # Variables d'environnement
```

---

## 🧩 Architecture des composants

### Hiérarchie des composants

```
App (layout.tsx)
│
├── Providers
│   ├── QueryProvider (TanStack Query)
│   ├── AuthProvider (Context)
│   └── ToastProvider (Context)
│
├── Header
│   ├── Logo
│   ├── Navigation
│   │   ├── NavLink (Accueil)
│   │   ├── NavLink (Services)
│   │   ├── NavLink (À propos)
│   │   ├── Dropdown (Horaires & Tarifs)
│   │   └── Dropdown (Contact)
│   ├── AppointmentButton
│   └── AuthButtons (Connexion/Profil)
│
├── Page Content (page.tsx)
│   ├── HeroSlider
│   │   ├── Slide 1
│   │   ├── Slide 2
│   │   ├── Slide 3
│   │   └── Slide 4
│   │
│   ├── ServicesSection
│   │   ├── ServiceCard 1
│   │   ├── ServiceCard 2
│   │   ├── ServiceCard 3
│   │   └── ServiceCard 4
│   │
│   ├── WhyVidaSection
│   │   ├── ReasonCard 1
│   │   ├── ReasonCard 2
│   │   ├── ReasonCard 3
│   │   └── ReasonCard 4
│   │
│   ├── AboutSection
│   │
│   └── CTASection
│       ├── AppointmentButton
│       └── ContactButton
│
├── Modals (conditionnels)
│   ├── AppointmentModal
│   │   ├── Step 1: Informations personnelles
│   │   ├── Step 2: Choix du rendez-vous
│   │   └── Step 3: Confirmation
│   │
│   └── ContactModal
│       └── ContactForm
│
└── Footer
    ├── ContactInfo
    ├── QuickLinks
    ├── SocialLinks
    └── Copyright
```

### Patterns de composants

#### 1. Composants de présentation (Presentational)

**Responsabilité :** Affichage uniquement, pas de logique métier.

```typescript
// components/ui/ServiceCard.tsx
interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  icon?: string;
}

export function ServiceCard({ title, description, image, icon }: ServiceCardProps) {
  return (
    <div className="service-card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

#### 2. Composants conteneurs (Container)

**Responsabilité :** Logique métier, gestion d'état, appels API.

```typescript
// components/modals/AppointmentModal.tsx
export function AppointmentModal() {
  const [step, setStep] = useState(1);
  const { data: slots, isLoading } = useAvailableSlots(selectedDate);
  const createAppointment = useCreateAppointment();
  
  const handleSubmit = async (data: AppointmentData) => {
    await createAppointment.mutateAsync(data);
    toast.success('Rendez-vous créé !');
    onClose();
  };
  
  return (
    <Modal>
      {step === 1 && <PersonalInfoStep onNext={setStep} />}
      {step === 2 && <AppointmentStep slots={slots} onNext={setStep} />}
      {step === 3 && <ConfirmationStep onSubmit={handleSubmit} />}
    </Modal>
  );
}
```

#### 3. Composants composés (Compound)

**Responsabilité :** Composants avec sous-composants liés.

```typescript
// components/ui/Modal.tsx
export function Modal({ children, isOpen, onClose }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-backdrop" onClick={onClose}>
          <motion.div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

Modal.Header = function ModalHeader({ children }: { children: ReactNode }) {
  return <div className="modal-header">{children}</div>;
};

Modal.Body = function ModalBody({ children }: { children: ReactNode }) {
  return <div className="modal-body">{children}</div>;
};

Modal.Footer = function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="modal-footer">{children}</div>;
};
```

---

## 🔄 Gestion d'état

### Architecture de l'état

```
┌─────────────────────────────────────────────────────────┐
│                    État Application                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  État Serveur (TanStack Query)                  │    │
│  │  - Données API (rendez-vous, contenu)          │    │
│  │  - Cache automatique                            │    │
│  │  - Synchronisation                              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  État Global (React Context)                    │    │
│  │  - Authentification (user, tokens)             │    │
│  │  - Notifications (toasts)                       │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  État Local (useState, useReducer)              │    │
│  │  - État des formulaires                         │    │
│  │  - État des modals                              │    │
│  │  - État UI temporaire                           │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  État URL (Next.js Router)                      │    │
│  │  - Query params (?modal=appointment)           │    │
│  │  - Route params (/rdv/[id])                    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 1. État serveur (TanStack Query)

**Configuration :**

```typescript
// providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Utilisation :**

```typescript
// hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAvailableSlots(date: string) {
  return useQuery({
    queryKey: ['slots', date],
    queryFn: () => api.get(`/appointments/slots/?date=${date}`),
    enabled: !!date,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AppointmentData) => api.post('/appointments/', data),
    onSuccess: () => {
      // Invalider le cache des créneaux
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
```

### 2. État global (React Context)

**Authentification :**

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login/', { email, password });
    setUser(response.data.user);
  };
  
  const logout = async () => {
    await api.post('/auth/logout/');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### 3. État local (useState)

```typescript
// components/modals/AppointmentModal.tsx
export function AppointmentModal() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AppointmentData>>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // ...
}
```

---

## 🗺️ Routing et navigation

### App Router (Next.js 15)

**Structure des routes :**

```
app/
├── layout.tsx                    → Layout racine (toutes les pages)
├── page.tsx                      → / (page d'accueil)
├── not-found.tsx                 → 404
│
├── (auth)/                       → Groupe de routes (layout partagé)
│   ├── layout.tsx               → Layout auth
│   ├── connexion/
│   │   └── page.tsx            → /connexion
│   ├── inscription/
│   │   └── page.tsx            → /inscription
│   └── mot-de-passe-oublie/
│       └── page.tsx            → /mot-de-passe-oublie
│
└── (dashboard)/                  → Groupe de routes (futur)
    ├── layout.tsx
    ├── page.tsx                 → /dashboard
    └── rendez-vous/
        ├── page.tsx            → /dashboard/rendez-vous
        └── [id]/
            └── page.tsx        → /dashboard/rendez-vous/[id]
```

### Navigation

**Liens internes :**

```typescript
import Link from 'next/link';

<Link href="/connexion">Se connecter</Link>
<Link href="/inscription">S'inscrire</Link>
```

**Navigation programmatique :**

```typescript
'use client';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  
  const handleSubmit = async (data: LoginData) => {
    await login(data);
    router.push('/dashboard'); // Redirection
  };
}
```

**Query params :**

```typescript
import { useSearchParams } from 'next/navigation';

export function HomePage() {
  const searchParams = useSearchParams();
  const modal = searchParams.get('modal'); // ?modal=appointment
  
  return (
    <>
      {modal === 'appointment' && <AppointmentModal />}
    </>
  );
}
```

---

## 🎨 Styling et design system

### Tailwind CSS 4

**Configuration :**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vida-teal': '#1D9A94',
        'vida-orange': '#F97316',
      },
      fontFamily: {
        hero: ['Sora', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

**Utilisation :**

```typescript
<div className="bg-vida-teal text-white p-4 rounded-lg hover:bg-vida-teal/90 transition-colors">
  <h2 className="font-heading text-2xl font-bold">Titre</h2>
  <p className="font-body text-sm">Description</p>
</div>
```

### Design System VIDA

**Couleurs :**

| Nom | Hex | Usage |
|-----|-----|-------|
| vida-teal | #1D9A94 | Couleur primaire (boutons, liens) |
| vida-orange | #F97316 | Couleur accent (highlights) |
| gray-900 | #111827 | Texte principal |
| gray-600 | #4B5563 | Texte secondaire |
| gray-100 | #F3F4F6 | Backgrounds |

**Typographie :**

| Classe | Police | Usage |
|--------|--------|-------|
| font-hero | Sora | Logo, titres hero |
| font-heading | Plus Jakarta Sans | Titres de sections |
| font-body | Inter | Corps de texte |

**Espacements :**

```typescript
// Padding/Margin
p-4   → 1rem (16px)
p-6   → 1.5rem (24px)
p-8   → 2rem (32px)
p-12  → 3rem (48px)

// Gap
gap-4  → 1rem
gap-6  → 1.5rem
gap-8  → 2rem
```

**Composants réutilisables :**

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all';
  
  const variantClasses = {
    primary: 'bg-vida-teal text-white hover:bg-vida-teal/90',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-vida-teal text-vida-teal hover:bg-vida-teal hover:text-white',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

---

## ⚡ Performance et optimisation

### Optimisations Next.js

**1. Image Optimization :**

```typescript
import Image from 'next/image';

<Image
  src="/images/hero/hero-1.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // Pour les images above-the-fold
  placeholder="blur" // Placeholder flou
/>
```

**2. Code Splitting automatique :**

```typescript
// Chaque page est automatiquement split
// app/page.tsx → chunk séparé
// app/connexion/page.tsx → chunk séparé
```

**3. Lazy Loading :**

```typescript
import dynamic from 'next/dynamic';

// Charger le modal seulement quand nécessaire
const AppointmentModal = dynamic(() => import('@/components/modals/AppointmentModal'), {
  loading: () => <Spinner />,
  ssr: false, // Désactiver SSR pour ce composant
});
```

**4. Prefetching :**

```typescript
// Next.js prefetch automatiquement les liens visibles
<Link href="/connexion" prefetch={true}>
  Se connecter
</Link>
```

### Optimisations React

**1. Memoization :**

```typescript
import { memo, useMemo, useCallback } from 'react';

// Composant memoizé
export const ServiceCard = memo(function ServiceCard({ title, description }: Props) {
  return <div>...</div>;
});

// Valeur memoizée
const sortedSlots = useMemo(() => {
  return slots.sort((a, b) => a.time.localeCompare(b.time));
}, [slots]);

// Fonction memoizée
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);
```

**2. Suspense :**

```typescript
import { Suspense } from 'react';

<Suspense fallback={<Spinner />}>
  <AppointmentsList />
</Suspense>
```

---

## 🔌 Communication avec l'API

### Client API (Axios)

```typescript
// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Envoyer les cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré → refresh
      try {
        await api.post('/auth/refresh/');
        return api.request(error.config);
      } catch {
        // Refresh échoué → déconnexion
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(error);
  }
);
```

### Hooks API

```typescript
// hooks/useContent.ts
export function useClinicSettings() {
  return useQuery({
    queryKey: ['clinic-settings'],
    queryFn: () => api.get('/content/clinic-settings/').then(res => res.data),
    staleTime: 60 * 60 * 1000, // 1 heure
  });
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: () => api.get('/content/hero-slides/').then(res => res.data),
    staleTime: 60 * 60 * 1000,
  });
}

export function useMedicalServices() {
  return useQuery({
    queryKey: ['medical-services'],
    queryFn: () => api.get('/content/services/').then(res => res.data),
    staleTime: 60 * 60 * 1000,
  });
}
```

---

## 📚 Ressources

- [Guide de développement frontend](../04-frontend-guide/README.md)
- [Documentation API](../03-api-documentation/README.md)
- [Architecture backend](./backend-architecture.md)

---

**Frontend documenté ! 🎨**
