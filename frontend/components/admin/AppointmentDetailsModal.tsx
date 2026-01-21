'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Mail, Phone, FileText, CheckCircle, XCircle } from 'lucide-react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface Appointment {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  consultation_type: string;
  status: string;
  reason?: string;
  notes_staff?: string;
  created_at: string;
}

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onUpdate: () => void;
}

const statusConfig = {
  pending: { label: 'En attente', color: 'orange' },
  confirmed: { label: 'Confirmé', color: 'green' },
  cancelled: { label: 'Annulé', color: 'red' },
  completed: { label: 'Terminé', color: 'gray' },
  no_show: { label: 'Absent', color: 'gray' },
};

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onUpdate,
}: AppointmentDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState(appointment.notes_staff || '');
  const { showToast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await api.patch(`/appointments/appointments/${appointment.id}/`, {
        status: newStatus,
      });
      showToast(`Rendez-vous ${statusConfig[newStatus as keyof typeof statusConfig].label.toLowerCase()}`, 'success');
      onUpdate();
      onClose();
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      await api.patch(`/appointments/appointments/${appointment.id}/`, {
        notes_staff: notes,
      });
      showToast('Notes enregistrées', 'success');
      onUpdate();
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.pending;

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
            className="relative bg-white/90 backdrop-blur-sm rounded-lg shadow-xl max-w-2xl w-full border border-white/20 flex flex-col max-h-[90vh]"
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 font-heading">
                  Détails du rendez-vous
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  RDV #{appointment.id}
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
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-lg p-3 vida-grain">
                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-vida-teal" />
                  Informations patient
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Nom complet</p>
                    <p className="text-xs font-medium text-gray-900">
                      {appointment.patient_first_name} {appointment.patient_last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Téléphone</p>
                    <p className="text-xs font-medium text-gray-900 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {appointment.patient_phone}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-600 mb-0.5">Email</p>
                    <p className="text-xs font-medium text-gray-900 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {appointment.patient_email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-3 vida-grain">
                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-vida-teal" />
                  Détails du rendez-vous
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Date</p>
                    <p className="text-xs font-medium text-gray-900">
                      {new Date(appointment.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Heure</p>
                    <p className="text-xs font-medium text-gray-900 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appointment.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Type de consultation</p>
                    <p className="text-xs font-medium text-gray-900">
                      {appointment.consultation_type === 'generale' ? 'Consultation générale' : 'Consultation spécialisée'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Statut</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-${status.color}-500/10 text-${status.color}-700 border border-${status.color}-200/50`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {appointment.reason && (
                <div className="bg-gray-50 rounded-lg p-3 vida-grain">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-vida-teal" />
                    Motif de consultation
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {appointment.reason}
                  </p>
                </div>
              )}

              {/* Staff Notes */}
              <div className="bg-gray-50 rounded-lg p-3 vida-grain">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">
                  Notes internes
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajouter des notes internes..."
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="mt-2 px-3 py-1.5 text-[10px] font-medium text-gray-700 bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-md hover:bg-gray-900/10 transition-colors disabled:opacity-50"
                >
                  Enregistrer les notes
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            {appointment.status === 'pending' && (
              <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Confirmer
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Annuler
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
