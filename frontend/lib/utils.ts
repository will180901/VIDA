import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilitaire pour fusionner les classes Tailwind CSS
 * Combine clsx et tailwind-merge pour éviter les conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats de dates standardisés pour toute l'application
 */
export const dateFormats = {
  /**
   * Format court : "15 janv. 2026"
   * Usage : Listes, tableaux, aperçus
   */
  short: (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  },

  /**
   * Format long : "mercredi 15 janvier 2026"
   * Usage : Détails, modaux, confirmations
   */
  long: (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  },

  /**
   * Format avec heure : "15 janv. 2026 à 14:30"
   * Usage : Historique, logs, timestamps
   */
  withTime: (date: string | Date, time?: string) => {
    const dateStr = new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return time ? `${dateStr} à ${time}` : dateStr;
  },

  /**
   * Format relatif : "Il y a 2 heures", "Dans 3 jours"
   * Usage : Notifications, activité récente
   */
  relative: (date: string | Date) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      // Passé
      const absDays = Math.abs(diffDays);
      const absHours = Math.abs(diffHours);
      const absMins = Math.abs(diffMins);

      if (absDays > 7) return dateFormats.short(date);
      if (absDays > 0) return `Il y a ${absDays} jour${absDays > 1 ? 's' : ''}`;
      if (absHours > 0) return `Il y a ${absHours} heure${absHours > 1 ? 's' : ''}`;
      if (absMins > 0) return `Il y a ${absMins} minute${absMins > 1 ? 's' : ''}`;
      return 'À l\'instant';
    } else {
      // Futur
      if (diffDays > 7) return dateFormats.short(date);
      if (diffDays > 0) return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      if (diffHours > 0) return `Dans ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
      if (diffMins > 0) return `Dans ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
      return 'Maintenant';
    }
  },

  /**
   * Format ISO pour les inputs : "2026-01-15"
   * Usage : Inputs date HTML
   */
  iso: (date: string | Date) => {
    return new Date(date).toISOString().split('T')[0];
  },
}
