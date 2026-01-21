'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { User, LoginCredentials, RegisterData } from '@/types/auth';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  justLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false); // Anti-redirection
  const router = useRouter();
  const pathname = usePathname();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  // Détecter l'inactivité (5 minutes)
  useInactivityTimeout({
    timeout: 5 * 60 * 1000, // 5 minutes
    onInactive: async () => {
      if (user) {
        console.log('⏱️ Inactivité détectée - Déconnexion automatique');
        await logout();
      }
    },
    enabled: !!user, // Activer seulement si connecté
  });

  // Refresh automatique du token toutes les 4 minutes (avant expiration à 5min)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await api.post('/auth/refresh/');
        console.log('🔄 Token rafraîchi automatiquement');
      } catch (error) {
        console.error('❌ Erreur refresh token:', error);
        await logout();
      }
    }, 4 * 60 * 1000); // 4 minutes

    return () => clearInterval(interval);
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/profile/');
      console.log('📋 Profil utilisateur récupéré:', response.data);
      setUser(response.data);
    } catch (error: any) {
      // 401 est normal au démarrage (pas de token)
      if (error.response?.status !== 401) {
        console.log('❌ Erreur récupération profil:', error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  const login = async (credentials: LoginCredentials) => {
    setJustLoggedIn(true); // Empêche les redirections pendant 1s
    
    try {
      const response = await api.post('/auth/login/', credentials);
      const profileResponse = await api.get('/auth/profile/');
      const userData = profileResponse.data;
      
      console.log(`✅ Connexion réussie - Rôle: ${userData.role}`);
      
      // Mettre à jour l'état utilisateur
      setUser(userData);
      
      // Redirection intelligente selon le rôle avec navigation forcée
      if (userData.role === 'admin' || userData.role === 'staff' || userData.role === 'doctor') {
        console.log('🔀 Redirection vers dashboard admin');
        window.location.href = '/admin/dashboard';
      } else if (userData.role === 'patient') {
        console.log('🔀 Redirection vers dashboard patient');
        window.location.href = '/patient/dashboard';
      } else {
        // Rôle inconnu, redirection vers accueil
        console.warn('⚠️ Rôle inconnu:', userData.role);
        window.location.href = '/';
      }
    } finally {
      // Réinitialiser après 1 seconde
      setTimeout(() => setJustLoggedIn(false), 1000);
    }
  };

  const register = async (data: RegisterData) => {
    const response = await api.post('/auth/register/', data);
    const profileResponse = await api.get('/auth/profile/');
    setUser(profileResponse.data);
    
    // Les nouveaux utilisateurs sont des patients par défaut
    router.push('/patient/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
      
      // Empêcher la navigation arrière vers les pages protégées
      window.history.pushState(null, '', '/');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const response = await api.patch('/auth/profile/', data);
    setUser(response.data);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      justLoggedIn,
      login,
      register,
      logout,
      updateProfile,
      refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
