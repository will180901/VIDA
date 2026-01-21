'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle, XCircle, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useToast } from '@/components/ui/Toast';
import { useUpdateAppointment } from '@/hooks/useAppointments';
import { toastMessages, extractErrorMessage } from '@/lib/toastMessages';
import { dateFormats } from '@/lib/utils';
import { useDateTimeValidation } from '@/hooks/useDateTimeValidation';
import api from '@/lib/api';

interface Appointment {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  date: string;
  time: string;
  proposed_date?: string;
  proposed_time?: string;
  consultation_type: string;
  reason?: string;
  patient_message?: string;
}

interface ModifyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess: () => void;
}

export default function ModifyRequestModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: ModifyRequestModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedAction, setSelectedAction] = useState<'accept' | 'reject' | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const { showToast } = useToast();
  const updateAppointment = useUpdateAppointment();
  const { isDateAvailable, getDateErrorMessage } = useDateTimeValidation({ excludeAppointmentId: appointment.id });

  // Valider la date proposée quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && appointment.proposed_date) {
      const proposedDate = new Date(appointment.proposed_date + 'T00:00:00');
      
      // Vérifier si la date est valide
      if (!isDateAvailable(proposedDate)) {
        const errorMsg = getDateErrorMessage(proposedDate);
        setValidationError(errorMsg || 'Cette date n\'est pas disponible');
      } else {
        // Vérifier la disponibilité du créneau
        checkSlotAvailability();
      }
    }
  }, [isOpen, appointment.proposed_date, appointment.proposed_time]);

  const checkSlotAvailability = async () => {
    if (!appointment.proposed_date || !appointment.proposed_time) return;

    setIsCheckingAvailability(true);
    setValidationError(null);

    try {
      const response = await api.get(`/appointments/appointments/`, {
        params: { date: appointment.proposed_date }
      });

      const appointments = Array.isArray(response.data) ? response.data : response.data.results || [];
      
      const conflictingAppointment = appointments.find((apt: any) => 
        apt.id !== appointment.id &&
        apt.date === appointment.proposed_date && 
        apt.time === appointment.proposed_time &&
        ['pending', 'confirmed', 'awaiting_patient_response', 'awaiting_admin_response', 'modification_pending'].includes(apt.status)
      );

      if (conflictingAppointment) {
        setValidationError('Ce créneau est déjà réservé par un autre patient.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleAccept = async () => {
    // Vérifier s'il y a une erreur de validation
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: {
          date: appointment.proposed_date,
          time: appointment.proposed_time,
          status: 'confirmed',
        },
      });
      showToast(toastMessages.appointment.updated, 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(extractErrorMessage(error, toastMessages.error.generic), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast('Veuillez indiquer la raison du refus', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: {
          status: 'confirmed',
          notes_staff: `Modification refusée : ${rejectionReason}`,
        },
      });
      showToast('Demande de modification refusée', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(extractErrorMessage(error, toastMessages.error.generic), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white/90 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-lg border border-white/20"
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 font-heading">
                  Demande de modification
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {appointment.patient_first_name} {appointment.patient_last_name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Comparaison des dates */}
              <div className="grid grid-cols-2 gap-3">
                {/* Date actuelle */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">
                    Rendez-vous actuel
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{dateFormats.short(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                </div>

                {/* Flèche de changement */}
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-amber-600" />
                </div>

                {/* Nouvelle date proposée */}
                <div className={`rounded-lg p-3 border col-span-2 ${
                  validationError 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">
                    Nouvelle date demandée par le patient
                  </h4>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-xs font-medium ${
                      validationError ? 'text-red-800' : 'text-amber-800'
                    }`}>
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{appointment.proposed_date ? dateFormats.short(appointment.proposed_date) : 'Non spécifiée'}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-medium ${
                      validationError ? 'text-red-800' : 'text-amber-800'
                    }`}>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{appointment.proposed_time || 'Non spécifiée'}</span>
                    </div>
                    {appointment.patient_message && (
                      <div className={`mt-2 pt-2 border-t ${
                        validationError ? 'border-red-200' : 'border-amber-200'
                      }`}>
                        <p className="text-[10px] text-gray-600 mb-0.5">Message du patient :</p>
                        <p className="text-xs text-gray-700 italic">"{appointment.patient_message}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Alerte de validation */}
              {isCheckingAvailability && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <p className="text-xs text-blue-800">Vérification de la disponibilité...</p>
                </motion.div>
              )}

              {!isCheckingAvailability && validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 rounded-lg p-3 border border-red-200 flex items-start gap-2"
                >
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-red-800 font-semibold mb-1">⚠️ Date invalide</p>
                    <p className="text-xs text-red-700">{validationError}</p>
                    <p className="text-[10px] text-red-600 mt-1 italic">
                      Vous devez refuser cette demande et proposer une autre date au patient.
                    </p>
                  </div>
                </motion.div>
              )}

              {!isCheckingAvailability && !validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 rounded-lg p-3 border border-green-200 flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-800">✓ Cette date est disponible</p>
                </motion.div>
              )}

              {!selectedAction && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-3">
                    Que souhaitez-vous faire ?
                  </p>
                  
                  <button
                    onClick={() => setSelectedAction('accept')}
                    disabled={!!validationError}
                    className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${
                      validationError
                        ? 'bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed'
                        : 'bg-green-50 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      validationError ? 'bg-gray-400' : 'bg-green-500'
                    }`}>
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">Accepter la modification</p>
                      <p className="text-[10px] text-gray-600">
                        {validationError ? 'Date invalide - impossible d\'accepter' : 'Confirmer la nouvelle date/heure'}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedAction('reject')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">Refuser la modification</p>
                      <p className="text-[10px] text-gray-600">Garder le rendez-vous actuel</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Accept Confirmation */}
              {selectedAction === 'accept' && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">
                    Confirmer l'acceptation
                  </h4>
                  <p className="text-xs text-gray-700 mb-4">
                    Le patient sera notifié par email de la confirmation de la nouvelle date.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAccept}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {isProcessing ? 'Traitement...' : 'Accepter'}
                    </button>
                    <button
                      onClick={() => setSelectedAction(null)}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {selectedAction === 'reject' && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200 space-y-3">
                  <h4 className="text-xs font-semibold text-gray-900">
                    Refuser la modification
                  </h4>
                  
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Raison du refus <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ex: Créneau non disponible, trop court délai..."
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-red-500/30 transition-colors resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {isProcessing ? 'Traitement...' : 'Refuser'}
                    </button>
                    <button
                      onClick={() => setSelectedAction(null)}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
