'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Edit, AlertCircle } from 'lucide-react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useState } from 'react';
import { useModifyAppointment } from '@/hooks/useAppointments';
import { useToast } from '@/components/ui/Toast';
import AppointmentDateTimePicker from '@/components/ui/AppointmentDateTimePicker';

interface ModifyAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    date: string;
    time: string;
    consultation_type: string;
  };
  onSuccess: () => void;
}

export default function ModifyAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: ModifyAppointmentModalProps) {
  const [newDate, setNewDate] = useState(appointment.date);
  const [newTime, setNewTime] = useState(appointment.time);
  const [reason, setReason] = useState('');
  
  const modifyMutation = useModifyAppointment();
  const { showToast } = useToast();

  // Vérifier le délai de 24h
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const now = new Date();
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canModify = hoursUntilAppointment >= 24;

  const handleSubmit = async () => {
    if (!newDate || !newTime) {
      showToast('Veuillez sélectionner une date et une heure', 'error');
      return;
    }

    if (newDate === appointment.date && newTime === appointment.time) {
      showToast('Veuillez choisir une date ou heure différente', 'error');
      return;
    }

    try {
      await modifyMutation.mutateAsync({
        id: appointment.id,
        newDate,
        newTime,
        reason,
      });
      showToast('Demande de modification envoyée', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.new_date?.[0] || 
                       error.response?.data?.error || 
                       'Erreur lors de la modification';
      showToast(errorMsg, 'error');
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
            className="relative bg-white/90 backdrop-blur-sm rounded-lg shadow-xl max-w-lg w-full border border-white/20 flex flex-col max-h-[90vh]"
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 font-heading flex items-center gap-2">
                  <Edit className="h-4 w-4 text-vida-teal" />
                  Modifier le rendez-vous
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Proposez une nouvelle date et heure
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!canModify ? (
                /* Délai dépassé */
                <div className="bg-red-50 rounded-lg p-4 vida-grain border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 mb-2">
                        Modification impossible
                      </h4>
                      <p className="text-xs text-red-700 mb-3 leading-relaxed">
                        Le délai de 24 heures avant votre rendez-vous est dépassé. 
                        Pour toute modification, veuillez contacter directement la clinique.
                      </p>
                      <div className="bg-white/50 rounded p-3 space-y-1">
                        <p className="text-xs font-medium text-gray-900">
                          📞 Téléphone : <span className="text-vida-teal">06 XXX XX XX</span>
                        </p>
                        <p className="text-xs font-medium text-gray-900">
                          📧 Email : <span className="text-vida-teal">contact@vida-clinic.fr</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Formulaire de modification */
                <>
                  {/* Current appointment */}
                  <div className="bg-gray-50 rounded-lg p-3 vida-grain border border-gray-200">
                    <p className="text-[10px] font-semibold text-gray-700 mb-2 uppercase">
                      Rendez-vous actuel
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-900">
                        <Calendar className="h-3.5 w-3.5 text-gray-600" />
                        <span>{new Date(appointment.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-900">
                        <Clock className="h-3.5 w-3.5 text-gray-600" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* New date/time */}
                  <div className="bg-blue-50 rounded-lg p-4 vida-grain border border-blue-200 space-y-3">
                    <p className="text-xs font-semibold text-gray-900">
                      Nouvelle date et heure souhaitées
                    </p>

                    <AppointmentDateTimePicker
                      date={newDate}
                      time={newTime}
                      onDateChange={setNewDate}
                      onTimeChange={setNewTime}
                      showCalendar={true}
                      showTimeSlots={true}
                      required={true}
                      dateLabel="Date"
                      timeLabel="Heure"
                    />

                    <div>
                      <label className="block text-[10px] font-medium text-gray-700 mb-1">
                        Raison de la modification (optionnel)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Empêchement professionnel..."
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-amber-50 rounded-lg p-3 vida-grain border border-amber-200">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      <span>
                        Votre demande sera envoyée à la clinique pour validation. 
                        Vous recevrez une notification par email.
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {canModify && (
              <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={modifyMutation.isPending}
                  className="px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-md hover:bg-vida-teal/90 transition-colors disabled:opacity-50"
                >
                  {modifyMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
