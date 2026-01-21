'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook pour empêcher la navigation arrière du navigateur
 * Utile pour les pages protégées après déconnexion
 */
export function usePreventBackNavigation(enabled: boolean = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    // Ajouter un état dans l'historique pour détecter la navigation arrière
    const handlePopState = (event: PopStateEvent) => {
      // Empêcher la navigation arrière
      window.history.pushState(null, '', window.location.href);
      
      // Optionnel : Afficher un message
      console.log('⚠️ Navigation arrière bloquée - Veuillez vous reconnecter');
    };

    // Ajouter un état initial
    window.history.pushState(null, '', window.location.href);

    // Écouter les événements de navigation
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled, router]);
}
