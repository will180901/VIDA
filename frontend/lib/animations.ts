/**
 * Système d'animations centralisé - Framer Motion
 * Optimisé pour performance (GPU-accelerated uniquement)
 * Respecte prefers-reduced-motion
 */

import { Variants, Transition } from 'framer-motion';

// ============================================
// TRANSITIONS OPTIMISÉES
// ============================================

export const transitions = {
  // Smooth et rapide
  smooth: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 0.5,
  } as Transition,
  
  // Très smooth pour grandes animations
  smoothSlow: {
    type: 'spring',
    stiffness: 50,
    damping: 20,
    mass: 0.8,
  } as Transition,
  
  // Rapide et snappy
  snappy: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
    mass: 0.3,
  } as Transition,
  
  // Ease out classique
  easeOut: {
    duration: 0.4,
    ease: [0.16, 1, 0.3, 1], // Custom easing
  } as Transition,
  
  // Pour micro-interactions
  quick: {
    duration: 0.2,
    ease: 'easeOut',
  } as Transition,
};

// ============================================
// VARIANTES RÉUTILISABLES
// ============================================

/**
 * Fade in from bottom (scroll reveal)
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/**
 * Fade in simple
 */
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.easeOut,
  },
};

/**
 * Scale + Fade (pour modals, cards)
 */
export const scaleFade: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.smooth,
  },
};

/**
 * Container avec stagger pour enfants
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Item pour stagger (utilisé avec staggerContainer)
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

// ============================================
// HOVER EFFECTS
// ============================================

/**
 * Lift effect au hover (pour cartes)
 */
export const hoverLift = {
  rest: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: transitions.quick,
  },
};

/**
 * Scale au hover (pour boutons)
 */
export const hoverScale = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: transitions.quick,
  },
  tap: {
    scale: 0.95,
    transition: transitions.quick,
  },
};

// ============================================
// MODAL ANIMATIONS
// ============================================

/**
 * Backdrop fade
 */
export const backdropFade: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Modal scale + fade
 */
export const modalScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================
// UTILITAIRES
// ============================================

/**
 * Génère un délai pour stagger manuel
 */
export const getStaggerDelay = (index: number, baseDelay = 0.1) => ({
  delay: index * baseDelay,
});

/**
 * Viewport options pour Intersection Observer
 */
export const viewportOptions = {
  once: true, // Anime une seule fois
  amount: 0.2, // 20% visible pour trigger
  margin: '0px 0px -100px 0px', // Trigger un peu avant
};
