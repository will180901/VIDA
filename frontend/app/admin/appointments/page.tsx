'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, Search, Filter, Eye, ChevronLeft, ChevronRight, MessageSquare, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { AppointmentTableSkeleton } from '@/components/admin/skeletons';
import { useToast } from '@/components/ui/Toast';
import { useUpdateAppointment } from '@/hooks/useAppointments';
import { toastMessages, extractErrorMessage } from '@/lib/toastMessages';
import { dateFormats } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';
import AppointmentDetailsModal from '@/components/admin/AppointmentDetailsModal';
import RespondModal from '@/components/admin/RespondModal';
import AppointmentModal from '@/components/ui/AppointmentModal';
import Dropdown from '@/components/ui/Dropdown';
import ActionMenu from '@/components/admin/ActionMenu';
import EditAppointmentModal from '@/components/admin/EditAppointmentModal';
import DeleteAppointmentModal from '@/components/admin/DeleteAppointmentModal';
import ModifyRequestModal from '@/components/admin/ModifyRequestModal';
import CounterProposalModal from '@/components/admin/CounterProposalModal';
import CancelAppointmentModal from '@/components/admin/CancelAppointmentModal';
import { getConsultationTypeLabel } from '@/lib/consultationTypes';

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
  status: string;
  reason?: string;
  notes_staff?: string;
  notes_patient?: string;
  rejection_reason?: string;
  admin_message?: string;
  patient_message?: string;
  patient?: number;
  created_at: string;
  updated_at?: string;
  // Champs pour propositions
  proposed_date?: string;
  proposed_time?: string;
  proposed_consultation_type?: string;
  // Métadonnées
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  responded_at?: string;
  proposal_sent_at?: string;
  reminder_sent?: boolean;
  reminder_sent_at?: string;
  created_by?: number;
  last_modified_by?: number;
}

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

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;

export default function AppointmentsPage() {
  const { showToast } = useToast();
  const updateAppointment = useUpdateAppointment();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [modifyRequestModalOpen, setModifyRequestModalOpen] = useState(false);
  const [counterProposalModalOpen, setCounterProposalModalOpen] = useState(false);
  const [newAppointmentModalOpen, setNewAppointmentModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Générer les options de filtre dynamiquement à partir de statusConfig
  const filterOptions = [
    { value: 'all', label: 'Tous les statuts' },
    ...Object.entries(statusConfig).map(([key, config]) => ({
      value: key,
      label: config.label,
    })),
  ];

  // Fetch appointments
  const { data: appointmentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['appointments', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await api.get(`/appointments/appointments/?${params.toString()}`);
      return response.data;
    },
    retry: 2,
    staleTime: 30000, // Cache pendant 30 secondes
  });

  // Gérer la pagination DRF (results) ou tableau direct
  const allAppointments = Array.isArray(appointmentsData) 
    ? appointmentsData 
    : appointmentsData?.results || [];

  // Filtrage côté client pour recherche globale - Recherche dans TOUTES les colonnes
  const appointments = allAppointments.filter((appointment: Appointment) => {
    if (!debouncedSearchQuery) return true;
    
    const query = debouncedSearchQuery.toLowerCase().trim();
    
    // Construire toutes les valeurs recherchables
    const fullName = `${appointment.patient_first_name} ${appointment.patient_last_name}`.toLowerCase();
    const phone = appointment.patient_phone.toLowerCase();
    const email = appointment.patient_email.toLowerCase();
    const date = new Date(appointment.date).toLocaleDateString('fr-FR');
    const time = appointment.time;
    const dateTime = `${date} ${time}`.toLowerCase();
    const type = getConsultationTypeLabel(appointment.consultation_type, true).toLowerCase();
    const typeRaw = appointment.consultation_type.toLowerCase();
    const status = statusConfig[appointment.status as keyof typeof statusConfig]?.label.toLowerCase() || '';
    const statusRaw = appointment.status.toLowerCase();
    
    // Recherche dans toutes les colonnes affichées
    return (
      fullName.includes(query) ||
      appointment.patient_first_name.toLowerCase().includes(query) ||
      appointment.patient_last_name.toLowerCase().includes(query) ||
      phone.includes(query) ||
      email.includes(query) ||
      date.toLowerCase().includes(query) ||
      time.toLowerCase().includes(query) ||
      dateTime.includes(query) ||
      type.toLowerCase().includes(query) ||
      typeRaw.includes(query) ||
      status.includes(query) ||
      statusRaw.includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = appointments.slice(startIndex, endIndex);

  // Reset page when filters change
  const handleFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch);
    setCurrentPage(1);
  };

  // Fonction de validation métier : vérifier si un RDV peut être modifié (24h avant)
  const canModifyAppointment = (appointment: Appointment): boolean => {
    if (appointment.status !== 'confirmed') return false;
    
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilAppointment > 24;
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailsModalOpen(true);
  };

  const handleRespond = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // Si c'est une demande de modification, ouvrir le modal spécifique
    if (appointment.status === 'modification_pending') {
      setModifyRequestModalOpen(true);
    } else if (appointment.status === 'awaiting_admin_response') {
      // Contre-proposition du patient
      setCounterProposalModalOpen(true);
    } else {
      // Demande initiale (pending)
      setRespondModalOpen(true);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditModalOpen(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDeleteModalOpen(true);
  };

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalOpen(true);
  };

  const handleMarkCompleted = async (appointment: Appointment) => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: { status: 'completed' },
      });
      showToast(toastMessages.appointment.completed, 'success');
      refetch();
    } catch (error: any) {
      showToast(extractErrorMessage(error, toastMessages.error.generic), 'error');
    }
  };

  const handleMarkNoShow = async (appointment: Appointment) => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: { status: 'no_show' },
      });
      showToast('Patient marqué comme absent', 'success');
      refetch();
    } catch (error: any) {
      showToast(extractErrorMessage(error, toastMessages.error.generic), 'error');
    }
  };

  const handleNewAppointment = () => {
    setNewAppointmentModalOpen(true);
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-heading">
            Rendez-vous
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Gérez tous les rendez-vous de la clinique
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            {appointments.length} rendez-vous
          </span>
          <Tooltip content="Créer un nouveau rendez-vous" position="bottom">
            <button
              onClick={handleNewAppointment}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-vida-teal rounded-md hover:bg-vida-teal/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau RDV
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Filters - Alignés à gauche */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher (patient, date...)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
              aria-label="Rechercher un rendez-vous"
            />
          </div>

          {/* Status Filter */}
          <Dropdown
            value={statusFilter}
            onChange={(newValue) => handleFilterChange(newValue)}
            icon={<Filter className="h-3.5 w-3.5 text-gray-400" />}
            options={filterOptions}
            aria-label="Filtrer par statut"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <AppointmentTableSkeleton rows={10} />
      ) : (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 overflow-hidden vida-grain flex-1 flex flex-col">
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="text-center">
              <p className="text-sm font-medium text-red-600 mb-1">Erreur de chargement</p>
              <p className="text-xs text-gray-500">Impossible de charger les rendez-vous</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-md hover:bg-vida-teal/90 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : !appointments || appointments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-gray-500">Aucun rendez-vous trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Date & Heure
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentAppointments.map((appointment: Appointment, index: number) => {
                    const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.pending;
                    
                    return (
                      <motion.tr
                        key={appointment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-vida-teal/10">
                              <User className="h-4 w-4 text-vida-teal" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-900">
                                {appointment.patient_first_name} {appointment.patient_last_name}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {appointment.patient_phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1 text-xs text-gray-900">
                              <Calendar className="h-3 w-3" />
                              <span>{dateFormats.short(appointment.date)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-700">
                            {getConsultationTypeLabel(appointment.consultation_type, true)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 + 0.1 }}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${status.className}`}
                          >
                            {status.label}
                          </motion.span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <ActionMenu
                              onViewDetails={() => handleViewDetails(appointment)}
                              onEdit={() => handleEdit(appointment)}
                              onDelete={() => handleDelete(appointment)}
                              onCancel={() => handleCancel(appointment)}
                              onMarkCompleted={() => handleMarkCompleted(appointment)}
                              onMarkNoShow={() => handleMarkNoShow(appointment)}
                              onRespond={
                                (appointment.status === 'pending' || 
                                 appointment.status === 'awaiting_admin_response' ||
                                 appointment.status === 'modification_pending')
                                  ? () => handleRespond(appointment)
                                  : undefined
                              }
                              showEdit={
                                appointment.status === 'pending' ||
                                (appointment.status === 'confirmed' && canModifyAppointment(appointment)) ||
                                appointment.status === 'awaiting_patient_response'
                              }
                              showRespond={
                                appointment.status === 'pending' || 
                                appointment.status === 'awaiting_admin_response' ||
                                appointment.status === 'modification_pending'
                              }
                              showMarkCompleted={
                                appointment.status === 'confirmed'
                              }
                              showMarkNoShow={
                                appointment.status === 'confirmed'
                              }
                              showCancel={
                                appointment.status === 'pending' ||
                                (appointment.status === 'confirmed' && canModifyAppointment(appointment)) ||
                                appointment.status === 'awaiting_patient_response' ||
                                appointment.status === 'awaiting_admin_response'
                              }
                              showDelete={
                                appointment.status === 'rejected' ||
                                appointment.status === 'rejected_by_patient' ||
                                appointment.status === 'cancelled' ||
                                appointment.status === 'completed' ||
                                appointment.status === 'no_show'
                              }
                            />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination - Fixée en bas */}
            {totalPages > 0 && (
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({startIndex + 1}-{Math.min(endIndex, appointments.length)} sur {appointments.length})
                  </span>
                  
                  {/* Sélecteur d'items par page */}
                  <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300">
                    <span className="text-xs text-gray-600">Afficher :</span>
                    <Dropdown
                      value={itemsPerPage.toString()}
                      onChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1); // Reset à la page 1
                      }}
                      options={ITEMS_PER_PAGE_OPTIONS.map((option) => ({
                        value: option.toString(),
                        label: `${option} par page`,
                      }))}
                      maxHeight={200}
                      preferredDirection="up"
                      aria-label="Nombre d'éléments par page"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content="Page précédente">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 text-gray-600 hover:text-vida-teal hover:bg-vida-teal/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Page précédente"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      // Afficher max 7 pages avec ellipses si nécessaire
                      let page;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = currentPage - 3 + i;
                      }
                      
                      return (
                        <Tooltip key={page} content={`Aller à la page ${page}`}>
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                              currentPage === page
                                ? 'bg-vida-teal text-white'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                            aria-label={`Page ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        </Tooltip>
                      );
                    })}
                  </div>

                  <Tooltip content="Page suivante">
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 text-gray-600 hover:text-vida-teal hover:bg-vida-teal/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Page suivante"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onUpdate={refetch}
        />
      )}

      {/* Respond Modal */}
      {selectedAppointment && (
        <RespondModal
          isOpen={respondModalOpen}
          onClose={() => {
            setRespondModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={refetch}
        />
      )}

      {/* Edit Modal */}
      {selectedAppointment && (
        <EditAppointmentModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={refetch}
        />
      )}

      {/* Delete Appointment Modal */}
      {selectedAppointment && (
        <DeleteAppointmentModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={refetch}
        />
      )}

      {/* Modify Request Modal */}
      {selectedAppointment && (
        <ModifyRequestModal
          isOpen={modifyRequestModalOpen}
          onClose={() => {
            setModifyRequestModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={refetch}
        />
      )}

      {/* Counter Proposal Modal */}
      {selectedAppointment && (
        <CounterProposalModal
          isOpen={counterProposalModalOpen}
          onClose={() => {
            setCounterProposalModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={refetch}
        />
      )}

      {/* Cancel Appointment Modal */}
      {selectedAppointment && (
        <CancelAppointmentModal
          isOpen={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={refetch}
        />
      )}

      {/* New Appointment Modal */}
      <AppointmentModal
        isOpen={newAppointmentModalOpen}
        onClose={() => setNewAppointmentModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
