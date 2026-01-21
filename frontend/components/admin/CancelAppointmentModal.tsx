'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useToast } from '@/components/ui/Toast';
import { useCancelAppointment } from '@/hooks/useAppointments';
import { toastMessages, extractErrorMessage } from '@/lib/toastMessages';
import { dateFormats } from '@/lib/utils';

interface Appointment {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  date: string;
  time: string;
  status: string;
}

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess: () => void;
}

export default function CancelAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: CancelAppointmentModalProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const { showToast } = useToast();
  const cancelAppointment = useCancelAppointment();

  // Gestion de la touche Échap pour fermer le modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCancelling) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isCancelling, onClose]);

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      showToast('Veuillez indiquer la raison de l\'annulation', 'error');
      return;
    }

    setIsCancelling(true);

    try {
      await cancelAppointment.mutateAsync({
        id: appointment.id,
        reason: cancellationReason,
      });
      showToast(toastMessages.appointment.cancelled, 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(extractErrorMessage(error, toastMessages.error.generic), 'error');
    } finally {
      setIsCancelling(false);
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
            className="relative bg-white/90 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-md border border-white/20"
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 font-heading">
                    Annuler le rendez-vous
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Le patient sera notifié
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isCancelling}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-gray-700 mb-2">
                  Vous êtes sur le point d'annuler ce rendez-vous :
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-900">
                    Patient : {appointment.patient_first_name} {appointment.patient_last_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Date : {dateFormats.withTime(appointment.date, appointment.time)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Raison de l'annulation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Ex: Fermeture exceptionnelle, urgence, indisponibilité du médecin..."
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-orange-500/30 transition-colors resize-none"
                  rows={4}
                  autoFocus
                />
                <p className="mt-1 text-[10px] text-gray-500">
                  Cette raison sera communiquée au patient par email.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-800">
                  ℹ️ Un email d'annulation sera automatiquement envoyé au patient avec la raison indiquée.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={isCancelling}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isCancelling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isCancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
