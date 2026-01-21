'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, FileText, Loader2, Edit, XCircle, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import AppointmentTimeline from '@/components/admin/AppointmentTimeline';
import ProposalModal from '@/components/patient/ProposalModal';
import ModifyAppointmentModal from '@/components/patient/ModifyAppointmentModal';
import CancelAppointmentModal from '@/components/patient/CancelAppointmentModal';
import { getConsultationTypeLabel } from '@/lib/consultationTypes';

const statusConfig: Record<string, { 
  label: string; 
  className: string;
}> = {
  pending: {
    label: 'En attente',
    className: 'bg-orange-500/10 text-orange-700 border border-orange-200/50',
  },
  confirmed: {
    label: 'Confirmé',
    className: 'bg-green-500/10 text-green-700 border border-green-200/50',
  },
  awaiting_patient_response: {
    label: 'Action requise',
    className: 'bg-blue-500/10 text-blue-700 border border-blue-200/50',
  },
  awaiting_admin_response: {
    label: 'En attente',
    className: 'bg-purple-500/10 text-purple-700 border border-purple-200/50',
  },
  rejected_by_patient: {
    label: 'Refusé',
    className: 'bg-red-500/10 text-red-700 border border-red-200/50',
  },
  modification_pending: {
    label: 'Modification en attente',
    className: 'bg-amber-500/10 text-amber-700 border border-amber-200/50',
  },
  rejected: {
    label: 'Refusé',
    className: 'bg-red-500/10 text-red-700 border border-red-200/50',
  },
  cancelled: {
    label: 'Annulé',
    className: 'bg-red-500/10 text-red-700 border border-red-200/50',
  },
  completed: {
    label: 'Terminé',
    className: 'bg-gray-500/10 text-gray-700 border border-gray-200/50',
  },
  no_show: {
    label: 'Absent',
    className: 'bg-gray-500/10 text-gray-700 border border-gray-200/50',
  },
};

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Fetch appointment details
  const { data: appointment, isLoading, refetch } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const response = await api.get(`/appointments/${appointmentId}/`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-vida-teal" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-sm text-gray-600 mb-4">Rendez-vous introuvable</p>
        <button
          onClick={() => router.push('/patient/appointments')}
          className="px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-md hover:bg-vida-teal/90 transition-colors"
        >
          Retour à mes rendez-vous
        </button>
      </div>
    );
  }

  const status = statusConfig[appointment.status] || statusConfig.pending;
  const canModify = appointment.status === 'confirmed';
  const canCancel = ['confirmed', 'pending'].includes(appointment.status);
  const needsResponse = appointment.status === 'awaiting_patient_response';

  // Vérifier le délai de 24h
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const now = new Date();
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canModifyOrCancel = hoursUntilAppointment >= 24;

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button
          onClick={() => router.push('/patient/appointments')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 font-heading">
            Détails du rendez-vous
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            RDV #{appointment.id}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Appointment Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-vida-teal" />
            Informations du rendez-vous
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Date</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(appointment.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Heure</p>
              <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {appointment.time}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-600 mb-1">Type de consultation</p>
              <p className="text-sm font-medium text-gray-900">
                {getConsultationTypeLabel(appointment.consultation_type)}
              </p>
            </div>
          </div>
        </div>

        {/* Reason */}
        {appointment.reason && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-vida-teal" />
              Motif de consultation
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {appointment.reason}
            </p>
          </div>
        )}

        {/* Admin message */}
        {appointment.admin_message && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 vida-grain">
            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              Message de la clinique
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {appointment.admin_message}
            </p>
          </div>
        )}

        {/* Proposed date (if awaiting response) */}
        {needsResponse && appointment.proposed_date && (
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 vida-grain">
            <h3 className="text-sm font-semibold text-amber-900 mb-3">
              Nouvelle date proposée
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-amber-700 mb-1">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(appointment.proposed_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-amber-700 mb-1">Heure</p>
                <p className="text-sm font-medium text-gray-900">
                  {appointment.proposed_time}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Historique
          </h3>
          <AppointmentTimeline appointmentId={parseInt(appointmentId)} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 vida-grain flex-shrink-0">
        {needsResponse && (
          <button
            onClick={() => setProposalModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Répondre à la proposition
          </button>
        )}

        {canModify && canModifyOrCancel && (
          <button
            onClick={() => setModifyModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
        )}

        {canCancel && canModifyOrCancel && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            <XCircle className="h-4 w-4" />
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
          onSuccess={() => {
            refetch();
            setProposalModalOpen(false);
          }}
        />
      )}

      {canModify && (
        <ModifyAppointmentModal
          isOpen={modifyModalOpen}
          onClose={() => setModifyModalOpen(false)}
          appointment={appointment}
          onSuccess={() => {
            refetch();
            setModifyModalOpen(false);
          }}
        />
      )}

      {canCancel && (
        <CancelAppointmentModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          appointment={appointment}
          onSuccess={() => {
            refetch();
            setCancelModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
