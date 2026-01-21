/**
 * Hook personnalisé pour animations au scroll
 * Utilise Intersection Observer pour performance optimale
 */

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Hook simple pour détecter si élément est visible
 * Optimisé avec Framer Motion's useInView
 */
export function useScrollAnimation(options = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '0px 0px -100px 0px',
    ...options,
  });

  return { ref, isInView };
}

/**
 * Hook pour animations avec délai personnalisé
 */
export function useScrollAnimationWithDelay(delay = 0, options = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '0px 0px -100px 0px',
    ...options,
  });
  
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  return { ref, isInView: shouldAnimate };
}

/**
 * Hook pour détecter prefers-reduced-motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
