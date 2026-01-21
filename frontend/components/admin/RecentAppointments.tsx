'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getConsultationTypeLabel } from '@/lib/consultationTypes';

const statusConfig = {
  pending: {
    label: 'Nouvelle demande',
    className: 'bg-orange-500/10 text-orange-700 border border-orange-200/50',
  },
  confirmed: {
    label: 'Confirmé',
    className: 'bg-green-500/10 text-green-700 border border-green-200/50',
  },
  awaiting_patient_response: {
    label: 'Proposition envoyée',
    className: 'bg-blue-500/10 text-blue-700 border border-blue-200/50',
  },
  awaiting_admin_response: {
    label: 'Contre-proposition reçue',
    className: 'bg-purple-500/10 text-purple-700 border border-purple-200/50',
  },
  rejected_by_patient: {
    label: 'Refusé par patient',
    className: 'bg-red-500/10 text-red-700 border border-red-200/50',
  },
  modification_pending: {
    label: 'Modification demandée',
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

interface RecentAppointmentsProps {
  appointments: any[];
}

export default function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  const router = useRouter();

  // Si pas de données, afficher un message
  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-900 font-heading">
            Rendez-vous récents
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-xs text-gray-500">Aucun rendez-vous récent</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-900 font-heading">
          Rendez-vous récents
        </h3>
        <button 
          onClick={() => router.push('/admin/appointments')}
          className="text-[10px] font-medium text-vida-teal hover:text-vida-teal-dark transition-colors"
        >
          Voir tout
        </button>
      </div>

      <div className="space-y-2">
        {appointments.slice(0, 4).map((appointment, index) => {
          const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.pending;
          
          return (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center justify-between p-2.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-2.5 flex-1">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-vida-teal/10">
                  <User className="h-4 w-4 text-vida-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {appointment.patient_first_name} {appointment.patient_last_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(appointment.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {getConsultationTypeLabel(appointment.consultation_type)}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${status.className}`}
              >
                {status.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
