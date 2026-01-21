'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, XCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useState } from 'react';
import { useCancelAppointment } from '@/hooks/useAppointments';
import { useToast } from '@/components/ui/Toast';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    date: string;
    time: string;
  };
  onSuccess: () => void;
}

export default function CancelAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState('');
  
  const cancelMutation = useCancelAppointment();
  const { showToast } = useToast();

  // Vérifier le délai de 24h
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const now = new Date();
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursUntilAppointment >= 24;

  const handleSubmit = async () => {
    try {
      await cancelMutation.mutateAsync({
        id: appointment.id,
        reason: reason || undefined,
      });
      showToast('Rendez-vous annulé avec succès', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de l\'annulation';
      showToast(errorMsg, 'error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          <motion.div
            className="relative bg-white/90 backdrop-blur-sm rounded-lg shadow-xl max-w-lg w-full border border-white/20"
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 font-heading flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Annuler le rendez-vous
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {!canCancel ? (
                <div className="bg-red-50 rounded-lg p-4 vida-grain border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 mb-2">
                        Annulation impossible
                      </h4>
                      <p className="text-xs text-red-700 mb-3 leading-relaxed">
                        Le délai de 24 heures avant votre rendez-vous est dépassé. 
                        Pour annuler, veuillez contacter directement la clinique.
                      </p>
                      <div className="bg-white/50 rounded p-3 space-y-1">
                        <p className="text-xs font-medium text-gray-900 flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-vida-teal" />
                          <span className="text-vida-teal">06 XXX XX XX</span>
                        </p>
                        <p className="text-xs font-medium text-gray-900 flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-vida-teal" />
                          <span className="text-vida-teal">contact@vida-clinic.fr</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-amber-50 rounded-lg p-3 vida-grain border border-amber-200">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      <span>
                        Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Raison de l'annulation (optionnel)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Ex: Empêchement de dernière minute..."
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-red-500/30 transition-colors resize-none"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>

            {canCancel && (
              <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={cancelMutation.isPending}
                  className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelMutation.isPending ? 'Annulation...' : 'Confirmer l\'annulation'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
