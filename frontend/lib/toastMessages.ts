/**
 * Messages de toast standardisés pour l'application
 */

export const toastMessages = {
  // Rendez-vous
  appointment: {
    created: 'Rendez-vous créé avec succès',
    updated: 'Rendez-vous modifié avec succès',
    deleted: 'Rendez-vous supprimé avec succès',
    cancelled: 'Rendez-vous annulé avec succès',
    confirmed: 'Rendez-vous confirmé avec succès',
    rejected: 'Rendez-vous refusé',
    completed: 'Rendez-vous marqué comme terminé',
    noShow: 'Patient marqué comme absent',
  },
  
  // Propositions
  proposal: {
    sent: 'Proposition envoyée au patient',
    accepted: 'Proposition acceptée',
    rejected: 'Proposition refusée',
    counterProposalAccepted: 'Contre-proposition acceptée',
    counterProposalRejected: 'Contre-proposition refusée',
  },
  
  // Modifications
  modification: {
    requested: 'Demande de modification envoyée',
    accepted: 'Demande de modification acceptée',
    rejected: 'Demande de modification refusée',
  },
  
  // Erreurs
  error: {
    generic: 'Une erreur est survenue. Veuillez réessayer.',
    network: 'Erreur de connexion. Vérifiez votre connexion internet.',
    unauthorized: 'Vous n\'êtes pas autorisé à effectuer cette action.',
    notFound: 'Ressource introuvable.',
    validation: 'Veuillez vérifier les informations saisies.',
    slotTaken: 'Ce créneau est déjà réservé.',
    tooLate: 'Impossible de modifier moins de 24h avant le rendez-vous.',
  },
  
  // Validation
  validation: {
    requiredField: 'Ce champ est obligatoire.',
    invalidEmail: 'Email invalide.',
    invalidPhone: 'Numéro de téléphone invalide.',
    invalidDate: 'Date invalide.',
    pastDate: 'La date ne peut pas être dans le passé.',
    slotUnavailable: 'Ce créneau n\'est pas disponible.',
  },
  
  // Notes
  notes: {
    saved: 'Notes enregistrées',
    updated: 'Notes mises à jour',
  },
};

/**
 * Extraire un message d'erreur depuis une réponse API
 */
export const extractErrorMessage = (error: any, fallback: string = toastMessages.error.generic): string => {
  if (!error) return fallback;
  
  // Erreur réseau
  if (!error.response) {
    return toastMessages.error.network;
  }
  
  const { status, data } = error.response;
  
  // Erreurs HTTP standards
  if (status === 401 || status === 403) {
    return toastMessages.error.unauthorized;
  }
  
  if (status === 404) {
    return toastMessages.error.notFound;
  }
  
  // Messages d'erreur du backend
  if (data?.error) {
    return data.error;
  }
  
  if (data?.detail) {
    return data.detail;
  }
  
  // Erreurs de validation
  if (data?.date?.[0]) {
    return data.date[0];
  }
  
  if (data?.time?.[0]) {
    return data.time[0];
  }
  
  if (data?.non_field_errors?.[0]) {
    return data.non_field_errors[0];
  }
  
  return fallback;
};
