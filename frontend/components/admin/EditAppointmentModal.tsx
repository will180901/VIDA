'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Stethoscope, Loader2 } from 'lucide-react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useToast } from '@/components/ui/Toast';
import { useUpdateAppointment } from '@/hooks/useAppointments';
import { toastMessages, extractErrorMessage } from '@/lib/toastMessages';
import Dropdown from '@/components/ui/Dropdown';
import AppointmentDateTimePicker from '@/components/ui/AppointmentDateTimePicker';

interface Appointment {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  consultation_type: 'generale' | 'specialisee';
  reason?: string;
}

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess: () => void;
}

export default function EditAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: EditAppointmentModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // ✅ Normaliser le format de l'heure dès l'initialisation
  const normalizedTime = appointment.time.substring(0, 5); // "16:00:00" → "16:00"
  
  const [formData, setFormData] = useState({
    date: appointment.date,
    time: normalizedTime,
    consultation_type: appointment.consultation_type,
    reason: appointment.reason || '',
  });
  const { showToast } = useToast();
  const updateAppointment = useUpdateAppointment();

  // Gestion de la touche Échap pour fermer le modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isUpdating) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isUpdating, onClose]);

  // Réinitialiser le formulaire quand l'appointment change
  useEffect(() => {
    if (appointment) {
      // ✅ Normaliser le format de l'heure (enlever les secondes si présentes)
      const normalizedTime = appointment.time.substring(0, 5); // "16:00:00" → "16:00"
      
      setFormData({
        date: appointment.date,
        time: normalizedTime,
        consultation_type: appointment.consultation_type,
        reason: appointment.reason || '',
      });
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUpdating(true);

    try {
      // Ne envoyer que les champs qui ont changé
      const changedData: any = {};
      
      if (formData.date !== appointment.date) {
        changedData.date = formData.date;
      }
      if (formData.time !== appointment.time) {
        changedData.time = formData.time;
      }
      if (formData.consultation_type !== appointment.consultation_type) {
        changedData.consultation_type = formData.consultation_type;
      }
      if (formData.reason !== (appointment.reason || '')) {
        changedData.reason = formData.reason;
      }

      // Si aucun changement, ne rien faire
      if (Object.keys(changedData).length === 0) {
        showToast('Aucune modification détectée', 'info');
        onClose();
        return;
      }

      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: changedData,
      });
      showToast(toastMessages.appointment.updated, 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(extractErrorMessage(error, toastMessages.error.generic), 'error');
    } finally {
      setIsUpdating(false);
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
                  Modifier le rendez-vous
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Date et Heure avec validation intelligente */}
              <AppointmentDateTimePicker
                date={formData.date}
                time={formData.time}
                onDateChange={(date) => setFormData({ ...formData, date })}
                onTimeChange={(time) => setFormData({ ...formData, time })}
                excludeAppointmentId={appointment.id}
                showCalendar={true}
                showTimeSlots={true}
                required={false}
                dateLabel="Date (optionnel)"
                timeLabel="Heure (optionnel)"
              />

              {/* Type de consultation */}
              <div>
                <label htmlFor="edit-appointment-type" className="block text-xs font-medium text-gray-700 mb-1">
                  Type de consultation (optionnel)
                </label>
                <Dropdown
                  value={formData.consultation_type}
                  onChange={(value) => setFormData({ ...formData, consultation_type: value as 'generale' | 'specialisee' })}
                  icon={<Stethoscope className="h-3.5 w-3.5" />}
                  options={[
                    { value: 'generale', label: 'Consultation générale' },
                    { value: 'specialisee', label: 'Consultation spécialisée' },
                    { value: 'suivi', label: 'Consultation de suivi' },
                    { value: 'urgence', label: 'Urgence' },
                  ]}
                  aria-label="Type de consultation"
                />
                <p className="mt-1 text-[10px] text-gray-500 italic">
                  Actuel : {formData.consultation_type === 'generale' ? 'Consultation générale' : 
                           formData.consultation_type === 'specialisee' ? 'Consultation spécialisée' :
                           formData.consultation_type === 'suivi' ? 'Consultation de suivi' : 'Urgence'}
                </p>
              </div>

              {/* Motif */}
              <div>
                <label htmlFor="edit-appointment-reason" className="block text-xs font-medium text-gray-700 mb-1">
                  Motif
                </label>
                <textarea
                  id="edit-appointment-reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Motif de la consultation..."
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors resize-none"
                  rows={3}
                  aria-label="Motif de la consultation"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={isUpdating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isUpdating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-md hover:bg-vida-teal/90 transition-colors disabled:opacity-50"
                >
                  {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isUpdating ? 'Modification...' : 'Enregistrer'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
