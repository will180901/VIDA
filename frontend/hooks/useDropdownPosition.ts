import { useState, useEffect, RefObject } from 'react';
import { Z_INDEX } from '@/lib/zIndex';

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  direction: 'down' | 'up';
  alignment: 'left' | 'right' | 'center';
  zIndex: number;
}

interface UseDropdownPositionOptions {
  offset?: number;
  maxHeight?: number;
  preferredDirection?: 'down' | 'up' | 'auto';
  minSpaceRequired?: number;
}

/**
 * Hook personnalisé intelligent pour calculer la position optimale d'un dropdown
 * en utilisant position: fixed avec les coordonnées de getBoundingClientRect().
 * 
 * Fonctionnalités :
 * - Position fixed : pas affecté par overflow du parent
 * - Détection automatique de l'espace disponible (haut/bas)
 * - Ouverture vers le haut si pas assez d'espace en bas
 * - Alignement horizontal intelligent (gauche/droite/centre)
 * - Hauteur max adaptative selon l'écran
 * - Recalcul automatique au resize/scroll
 * 
 * Utilisé avec ReactDOM.createPortal pour éviter les problèmes
 * de z-index et overflow dans les modaux.
 * 
 * ✅ Solution validée : position: fixed + getBoundingClientRect()
 */
export function useDropdownPosition(
  triggerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  options: UseDropdownPositionOptions = {}
): DropdownPosition {
  const {
    offset = 8,
    maxHeight = 400,
    preferredDirection = 'auto',
    minSpaceRequired = 200,
  } = options;

  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: maxHeight,
    direction: 'down',
    alignment: 'left',
    zIndex: Z_INDEX.DROPDOWN,
  });

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculer l'espace disponible
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.left;

      // Déterminer la direction (haut ou bas)
      let direction: 'down' | 'up' = 'down';
      
      if (preferredDirection === 'auto') {
        // Si pas assez d'espace en bas ET plus d'espace en haut
        if (spaceBelow < minSpaceRequired && spaceAbove > spaceBelow) {
          direction = 'up';
        }
      } else {
        direction = preferredDirection;
      }

      // Calculer la hauteur max adaptative
      let calculatedMaxHeight = maxHeight;
      
      if (direction === 'down') {
        // Limiter à l'espace disponible en dessous (avec marge)
        calculatedMaxHeight = Math.min(maxHeight, spaceBelow - offset - 20);
      } else {
        // Limiter à l'espace disponible au-dessus (avec marge)
        calculatedMaxHeight = Math.min(maxHeight, spaceAbove - offset - 20);
      }

      // Hauteur min de 150px
      calculatedMaxHeight = Math.max(150, calculatedMaxHeight);

      // Déterminer l'alignement horizontal
      let alignment: 'left' | 'right' | 'center' = 'left';
      let left = rect.left; // ✅ Position fixed : pas besoin de scrollX

      // Si trop proche du bord droit (moins de 200px)
      if (spaceRight < 200 && rect.width < 200) {
        alignment = 'right';
        left = rect.right - rect.width; // ✅ Position fixed : pas besoin de scrollX
      }

      // Calculer la position verticale
      let top: number;
      
      if (direction === 'down') {
        top = rect.bottom + offset; // ✅ Position fixed : pas besoin de scrollY
      } else {
        // Ouvrir vers le haut
        // On ne connaît pas encore la hauteur exacte du dropdown,
        // donc on utilise la hauteur max calculée
        top = rect.top - calculatedMaxHeight - offset; // ✅ Position fixed : pas besoin de scrollY
      }

      setPosition({
        top,
        left,
        width: rect.width,
        maxHeight: calculatedMaxHeight,
        direction,
        alignment,
        zIndex: Z_INDEX.DROPDOWN,
      });
    };

    // Calculer la position initiale
    updatePosition();

    // Recalculer si la fenêtre est redimensionnée ou scrollée
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, triggerRef, offset, maxHeight, preferredDirection, minSpaceRequired]);

  return position;
}
