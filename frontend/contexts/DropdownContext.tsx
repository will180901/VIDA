'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

/**
 * Contexte global pour gérer l'état des dropdowns
 * 
 * OBJECTIF :
 * - N'autoriser qu'un seul dropdown ouvert à la fois
 * - Éviter les conflits de z-index entre dropdowns
 * - Améliorer l'UX (pas de confusion avec plusieurs dropdowns ouverts)
 * 
 * UTILISATION :
 * 1. Wrapper l'app avec <DropdownProvider>
 * 2. Dans chaque composant dropdown, utiliser useDropdownContext()
 * 3. Appeler registerDropdown() pour obtenir un ID unique
 * 4. Utiliser openDropdown(id) et closeDropdown() pour gérer l'état
 * 
 * @example
 * ```tsx
 * // Dans _app.tsx ou layout.tsx
 * <DropdownProvider>
 *   <App />
 * </DropdownProvider>
 * 
 * // Dans un composant dropdown
 * const { openDropdownId, openDropdown, closeDropdown, registerDropdown } = useDropdownContext();
 * const dropdownId = registerDropdown();
 * const isOpen = openDropdownId === dropdownId;
 * 
 * const toggle = () => {
 *   if (isOpen) {
 *     closeDropdown();
 *   } else {
 *     openDropdown(dropdownId);
 *   }
 * };
 * ```
 */

interface DropdownContextType {
  /** ID du dropdown actuellement ouvert (null si aucun) */
  openDropdownId: string | null;
  
  /** Ouvrir un dropdown (ferme automatiquement les autres) */
  openDropdown: (id: string) => void;
  
  /** Fermer le dropdown actuellement ouvert */
  closeDropdown: () => void;
  
  /** Enregistrer un nouveau dropdown et obtenir un ID unique */
  registerDropdown: () => string;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

let dropdownCounter = 0;

/**
 * Provider pour le contexte des dropdowns
 * 
 * À placer au niveau racine de l'application
 */
export function DropdownProvider({ children }: { children: ReactNode }) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  /**
   * Ouvrir un dropdown
   * Ferme automatiquement le dropdown précédemment ouvert
   */
  const openDropdown = useCallback((id: string) => {
    setOpenDropdownId(id);
  }, []);

  /**
   * Fermer le dropdown actuellement ouvert
   */
  const closeDropdown = useCallback(() => {
    setOpenDropdownId(null);
  }, []);

  /**
   * Enregistrer un nouveau dropdown et obtenir un ID unique
   * 
   * Utilise un compteur global pour garantir l'unicité
   */
  const registerDropdown = useCallback(() => {
    dropdownCounter += 1;
    return `dropdown-${dropdownCounter}`;
  }, []);

  return (
    <DropdownContext.Provider
      value={{
        openDropdownId,
        openDropdown,
        closeDropdown,
        registerDropdown,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte des dropdowns
 * 
 * @throws {Error} Si utilisé en dehors d'un DropdownProvider
 * 
 * @example
 * ```tsx
 * const { openDropdownId, openDropdown, closeDropdown, registerDropdown } = useDropdownContext();
 * ```
 */
export function useDropdownContext() {
  const context = useContext(DropdownContext);
  
  if (!context) {
    throw new Error(
      'useDropdownContext must be used within a DropdownProvider. ' +
      'Make sure to wrap your app with <DropdownProvider>.'
    );
  }
  
  return context;
}
