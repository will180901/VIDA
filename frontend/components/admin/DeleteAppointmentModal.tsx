'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useToast } from '@/components/ui/Toast';
import { useDeleteAppointment } from '@/hooks/useAppointments';
import { toastMessages, extractErrorMessage } from '@/lib/toastMessages';

interface Appointment {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string;
  date: string;
  time: string;
  status: string;
  confirmed_at?: string;
}

interface DeleteAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess: () => void;
}

export default function DeleteAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: DeleteAppointmentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  // Gestion de la touche Échap pour fermer le modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isDeleting, onClose]);
  const deleteAppointment = useDeleteAppointment();

  // Calculer le temps jusqu'au RDV
  const getTimeUntilAppointment = () => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntil < 0) return { isPast: true, hours: 0 };
    if (hoursUntil < 24) return { isPast: false, hours: hoursUntil, isUrgent: true };
    return { isPast: false, hours: hoursUntil, isUrgent: false };
  };

  const timeInfo = getTimeUntilAppointment();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteAppointment.mutateAsync(appointment.id);
      showToast(toastMessages.appointment.deleted, 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(extractErrorMessage(error, toastMessages.error.generic), 'error');
    } finally {
      setIsDeleting(false);
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 font-heading">
                    Supprimer le rendez-vous
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Cette action est irréversible
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-xs text-gray-700 mb-2">
                  Êtes-vous sûr de vouloir supprimer ce rendez-vous ?
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-900">
                    Patient : {appointment.patient_first_name} {appointment.patient_last_name}
                  </p>
                  {appointment.patient_email && (
                    <p className="text-xs text-gray-600">
                      Email : {appointment.patient_email}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">
                    Date : {new Date(appointment.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })} à {appointment.time}
                  </p>
                  {appointment.confirmed_at && (
                    <p className="text-xs text-gray-600">
                      Confirmé le : {new Date(appointment.confirmed_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>

              {/* Avertissement si RDV dans moins de 24h */}
              {!timeInfo.isPast && timeInfo.isUrgent && (
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-xs font-semibold text-orange-800 mb-1">
                    ⚠️ Attention : Rendez-vous dans moins de 24h !
                  </p>
                  <p className="text-xs text-orange-700">
                    Ce rendez-vous est prévu dans {Math.round(timeInfo.hours)} heure(s). 
                    Assurez-vous de contacter le patient immédiatement.
                  </p>
                </div>
              )}

              {/* Avertissement si RDV passé */}
              {timeInfo.isPast && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-700">
                    ℹ️ Ce rendez-vous est déjà passé.
                  </p>
                </div>
              )}

              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <p className="text-xs text-amber-800">
                  ⚠️ Le patient ne sera pas notifié de cette suppression. Assurez-vous de le contacter si nécessaire.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
