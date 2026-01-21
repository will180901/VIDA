import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilitaire pour fusionner les classes Tailwind CSS
 * Combine clsx et tailwind-merge pour éviter les conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
