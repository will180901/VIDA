'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle, XCircle, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useState } from 'react';
import { useAcceptProposal, useRejectProposal, useCounterPropose } from '@/hooks/useAppointments';
import { useToast } from '@/components/ui/Toast';
import AppointmentDateTimePicker from '@/components/ui/AppointmentDateTimePicker';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    date: string;
    time: string;
    proposed_date?: string;
    proposed_time?: string;
    proposed_consultation_type?: string;
    admin_message?: string;
    consultation_type: string;
  };
  onSuccess: () => void;
}

export default function ProposalModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: ProposalModalProps) {
  const [selectedAction, setSelectedAction] = useState<'accept' | 'reject' | 'counter' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [counterDate, setCounterDate] = useState('');
  const [counterTime, setCounterTime] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  
  const acceptMutation = useAcceptProposal();
  const rejectMutation = useRejectProposal();
  const counterMutation = useCounterPropose();
  const { showToast } = useToast();

  const handleAccept = async () => {
    try {
      await acceptMutation.mutateAsync({
        id: appointment.id,
        proposalId: 0, // Will be handled by backend
      });
      showToast('Proposition acceptée avec succès', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erreur lors de l\'acceptation', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast('Veuillez indiquer la raison du refus', 'error');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: appointment.id,
        proposalId: 0,
        reason: rejectionReason,
      });
      showToast('Proposition refusée', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erreur lors du refus', 'error');
    }
  };

  const handleCounter = async () => {
    if (!counterDate || !counterTime) {
      showToast('Veuillez sélectionner une date et une heure', 'error');
      return;
    }

    try {
      await counterMutation.mutateAsync({
        id: appointment.id,
        proposedDate: counterDate,
        proposedTime: counterTime,
        message: counterMessage,
      });
      showToast('Contre-proposition envoyée', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.proposed_date?.[0] || 
                       error.response?.data?.error || 
                       'Erreur lors de l\'envoi';
      showToast(errorMsg, 'error');
    }
  };

  const resetForm = () => {
    setSelectedAction(null);
    setRejectionReason('');
    setCounterDate('');
    setCounterTime('');
    setCounterMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isPending = acceptMutation.isPending || rejectMutation.isPending || counterMutation.isPending;

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
                  Nouvelle proposition de rendez-vous
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  La clinique vous propose une alternative
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Original date */}
                <div className="bg-red-50 rounded-lg p-3 vida-grain border border-red-200">
                  <p className="text-[10px] font-semibold text-red-700 mb-2 uppercase">
                    Date demandée (non disponible)
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-900">
                      <Calendar className="h-3.5 w-3.5 text-red-600" />
                      <span className="line-through">
                        {new Date(appointment.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-900">
                      <Clock className="h-3.5 w-3.5 text-red-600" />
                      <span className="line-through">{appointment.time}</span>
                    </div>
                  </div>
                </div>

                {/* Proposed date */}
                <div className="bg-green-50 rounded-lg p-3 vida-grain border border-green-200">
                  <p className="text-[10px] font-semibold text-green-700 mb-2 uppercase">
                    Nouvelle date proposée
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-900">
                      <Calendar className="h-3.5 w-3.5 text-green-600" />
                      <span>
                        {appointment.proposed_date ? new Date(appointment.proposed_date).toLocaleDateString('fr-FR') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-900">
                      <Clock className="h-3.5 w-3.5 text-green-600" />
                      <span>{appointment.proposed_time || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin message */}
              {appointment.admin_message && (
                <div className="bg-blue-50 rounded-lg p-3 vida-grain border border-blue-200">
                  <p className="text-[10px] font-semibold text-blue-700 mb-2">
                    Message de la clinique :
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {appointment.admin_message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {!selectedAction && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-3">
                    Que souhaitez-vous faire ?
                  </p>
                  
                  <button
                    onClick={() => setSelectedAction('accept')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">Accepter la proposition</p>
                      <p className="text-[10px] text-gray-600">Confirmer le nouveau créneau</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedAction('counter')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">Proposer une autre date</p>
                      <p className="text-[10px] text-gray-600">Suggérer un créneau différent</p>
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
                      <p className="text-xs font-semibold text-gray-900">Refuser la proposition</p>
                      <p className="text-[10px] text-gray-600">Annuler cette demande de rendez-vous</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Accept Confirmation */}
              {selectedAction === 'accept' && (
                <div className="bg-green-50 rounded-lg p-4 vida-grain border border-green-200">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">
                    Confirmer l'acceptation
                  </h4>
                  <p className="text-xs text-gray-700 mb-4">
                    Vous recevrez un email de confirmation avec tous les détails du rendez-vous.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAccept}
                      disabled={isPending}
                      className="flex-1 px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isPending ? 'Confirmation...' : 'Confirmer'}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
                    Refuser la proposition
                  </h4>
                  
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Raison du refus <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ex: Créneau non disponible pour moi..."
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-red-500/30 transition-colors resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={isPending}
                      className="flex-1 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isPending ? 'Envoi...' : 'Confirmer le refus'}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              )}

              {/* Counter Propose Form */}
              {selectedAction === 'counter' && (
                <div className="bg-blue-50 rounded-lg p-4 vida-grain border border-blue-200 space-y-3">
                  <h4 className="text-xs font-semibold text-gray-900">
                    Proposer une autre date
                  </h4>

                  <AppointmentDateTimePicker
                    date={counterDate}
                    time={counterTime}
                    onDateChange={setCounterDate}
                    onTimeChange={setCounterTime}
                    showCalendar={true}
                    showTimeSlots={true}
                    required={true}
                    dateLabel="Date souhaitée"
                    timeLabel="Heure souhaitée"
                  />

                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Message (optionnel)
                    </label>
                    <textarea
                      value={counterMessage}
                      onChange={(e) => setCounterMessage(e.target.value)}
                      placeholder="Précisez vos disponibilités..."
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCounter}
                      disabled={isPending}
                      className="flex-1 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isPending ? 'Envoi...' : 'Envoyer la proposition'}
                    </button>
                    <button
                      onClick={resetForm}
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
