/**
 * ══════════════════════════════════════════════════════════════════
 *  CONFIGURATION DES IMAGES ET ILLUSTRATIONS - PROJET VIDA
 * ══════════════════════════════════════════════════════════════════
 * 
 * Ce fichier centralise tous les chemins d'images avec leurs fallbacks.
 * 
 * @description Configuration centralisée des assets visuels du projet.
 * Utilisé avec le composant ImageWithFallback pour un fallback automatique.
 * 
 * @see /docs/IMAGES-GUIDE.md pour la documentation complète
 * @see /components/ui/ImageWithFallback.tsx pour le composant
 * 
 * COMMENT ÇA MARCHE :
 * - Chaque image a un chemin principal (photo réelle) et un fallback (illustration SVG)
 * - Si la photo n'existe pas → L'illustration SVG s'affiche automatiquement
 * - Dès que tu places la photo → Elle remplace l'illustration immédiatement
 * 
 * POUR AJOUTER DES IMAGES :
 * 1. Place tes fichiers aux emplacements indiqués dans "src"
 * 2. Rafraîchis la page → L'image s'affiche automatiquement !
 * 3. Pas besoin de modifier le code
 * 
 * FORMATS RECOMMANDÉS :
 * - Photos : WebP ou AVIF (optimisés par Next.js)
 * - Illustrations : SVG (vectoriel)
 * - Logos : SVG
 * - Taille max : 500KB par image
 */

export const IMAGE_PATHS = {
  // ═══════════════════════════════════════════════════════════════════
  //  HERO SECTION
  // ═══════════════════════════════════════════════════════════════════
  hero: {
    // Animation Lottie de l'œil (optionnel, améliore l'effet wow)
    eyeAnimation: '/animations/hero-eye.json',
    
    // Photo principale hero (centre médical, salle d'attente)
    // Dimensions idéales : 1200x800px, < 500KB
    // Emplacement : frontend/public/images/hero/hero-main.jpg
    main: {
      src: '/images/hero/hero-main.jpg',
      fallbackSrc: '/illustrations/hero/medical-care.svg',
      alt: 'Centre médical VIDA - Espace d\'accueil moderne',
      width: 1200,
      height: 800,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  SERVICES (3 cards)
  // ═══════════════════════════════════════════════════════════════════
  services: {
    // SERVICE 1 : Consultations
    // Emplacement : frontend/public/images/services/consultation.jpg
    // Dimensions : 800x600px, < 300KB
    consultation: {
      src: '/images/services/consultation.jpg',
      fallbackSrc: '/illustrations/services/doctor.svg',
      alt: 'Consultation ophtalmologique avec médecin spécialiste',
      width: 300,
      height: 200,
    },

    // SERVICE 2 : Dépistage
    // Emplacement : frontend/public/images/services/depistage.jpg
    // Dimensions : 800x600px, < 300KB
    depistage: {
      src: '/images/services/depistage.jpg',
      fallbackSrc: '/illustrations/services/vision.svg',
      alt: 'Dépistage et prévention des maladies oculaires',
      width: 300,
      height: 200,
    },

    // SERVICE 3 : Lunetterie
    // Emplacement : frontend/public/images/services/lunetterie.jpg
    // Dimensions : 800x600px, < 300KB
    lunetterie: {
      src: '/images/services/lunetterie.jpg',
      fallbackSrc: '/illustrations/services/medicine.svg',
      alt: 'Lunetterie et correction visuelle sur mesure',
      width: 300,
      height: 200,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  ÉQUIPE MÉDICALE
  // ═══════════════════════════════════════════════════════════════════
  team: {
    // Portrait médecin principal
    // Emplacement : frontend/public/images/team/doctor-1.jpg
    // Dimensions : 400x500px (portrait vertical), < 200KB
    // Style : Fond neutre/flouté, blouse blanche, souriant
    doctor1: {
      src: '/images/team/doctor-1.jpg',
      fallbackSrc: '/illustrations/services/doctor.svg',
      alt: 'Dr. [Nom] - Ophtalmologue senior',
      width: 400,
      height: 500,
    },

    // Portrait médecin 2 (optionnel)
    doctor2: {
      src: '/images/team/doctor-2.jpg',
      fallbackSrc: '/illustrations/services/doctor.svg',
      alt: 'Dr. [Nom] - Ophtalmologue',
      width: 400,
      height: 500,
    },

    // Photo équipe complète (optionnel)
    // Emplacement : frontend/public/images/team/team-group.jpg
    group: {
      src: '/images/team/team-group.jpg',
      fallbackSrc: '/illustrations/services/medical-care.svg',
      alt: 'Équipe médicale du Centre VIDA',
      width: 1200,
      height: 600,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  ÉQUIPEMENTS
  // ═══════════════════════════════════════════════════════════════════
  equipment: {
    // Photo équipement moderne (OCT, autoréfracteur, etc.)
    // Emplacement : frontend/public/images/equipment/equipment-main.jpg
    // Dimensions : 800x600px, < 400KB
    main: {
      src: '/images/equipment/equipment-main.jpg',
      fallbackSrc: '/illustrations/services/vision.svg',
      alt: 'Équipement médical de dernière génération',
      width: 800,
      height: 600,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  LOGO
  // ═══════════════════════════════════════════════════════════════════
  logo: {
    // Logo principal (couleur teal #17B8A6)
    // Emplacement : frontend/public/logo/logo.svg
    // Format : SVG préféré (vectoriel)
    main: {
      src: '/logo/logo.svg',
      alt: 'Logo Centre Médical VIDA',
      width: 200,
      height: 60,
    },

    // Logo blanc pour fonds foncés (optionnel)
    // Emplacement : frontend/public/logo/logo-white.svg
    white: {
      src: '/logo/logo-white.svg',
      alt: 'Logo Centre Médical VIDA',
      width: 200,
      height: 60,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  ANIMATIONS LOTTIE (BONUS - Effet Wow)
  // ═══════════════════════════════════════════════════════════════════
  animations: {
    // Animation œil hero
    // Emplacement : frontend/public/animations/hero-eye.json
    heroEye: '/animations/hero-eye.json',

    // Animation success (confirmation actions)
    // Emplacement : frontend/public/animations/success.json
    success: '/animations/success.json',

    // Animation loading (chargements)
    // Emplacement : frontend/public/animations/loading-medical.json
    loading: '/animations/loading-medical.json',

    // Animation calendrier (prise RDV)
    // Emplacement : frontend/public/animations/calendar.json
    calendar: '/animations/calendar.json',
  },
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *  CHECKLIST D'INTÉGRATION
 * ═══════════════════════════════════════════════════════════════════
 * 
 * PRIORITÉ 1 - Impact Maximum (Ces 3 transforment tout) :
 * ─────────────────────────────────────────────────────────────────
 * [ ] hero-main.jpg         → Photo centre/salle d'attente
 * [ ] doctor-1.jpg          → Portrait médecin principal
 * [ ] logo.svg              → Logo VIDA
 * 
 * PRIORITÉ 2 - Optimal (Résultat professionnel) :
 * ─────────────────────────────────────────────────────────────────
 * [ ] consultation.jpg      → Photo consultation
 * [ ] depistage.jpg         → Photo dépistage
 * [ ] lunetterie.jpg        → Photo espace lunetterie
 * [ ] equipment-main.jpg    → Photo équipement moderne
 * 
 * BONUS - Effet Wow (Animations fluides) :
 * ─────────────────────────────────────────────────────────────────
 * [ ] hero-eye.json         → Animation Lottie œil
 * [ ] success.json          → Animation succès
 * [ ] loading-medical.json  → Spinner médical
 * [ ] calendar.json         → Animation calendrier
 * 
 * ═══════════════════════════════════════════════════════════════════
 */
