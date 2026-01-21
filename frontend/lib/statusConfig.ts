/**
 * Configuration centralisée des statuts de rendez-vous
 * Utilisé dans toute l'application admin pour garantir la cohérence
 */

export const statusConfig = {
  pending: {
    label: 'Nouvelle demande',
    className: 'bg-orange-500/10 text-orange-700 border border-orange-200/50',
    color: 'orange',
  },
  confirmed: {
    label: 'Confirmé',
    className: 'bg-green-500/10 text-green-700 border border-green-200/50',
    color: 'green',
  },
  awaiting_patient_response: {
    label: 'Proposition envoyée',
    className: 'bg-blue-500/10 text-blue-700 border border-blue-200/50',
    color: 'blue',
  },
  awaiting_admin_response: {
    label: 'Contre-proposition reçue',
    className: 'bg-purple-500/10 text-purple-700 border border-purple-200/50',
    color: 'purple',
  },
  rejected_by_patient: {
    label: 'Refusé par patient',
    className: 'bg-red-500/10 text-red-700 border border-red-200/50',
    color: 'red',
  },
  modification_pending: {
    label: 'Modification demandée',
    className: 'bg-amber-500/10 text-amber-700 border border-amber-200/50',
    color: 'amber',
  },
  rejected: {
    label: 'Refusé',
    className: 'bg-red-500/10 text-red-700 border border-red-200/50',
    color: 'red',
  },
  cancelled: {
    label: 'Annulé',
    className: 'bg-red-500/10 text-red-700 border border-red-200/50',
    color: 'red',
  },
  completed: {
    label: 'Terminé',
    className: 'bg-gray-500/10 text-gray-700 border border-gray-200/50',
    color: 'gray',
  },
  no_show: {
    label: 'Absent',
    className: 'bg-gray-500/10 text-gray-700 border border-gray-200/50',
    color: 'gray',
  },
} as const;

export type AppointmentStatus = keyof typeof statusConfig;
