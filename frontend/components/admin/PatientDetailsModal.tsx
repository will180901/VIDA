'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Calendar, MapPin, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { getConsultationTypeLabel } from '@/lib/consultationTypes';

interface Patient {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  email_verified: boolean;
  created_at: string;
  gender: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  consultation_type: string;
  status: string;
  reason?: string;
}

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

const statusConfig = {
  pending: { label: 'Nouvelle demande', className: 'bg-orange-500/10 text-orange-700 border border-orange-200/50' },
  confirmed: { label: 'Confirmé', className: 'bg-green-500/10 text-green-700 border border-green-200/50' },
  awaiting_patient_response: { label: 'Proposition envoyée', className: 'bg-blue-500/10 text-blue-700 border border-blue-200/50' },
  awaiting_admin_response: { label: 'Contre-proposition reçue', className: 'bg-purple-500/10 text-purple-700 border border-purple-200/50' },
  rejected_by_patient: { label: 'Refusé par patient', className: 'bg-red-500/10 text-red-700 border border-red-200/50' },
  modification_pending: { label: 'Modification demandée', className: 'bg-amber-500/10 text-amber-700 border border-amber-200/50' },
  rejected: { label: 'Refusé', className: 'bg-red-500/10 text-red-700 border border-red-200/50' },
  cancelled: { label: 'Annulé', className: 'bg-red-500/10 text-red-700 border border-red-200/50' },
  completed: { label: 'Terminé', className: 'bg-gray-500/10 text-gray-700 border border-gray-200/50' },
  no_show: { label: 'Absent', className: 'bg-gray-500/10 text-gray-700 border border-gray-200/50' },
};

export default function PatientDetailsModal({ isOpen, onClose, patient }: PatientDetailsModalProps) {
  // Récupérer les RDV du patient
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['patient-appointments', patient?.id],
    queryFn: async () => {
      if (!patient?.id) return null;
      const response = await api.get(`/auth/patients/${patient.id}/appointments/`);
      return response.data;
    },
    enabled: !!patient?.id && isOpen,
  });

  const appointments = appointmentsData?.appointments || [];
  const stats = {
    total: appointments.length,
    completed: appointments.filter((a: Appointment) => a.status === 'completed').length,
    upcoming: appointments.filter((a: Appointment) => 
      a.status === 'confirmed' || a.status === 'pending'
    ).length,
  };

  if (!patient) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-vida-teal/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-vida-teal">
                      {patient.first_name?.[0]}{patient.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 font-heading">
                      {patient.first_name} {patient.last_name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Patient depuis {new Date(patient.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="grid grid-cols-2 gap-6">
                  {/* Informations personnelles */}
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-heading">
                      Informations personnelles
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Email</p>
                          <p className="text-xs text-gray-900 mt-0.5">{patient.email}</p>
                          {patient.email_verified ? (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Vérifié
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                              <XCircle className="h-3 w-3" />
                              Non vérifié
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Téléphone</p>
                          <p className="text-xs text-gray-900 mt-0.5">{patient.phone || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Genre</p>
                          <p className="text-xs text-gray-900 mt-0.5">
                            {patient.gender === 'M' ? 'Masculin' : patient.gender === 'F' ? 'Féminin' : '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Date de naissance</p>
                          <p className="text-xs text-gray-900 mt-0.5">
                            {patient.date_of_birth 
                              ? new Date(patient.date_of_birth).toLocaleDateString('fr-FR')
                              : '-'
                            }
                          </p>
                        </div>
                      </div>

                      {patient.address && (
                        <div className="col-span-2 flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Adresse</p>
                            <p className="text-xs text-gray-900 mt-0.5">{patient.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact d'urgence */}
                  {(patient.emergency_contact || patient.emergency_phone) && (
                    <div className="col-span-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 font-heading">
                        Contact d'urgence
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {patient.emergency_contact && (
                          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                            <User className="h-4 w-4 text-red-400 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-red-600 uppercase tracking-wide">Nom</p>
                              <p className="text-xs text-gray-900 mt-0.5">{patient.emergency_contact}</p>
                            </div>
                          </div>
                        )}
                        {patient.emergency_phone && (
                          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                            <Phone className="h-4 w-4 text-red-400 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-red-600 uppercase tracking-wide">Téléphone</p>
                              <p className="text-xs text-gray-900 mt-0.5">{patient.emergency_phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Statistiques RDV */}
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-heading">
                      Statistiques des rendez-vous
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-vida-teal/10 to-vida-teal/5 rounded-lg border border-vida-teal/20">
                        <p className="text-[10px] text-vida-teal uppercase tracking-wide font-semibold">Total</p>
                        <p className="text-2xl font-bold text-vida-teal mt-1">{stats.total}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-200/50">
                        <p className="text-[10px] text-green-700 uppercase tracking-wide font-semibold">Terminés</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">{stats.completed}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-200/50">
                        <p className="text-[10px] text-orange-700 uppercase tracking-wide font-semibold">À venir</p>
                        <p className="text-2xl font-bold text-orange-700 mt-1">{stats.upcoming}</p>
                      </div>
                    </div>
                  </div>

                  {/* Historique des RDV */}
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-heading">
                      Historique des rendez-vous
                    </h3>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <p className="text-xs text-gray-500">Chargement...</p>
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Aucun rendez-vous</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {appointments.map((appointment: Appointment) => {
                          const status = statusConfig[appointment.status as keyof typeof statusConfig];
                          return (
                            <div
                              key={appointment.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-vida-teal/10">
                                  <Clock className="h-4 w-4 text-vida-teal" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-900">
                                    {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {getConsultationTypeLabel(appointment.consultation_type)}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${status?.className}`}>
                                {status?.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
