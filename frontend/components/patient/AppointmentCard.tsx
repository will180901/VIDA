'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, FileText, MessageSquare, Edit, XCircle, Eye, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ProposalModal from './ProposalModal';
import ModifyAppointmentModal from './ModifyAppointmentModal';
import CancelAppointmentModal from './CancelAppointmentModal';
import { getConsultationTypeLabel } from '@/lib/consultationTypes';

interface AppointmentCardProps {
  appointment: {
    id: number;
    date: string;
    time: string;
    consultation_type: string;
    consultation_type_display?: string;
    status: string;
    reason?: string;
    admin_message?: string;
    proposed_date?: string;
    proposed_time?: string;
  };
  onUpdate: () => void;
}

const statusConfig: Record<string, { 
  label: string; 
  className: string;
  description: string;
}> = {
  pending: {
    label: 'En attente',
    className: 'bg-orange-500/10 text-orange-700 border border-orange-200/50',
    description: 'Votre demande est en cours de traitement',
  },
  confirmed: {
    label: 'Confirmé',
    className: 'bg-green-500/10 text-green-700 border border-green-200/50',
    description: 'Votre rendez-vous est confirmé',
  },
  awaiting_patient_response: {
    label: 'Action requise',
    className: 'bg-blue-500/10 text-blue-700 border border-blue-200/50',
    description: 'La clinique vous a proposé une alternative',
  },
  awaiting_admin_response: {
    label: 'En attente',
    className: 'bg-purple-500/10 text-purple-700 border border-purple-200/50',
    description: 'Votre contre-proposition est en cours de traitement',
  },
  rejected_by_patient: {
    label: 'Refusé',
    className: 'bg-red-500/10 text-red-700 border border-red-200/50',
    description: 'Vous avez refusé cette proposition',
  },
  modification_pending: {
    label: 'Modification en attente',
    className: 'bg-amber-500/10 text-amber-700 border border-amber-200/50',
    description: 'Votre demande de modification est en cours',
  },
  rejected: {
    label: 'Refusé',
    className: 'bg-red-500/10 text-red-700 border border-red-200/50',
    description: 'La clinique n\'a pas pu accepter votre demande',
  },
  cancelled: {
    label: 'Annulé',
    className: 'bg-red-500/10 text-red-700 border border-red-200/50',
    description: 'Ce rendez-vous a été annulé',
  },
  completed: {
    label: 'Terminé',
    className: 'bg-gray-500/10 text-gray-700 border border-gray-200/50',
    description: 'Consultation terminée',
  },
  no_show: {
    label: 'Absent',
    className: 'bg-gray-500/10 text-gray-700 border border-gray-200/50',
    description: 'Vous n\'étiez pas présent',
  },
};

export default function AppointmentCard({ appointment, onUpdate }: AppointmentCardProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  
  const status = statusConfig[appointment.status] || statusConfig.pending;
  const canModify = appointment.status === 'confirmed';
  const canCancel = ['confirmed', 'pending'].includes(appointment.status);
  const needsResponse = appointment.status === 'awaiting_patient_response';

  // Vérifier si le RDV est dans moins de 24h
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const now = new Date();
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canModifyOrCancel = hoursUntilAppointment >= 24;

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-vida-teal" />
              <span className="text-sm font-semibold text-gray-900">
                {new Date(appointment.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {appointment.time}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium">
                {getConsultationTypeLabel(appointment.consultation_type)}
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold ${status.className}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Status description */}
        <p className="text-xs text-gray-600 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          {status.description}
        </p>

        {/* Reason */}
        {appointment.reason && (
          <div className="bg-gray-50 rounded p-2">
            <p className="text-[10px] text-gray-500 mb-1">Motif :</p>
            <p className="text-xs text-gray-700">{appointment.reason}</p>
          </div>
        )}

        {/* Admin message */}
        {appointment.admin_message && (
          <div className="bg-blue-50 rounded p-2 border border-blue-100">
            <p className="text-[10px] text-blue-600 mb-1 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Message de la clinique :
            </p>
            <p className="text-xs text-gray-700">{appointment.admin_message}</p>
          </div>
        )}

        {/* Proposed date (if awaiting response) */}
        {needsResponse && appointment.proposed_date && (
          <div className="bg-amber-50 rounded p-2 border border-amber-200">
            <p className="text-[10px] text-amber-700 mb-1 font-medium">
              Nouvelle date proposée :
            </p>
            <p className="text-xs text-gray-900 font-medium">
              {new Date(appointment.proposed_date).toLocaleDateString('fr-FR')} à {appointment.proposed_time}
            </p>
          </div>
        )}

        {/* Warning if less than 24h */}
        {(canModify || canCancel) && !canModifyOrCancel && (
          <div className="bg-red-50 rounded p-2 border border-red-200">
            <p className="text-[10px] text-red-700 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Délai de 24h dépassé. Pour toute modification, contactez la clinique au 06 XXX XX XX
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
        <button
          onClick={() => router.push(`/patient/appointments/${appointment.id}`)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Eye className="h-3 w-3" />
          Détails
        </button>

        {needsResponse && (
          <button
            onClick={() => setProposalModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            Répondre
          </button>
        )}

        {canModify && canModifyOrCancel && (
          <button
            onClick={() => setModifyModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-3 w-3" />
            Modifier
          </button>
        )}

        {canCancel && canModifyOrCancel && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            <XCircle className="h-3 w-3" />
            Annuler
          </button>
        )}
      </div>

      {/* Modals */}
      {needsResponse && appointment.proposed_date && (
        <ProposalModal
          isOpen={proposalModalOpen}
          onClose={() => setProposalModalOpen(false)}
          appointment={appointment}
          onSuccess={onUpdate}
        />
      )}

      {canModify && (
        <ModifyAppointmentModal
          isOpen={modifyModalOpen}
          onClose={() => setModifyModalOpen(false)}
          appointment={appointment}
          onSuccess={onUpdate}
        />
      )}

      {canCancel && (
        <CancelAppointmentModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          appointment={appointment}
          onSuccess={onUpdate}
        />
      )}
    </motion.div>
  );
}
