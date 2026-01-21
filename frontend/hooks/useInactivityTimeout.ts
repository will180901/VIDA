'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimeoutOptions {
  timeout?: number; // Durée d'inactivité en ms (défaut: 5 minutes)
  onInactive: () => void; // Callback appelé lors de l'inactivité
  enabled?: boolean; // Activer/désactiver le hook
}

/**
 * Hook pour détecter l'inactivité utilisateur
 * Détecte les mouvements de souris, clics, touches clavier, scroll, etc.
 */
export function useInactivityTimeout({
  timeout = 5 * 60 * 1000, // 5 minutes par défaut
  onInactive,
  enabled = true,
}: UseInactivityTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    // Mettre à jour le timestamp de dernière activité
    lastActivityRef.current = Date.now();

    // Nettoyer le timer existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Créer un nouveau timer
    timeoutRef.current = setTimeout(() => {
      onInactive();
    }, timeout);
  }, [timeout, onInactive]);

  useEffect(() => {
    if (!enabled) {
      // Nettoyer le timer si désactivé
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Événements à surveiller pour détecter l'activité
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Initialiser le timer
    resetTimer();

    // Ajouter les listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [enabled, resetTimer]);

  // Retourner le temps écoulé depuis la dernière activité
  return {
    getLastActivity: () => lastActivityRef.current,
    getInactiveTime: () => Date.now() - lastActivityRef.current,
  };
}
