'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  MessageSquare,
  User,
  Shield,
  Settings
} from 'lucide-react';
import { useAppointmentHistory } from '@/hooks/useAppointments';

interface AppointmentTimelineProps {
  appointmentId: number;
}

interface HistoryEntry {
  id: number;
  action: string;
  actor: 'patient' | 'admin' | 'system';
  actor_name?: string;
  patient_name?: string;
  old_date?: string;
  old_time?: string;
  new_date?: string;
  new_time?: string;
  old_consultation_type?: string;
  new_consultation_type?: string;
  old_status?: string;
  new_status?: string;
  changes_data?: Record<string, { old: string; new: string }>; // ✅ Nouveau
  reason?: string;
  message?: string;
  created_at: string;
}

const actionConfig: Record<string, { 
  label: string; 
  icon: any; 
  color: string;
  bgColor: string;
  description: string;
}> = {
  created: {
    label: 'Demande créée',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    description: 'Le patient a soumis une demande de rendez-vous',
  },
  confirmed: {
    label: 'Confirmé',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    description: 'Le rendez-vous a été confirmé',
  },
  rejected: {
    label: 'Refusé par l\'admin',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    description: 'L\'administrateur a refusé la demande',
  },
  proposal_sent: {
    label: 'Proposition envoyée',
    icon: RefreshCw,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    description: 'L\'admin a proposé une alternative',
  },
  proposal_accepted: {
    label: 'Proposition acceptée',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    description: 'Le patient a accepté la proposition',
  },
  proposal_rejected: {
    label: 'Proposition refusée',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    description: 'Le patient a refusé la proposition',
  },
  counter_proposal_sent: {
    label: 'Contre-proposition',
    icon: RefreshCw,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    description: 'Le patient a proposé une autre date',
  },
  counter_proposal_accepted: {
    label: 'Contre-proposition acceptée',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    description: 'L\'admin a accepté la contre-proposition',
  },
  counter_proposal_rejected: {
    label: 'Contre-proposition refusée',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    description: 'L\'admin a refusé la contre-proposition',
  },
  modification_requested: {
    label: 'Modification demandée',
    icon: Settings,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    description: 'Le patient a demandé une modification',
  },
  modification_approved: {
    label: 'Modification approuvée',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    description: 'L\'admin a approuvé la modification',
  },
  cancelled: {
    label: 'Annulé',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    description: 'Le rendez-vous a été annulé',
  },
  completed: {
    label: 'Terminé',
    icon: CheckCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-500',
    description: 'La consultation a eu lieu',
  },
  no_show: {
    label: 'Patient absent',
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-500',
    description: 'Le patient ne s\'est pas présenté',
  },
};

const actorConfig = {
  patient: {
    label: 'Patient',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  system: {
    label: 'Système',
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
};

export default function AppointmentTimeline({ appointmentId }: AppointmentTimelineProps) {
  const { data: history, isLoading } = useAppointmentHistory(appointmentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vida-teal"></div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
          <Calendar className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 font-medium">Aucun historique disponible</p>
        <p className="text-xs text-gray-500 mt-1">Les actions sur ce rendez-vous apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      {/* Titre avec compteur */}
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Chronologie
        </h4>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {history.length} {history.length > 1 ? 'événements' : 'événement'}
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {history.map((entry: HistoryEntry, index: number) => {
          const action = actionConfig[entry.action] || {
            label: entry.action,
            icon: Calendar,
            color: 'text-gray-600',
            bgColor: 'bg-gray-500',
            description: 'Action effectuée',
          };
          const actor = actorConfig[entry.actor] || {
            label: 'Utilisateur',
            icon: User,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
          };
          const Icon = action.icon;
          const ActorIcon = actor.icon;
          const isLast = index === history.length - 1;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative pl-8"
            >
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-transparent" />
              )}

              {/* Timeline dot with pulse animation for recent entries */}
              <div className={`absolute left-0 top-1 w-4 h-4 rounded-full ${action.bgColor} flex items-center justify-center shadow-sm ${index === 0 ? 'ring-2 ring-offset-2 ring-vida-teal/30' : ''}`}>
                <Icon className="h-2.5 w-2.5 text-white" />
              </div>

              {/* Content card */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-200">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-semibold ${action.color}`}>
                        {action.label}
                      </span>
                    </div>
                    
                    {/* Ligne "Par" et "Pour" - Alignement vertical */}
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-gray-500 font-medium w-10">Par :</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium ${actor.bgColor} ${actor.color}`}>
                          <ActorIcon className="h-2.5 w-2.5" />
                          {entry.actor_name || actor.label}
                        </span>
                      </div>
                      
                      {/* Afficher "Pour" uniquement si le patient est différent de l'acteur */}
                      {entry.patient_name && entry.patient_name !== entry.actor_name && (
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-gray-500 font-medium w-10">Pour :</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                            <User className="h-2.5 w-2.5" />
                            {entry.patient_name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-gray-500 italic">
                      {action.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="text-[10px] font-medium text-gray-700">
                      {new Date(entry.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      {new Date(entry.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Date/Time changes */}
                {(entry.old_date || entry.new_date) && (
                  <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Clock className="h-3 w-3 text-blue-600" />
                      <span className="text-[10px] font-semibold text-blue-900 uppercase tracking-wide">
                        Changement de date/heure
                      </span>
                    </div>
                    {entry.old_date && (
                      <div className="flex items-center gap-2 text-[10px] mb-1">
                        <span className="text-gray-600 font-medium min-w-[60px]">Avant :</span>
                        <span className="text-gray-700 line-through">
                          {new Date(entry.old_date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                          })} à {entry.old_time}
                        </span>
                      </div>
                    )}
                    {entry.new_date && (
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-gray-600 font-medium min-w-[60px]">Après :</span>
                        <span className="text-blue-900 font-semibold">
                          {new Date(entry.new_date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                          })} à {entry.new_time}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Status changes */}
                {(entry.old_status || entry.new_status) && (
                  <div className="mb-2 p-2 bg-purple-50 rounded border border-purple-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <RefreshCw className="h-3 w-3 text-purple-600" />
                      <span className="text-[10px] font-semibold text-purple-900 uppercase tracking-wide">
                        Changement de statut
                      </span>
                    </div>
                    {entry.old_status && (
                      <div className="flex items-center gap-2 text-[10px] mb-1">
                        <span className="text-gray-600 font-medium min-w-[60px]">Avant :</span>
                        <span className="text-gray-700 line-through capitalize">
                          {entry.old_status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                    {entry.new_status && (
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-gray-600 font-medium min-w-[60px]">Après :</span>
                        <span className="text-purple-900 font-semibold capitalize">
                          {entry.new_status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Consultation type changes */}
                {(entry.old_consultation_type || entry.new_consultation_type) && (
                  <div className="mb-2 p-2 bg-teal-50 rounded border border-teal-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Settings className="h-3 w-3 text-teal-600" />
                      <span className="text-[10px] font-semibold text-teal-900 uppercase tracking-wide">
                        Changement de type de consultation
                      </span>
                    </div>
                    {entry.old_consultation_type && (
                      <div className="flex items-center gap-2 text-[10px] mb-1">
                        <span className="text-gray-600 font-medium min-w-[60px]">Avant :</span>
                        <span className="text-gray-700 line-through capitalize">
                          {entry.old_consultation_type === 'generale' ? 'Consultation générale' :
                           entry.old_consultation_type === 'specialisee' ? 'Consultation spécialisée' :
                           entry.old_consultation_type === 'suivi' ? 'Consultation de suivi' :
                           entry.old_consultation_type === 'urgence' ? 'Urgence' :
                           entry.old_consultation_type}
                        </span>
                      </div>
                    )}
                    {entry.new_consultation_type && (
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-gray-600 font-medium min-w-[60px]">Après :</span>
                        <span className="text-teal-900 font-semibold capitalize">
                          {entry.new_consultation_type === 'generale' ? 'Consultation générale' :
                           entry.new_consultation_type === 'specialisee' ? 'Consultation spécialisée' :
                           entry.new_consultation_type === 'suivi' ? 'Consultation de suivi' :
                           entry.new_consultation_type === 'urgence' ? 'Urgence' :
                           entry.new_consultation_type}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Reason */}
                {entry.reason && (
                  <div className="mb-2 p-2 bg-amber-50 rounded border border-amber-100">
                    <p className="text-[10px] font-semibold text-amber-900 mb-1 uppercase tracking-wide">
                      Raison :
                    </p>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      "{entry.reason}"
                    </p>
                  </div>
                )}

                {/* Message */}
                {entry.message && (
                  <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                    <MessageSquare className="h-3.5 w-3.5 text-vida-teal flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-700 mb-0.5 uppercase tracking-wide">
                        Message :
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {entry.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* ✅ NOUVEAU : Afficher TOUS les autres changements depuis changes_data */}
                {entry.changes_data && Object.keys(entry.changes_data).length > 0 && (
                  <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Settings className="h-3 w-3 text-gray-600" />
                      <span className="text-[10px] font-semibold text-gray-900 uppercase tracking-wide">
                        Autres modifications
                      </span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(entry.changes_data).map(([field, change]) => {
                        // Ignorer les champs déjà affichés dans les sections dédiées
                        if (['date', 'time', 'consultation_type', 'status'].includes(field)) {
                          return null;
                        }
                        
                        // Labels lisibles pour les champs
                        const fieldLabels: Record<string, string> = {
                          patient_first_name: 'Prénom patient',
                          patient_last_name: 'Nom patient',
                          patient_email: 'Email patient',
                          patient_phone: 'Téléphone patient',
                          reason: 'Motif',
                          notes_patient: 'Notes patient',
                          notes_staff: 'Notes internes',
                          admin_message: 'Message admin',
                          patient_message: 'Message patient',
                          rejection_reason: 'Raison du refus',
                          cancellation_reason: 'Raison annulation',
                          proposed_date: 'Date proposée',
                          proposed_time: 'Heure proposée',
                          proposed_consultation_type: 'Type proposé',
                        };
                        
                        const label = fieldLabels[field] || field;
                        
                        return (
                          <div key={field} className="text-[10px] bg-white p-1.5 rounded">
                            <span className="font-semibold text-gray-700">{label} :</span>
                            <div className="ml-2 mt-0.5 space-y-0.5">
                              {change.old && (
                                <div className="text-gray-600">
                                  <span className="text-gray-500">Avant :</span>{' '}
                                  <span className="line-through">{change.old}</span>
                                </div>
                              )}
                              {change.new && (
                                <div className="text-gray-900">
                                  <span className="text-gray-500">Après :</span>{' '}
                                  <span className="font-medium">{change.new}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
