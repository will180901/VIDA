/**
 * Configuration centralisée des types de consultation
 * Synchronisé avec backend/apps/appointments/models.py
 * 
 * NOTE: Les prix sont des valeurs par défaut.
 * Utiliser useConsultationFees() pour obtenir les prix dynamiques depuis l'API.
 */

export const CONSULTATION_TYPES = {
  generale: {
    label: 'Consultation générale',
    shortLabel: 'Générale',
    color: 'blue',
    price: 15000, // Prix par défaut
    description: 'Examen médical standard',
  },
  specialisee: {
    label: 'Consultation spécialisée',
    shortLabel: 'Spécialisée',
    color: 'purple',
    price: 25000, // Prix par défaut
    description: 'Examen approfondi avec spécialiste',
  },
  suivi: {
    label: 'Consultation de suivi',
    shortLabel: 'Suivi',
    color: 'green',
    price: 10000, // Prix par défaut
    description: 'Pour les patients déjà suivis',
  },
  urgence: {
    label: 'Urgence',
    shortLabel: 'Urgence',
    color: 'red',
    price: 30000, // Prix par défaut
    description: 'Prise en charge rapide',
  },
} as const;

export type ConsultationType = keyof typeof CONSULTATION_TYPES;

/**
 * Retourne le label d'un type de consultation
 * @param type - Type de consultation
 * @param short - Si true, retourne le label court
 * @returns Label du type de consultation
 */
export function getConsultationTypeLabel(type: string, short = false): string {
  const consultationType = CONSULTATION_TYPES[type as ConsultationType];
  if (!consultationType) return type;
  return short ? consultationType.shortLabel : consultationType.label;
}

/**
 * Retourne la couleur associée à un type de consultation
 * @param type - Type de consultation
 * @returns Couleur (blue, purple, green, red, gray)
 */
export function getConsultationTypeColor(type: string): string {
  const consultationType = CONSULTATION_TYPES[type as ConsultationType];
  return consultationType?.color || 'gray';
}

/**
 * Retourne le prix d'un type de consultation
 * @param type - Type de consultation
 * @param dynamicPrices - Prix dynamiques depuis l'API (optionnel)
 * @returns Prix en FCFA
 */
export function getConsultationTypePrice(type: string, dynamicPrices?: Record<string, number>): number {
  // Si des prix dynamiques sont fournis, les utiliser en priorité
  if (dynamicPrices && dynamicPrices[type]) {
    return dynamicPrices[type];
  }
  
  // Sinon, utiliser les prix par défaut
  const consultationType = CONSULTATION_TYPES[type as ConsultationType];
  return consultationType?.price || 0;
}

/**
 * Retourne la description d'un type de consultation
 * @param type - Type de consultation
 * @returns Description
 */
export function getConsultationTypeDescription(type: string): string {
  const consultationType = CONSULTATION_TYPES[type as ConsultationType];
  return consultationType?.description || '';
}

/**
 * Retourne toutes les options pour un dropdown
 * @returns Array d'options {value, label}
 */
export function getConsultationTypeOptions() {
  return Object.entries(CONSULTATION_TYPES).map(([value, config]) => ({
    value,
    label: config.label,
  }));
}

/**
 * Formate le prix en FCFA
 * @param price - Prix en FCFA
 * @returns Prix formaté
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-FR')} FCFA`;
}
