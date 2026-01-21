/**
 * Hook pour gérer le loading state de la page
 * Affiche skeleton pendant le chargement initial
 */

'use client';

import { useState, useEffect } from 'react';

export function usePageLoading(minLoadingTime = 800) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startTime = Date.now();

    // Attendre que tout soit chargé
    const handleLoad = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      // Garantir un temps minimum pour éviter flash
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    };

    // Si déjà chargé
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [minLoadingTime]);

  return isLoading;
}
