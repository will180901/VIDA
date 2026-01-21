/**
 * Hiérarchie des z-index de l'application VIDA
 * 
 * RÈGLES D'UTILISATION :
 * - Utiliser UNIQUEMENT ces constantes (jamais de valeurs en dur)
 * - Les valeurs sont espacées de 100 pour permettre des ajouts futurs
 * - Les dropdowns/popovers doivent TOUJOURS être > modals
 * - Ne jamais dépasser Z_INDEX.MAX sauf cas exceptionnel documenté
 * 
 * HIÉRARCHIE (du plus bas au plus haut) :
 * 1. Éléments de base (header, sidebar)
 * 2. Overlays (backdrop, modal, toast)
 * 3. Dropdowns et popovers (TOUJOURS au-dessus des modals)
 * 4. Maximum absolu (cas exceptionnels uniquement)
 * 
 * @example
 * ```tsx
 * import { Z_INDEX } from '@/lib/zIndex';
 * 
 * <div style={{ zIndex: Z_INDEX.DROPDOWN }}>
 *   Mon dropdown
 * </div>
 * ```
 */
export const Z_INDEX = {
  // ========================================
  // ÉLÉMENTS DE BASE
  // ========================================
  
  /** Éléments normaux de la page (z-index par défaut) */
  BASE: 0,
  
  /** Header du site (navigation principale) */
  HEADER: 100,
  
  /** Sidebar de l'admin */
  SIDEBAR: 200,
  
  /** Éléments sticky (tableaux, en-têtes) */
  STICKY: 300,
  
  // ========================================
  // OVERLAYS
  // ========================================
  
  /** Backdrop des modals (fond semi-transparent) */
  BACKDROP: 1000,
  
  /** Modals (fenêtres popup) */
  MODAL: 1100,
  
  /** Toasts et notifications */
  TOAST: 1200,
  
  // ========================================
  // DROPDOWNS ET POPOVERS
  // (TOUJOURS au-dessus des modals)
  // ========================================
  
  /** 
   * Dropdowns, DatePicker, TimePicker, Select
   * 
   * IMPORTANT : Valeur élevée pour garantir l'affichage
   * au-dessus de TOUS les autres éléments (y compris modals)
   */
  DROPDOWN: 2000,
  
  /** Tooltips et popovers informatifs */
  TOOLTIP: 2100,
  
  /** Menus contextuels (clic droit) */
  CONTEXT_MENU: 2200,
  
  // ========================================
  // MAXIMUM ABSOLU
  // ========================================
  
  /** 
   * Maximum absolu (cas exceptionnels uniquement)
   * 
   * ⚠️ À utiliser UNIQUEMENT pour des cas très spécifiques
   * et bien documentés (ex: debugger, overlays système)
   */
  MAX: 9999,
} as const;

/**
 * Type pour les clés de Z_INDEX
 * Permet l'autocomplétion et la validation TypeScript
 */
export type ZIndexKey = keyof typeof Z_INDEX;

/**
 * Type pour les valeurs de Z_INDEX
 */
export type ZIndexValue = typeof Z_INDEX[ZIndexKey];
