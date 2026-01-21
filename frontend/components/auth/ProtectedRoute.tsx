'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Rôles autorisés (admin, staff, doctor, patient)
  requireAuth?: boolean; // Nécessite une authentification
}

/**
 * Composant HOC pour protéger les routes selon le rôle utilisateur
 * 
 * Usage:
 * - <ProtectedRoute allowedRoles={['admin', 'staff']}>...</ProtectedRoute>
 * - <ProtectedRoute requireAuth>...</ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, justLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (isLoading) return;

    // Si juste connecté, attendre 1 seconde avant redirection
    if (justLoggedIn) return;

    // Si authentification requise mais pas connecté
    if (requireAuth && !isAuthenticated) {
      console.log('🚫 Accès refusé - Non authentifié');
      router.push(`/connexion?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }

    // Si rôles spécifiques requis
    if (allowedRoles && user) {
      const hasAccess = allowedRoles.includes(user.role);
      
      if (!hasAccess) {
        console.log(`🚫 Accès refusé - Rôle ${user.role} non autorisé`);
        
        // Rediriger vers le dashboard approprié selon le rôle
        if (user.role === 'admin' || user.role === 'staff' || user.role === 'doctor') {
          router.push('/admin/dashboard');
        } else {
          router.push('/patient/dashboard');
        }
        return;
      }
    }

    // Empêcher la navigation arrière vers les pages publiques si connecté
    if (isAuthenticated && (pathname === '/connexion' || pathname === '/inscription')) {
      if (user?.role === 'admin' || user?.role === 'staff' || user?.role === 'doctor') {
        router.push('/admin/dashboard');
      } else {
        router.push('/patient/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, requireAuth, router, pathname]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-vida-teal mx-auto mb-4" />
          <p className="text-sm text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié et auth requise, ne rien afficher (redirection en cours)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si rôle non autorisé, ne rien afficher (redirection en cours)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  // Afficher le contenu protégé
  return <>{children}</>;
}
