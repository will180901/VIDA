'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle, XCircle, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useState } from 'react';
import { useRespondToAppointment } from '@/hooks/useAppointments';
import { useToast } from '@/components/ui/Toast';
import AppointmentDateTimePicker from '@/components/ui/AppointmentDateTimePicker';
import Dropdown from '@/components/ui/Dropdown';

interface Appointment {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  consultation_type: string;
  consultation_type_display: string;
  reason?: string;
}

interface RespondModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess: () => void;
}

export default function RespondModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: RespondModalProps) {
  const [selectedAction, setSelectedAction] = useState<'accept' | 'reject' | 'propose' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [proposedType, setProposedType] = useState(appointment.consultation_type);
  const [adminMessage, setAdminMessage] = useState('');
  
  const respondMutation = useRespondToAppointment();
  const { showToast } = useToast();

  const handleAccept = async () => {
    try {
      await respondMutation.mutateAsync({
        id: appointment.id,
        action: 'accept',
        data: {},
      });
      showToast('Rendez-vous confirmé avec succès', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erreur lors de la confirmation', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast('Veuillez indiquer la raison du refus', 'error');
      return;
    }

    try {
      await respondMutation.mutateAsync({
        id: appointment.id,
        action: 'reject',
        data: {
          rejection_reason: rejectionReason,
          admin_message: adminMessage,
        },
      });
      showToast('Rendez-vous refusé', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erreur lors du refus', 'error');
    }
  };

  const handlePropose = async () => {
    if (!proposedDate || !proposedTime) {
      showToast('Veuillez sélectionner une date et une heure', 'error');
      return;
    }

    try {
      await respondMutation.mutateAsync({
        id: appointment.id,
        action: 'propose',
        data: {
          proposed_date: proposedDate,
          proposed_time: proposedTime,
          proposed_consultation_type: proposedType,
          admin_message: adminMessage,
        },
      });
      showToast('Proposition envoyée au patient', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.proposed_date?.[0] || 
                       error.response?.data?.error || 
                       'Erreur lors de l\'envoi de la proposition';
      showToast(errorMsg, 'error');
    }
  };

  const resetForm = () => {
    setSelectedAction(null);
    setRejectionReason('');
    setProposedDate('');
    setProposedTime('');
    setProposedType(appointment.consultation_type);
    setAdminMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
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
                  Répondre à la demande de RDV
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {appointment.patient_first_name} {appointment.patient_last_name}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content - ✅ Retiré overflow-y-auto pour permettre aux dropdowns de s'afficher */}
            <div className="flex-1 p-4 space-y-4" style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
              {/* Appointment Summary */}
              <div className="bg-amber-50 rounded-lg p-3 vida-grain border border-amber-200/50">
                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  Demande du patient
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Date demandée</p>
                    <p className="text-xs font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(appointment.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Heure</p>
                    <p className="text-xs font-medium text-gray-900 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appointment.time}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-600 mb-0.5">Type de consultation</p>
                    <p className="text-xs font-medium text-gray-900">
                      {appointment.consultation_type_display}
                    </p>
                  </div>
                  {appointment.reason && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-600 mb-0.5">Motif</p>
                      <p className="text-xs text-gray-700">{appointment.reason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!selectedAction && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-3">
                    Choisissez une action :
                  </p>
                  
                  <button
                    onClick={() => setSelectedAction('accept')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">Accepter le rendez-vous</p>
                      <p className="text-[10px] text-gray-600">Confirmer la date et l'heure demandées</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedAction('reject')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">Refuser le rendez-vous</p>
                      <p className="text-[10px] text-gray-600">Décliner la demande avec une raison</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedAction('propose')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">Proposer une alternative</p>
                      <p className="text-[10px] text-gray-600">Suggérer une autre date ou heure</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Accept Confirmation */}
              {selectedAction === 'accept' && (
                <div className="bg-green-50 rounded-lg p-4 vida-grain border border-green-200">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">
                    Confirmer le rendez-vous
                  </h4>
                  <p className="text-xs text-gray-700 mb-4">
                    Le patient recevra un email de confirmation avec tous les détails du rendez-vous.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAccept}
                      disabled={respondMutation.isPending}
                      className="flex-1 px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {respondMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {respondMutation.isPending ? 'Confirmation...' : 'Confirmer'}
                    </button>
                    <button
                      onClick={resetForm}
                      disabled={respondMutation.isPending}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {selectedAction === 'reject' && (
                <div className="bg-red-50 rounded-lg p-4 vida-grain border border-red-200 space-y-3">
                  <h4 className="text-xs font-semibold text-gray-900">
                    Refuser le rendez-vous
                  </h4>
                  
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Raison du refus <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ex: Créneau non disponible, fermeture exceptionnelle..."
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-red-500/30 transition-colors resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Message personnalisé (optionnel)
                    </label>
                    <textarea
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="Message supplémentaire pour le patient..."
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-red-500/30 transition-colors resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={respondMutation.isPending}
                      className="flex-1 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {respondMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {respondMutation.isPending ? 'Envoi...' : 'Confirmer le refus'}
                    </button>
                    <button
                      onClick={resetForm}
                      disabled={respondMutation.isPending}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              )}

              {/* Propose Form */}
              {selectedAction === 'propose' && (
                <div className="bg-blue-50 rounded-lg p-4 vida-grain border border-blue-200 space-y-3" style={{ overflow: 'visible' }}>
                  <h4 className="text-xs font-semibold text-gray-900">
                    Proposer une alternative
                  </h4>

                  <AppointmentDateTimePicker
                    date={proposedDate}
                    time={proposedTime}
                    onDateChange={setProposedDate}
                    onTimeChange={setProposedTime}
                    showCalendar={true}
                    showTimeSlots={true}
                    required={true}
                    dateLabel="Nouvelle date"
                    timeLabel="Nouveau créneau"
                  />

                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Type de consultation
                    </label>
                    <Dropdown
                      value={proposedType}
                      onChange={setProposedType}
                      options={[
                        { value: 'generale', label: 'Consultation générale' },
                        { value: 'specialisee', label: 'Consultation spécialisée' },
                        { value: 'suivi', label: 'Consultation de suivi' },
                        { value: 'urgence', label: 'Urgence' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Message personnalisé (optionnel)
                    </label>
                    <textarea
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="Ex: Le créneau demandé n'est plus disponible..."
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handlePropose}
                      disabled={respondMutation.isPending}
                      className="flex-1 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {respondMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {respondMutation.isPending ? 'Envoi...' : 'Envoyer la proposition'}
                    </button>
                    <button
                      onClick={resetForm}
                      disabled={respondMutation.isPending}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
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
