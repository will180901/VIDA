'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, Search, Filter, CheckCircle, XCircle, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import AppointmentDetailsModal from '@/components/admin/AppointmentDetailsModal';
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
  status: string;
  reason?: string;
  created_at: string;
}

const statusConfig = {
  pending: {
    label: 'En attente',
    className: 'bg-orange-500/10 text-orange-700 border border-orange-200/50',
  },
  confirmed: {
    label: 'Confirmé',
    className: 'bg-green-500/10 text-green-700 border border-green-200/50',
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

const ITEMS_PER_PAGE = 5;

export default function AppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch appointments
  const { data: appointmentsData, isLoading, refetch } = useQuery({
    queryKey: ['appointments', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await api.get(`/appointments/appointments/?${params.toString()}`);
      return response.data;
    },
  });

  // Gérer la pagination DRF (results) ou tableau direct
  const allAppointments = Array.isArray(appointmentsData) 
    ? appointmentsData 
    : appointmentsData?.results || [];

  // Filtrage côté client pour recherche globale - Recherche dans TOUTES les colonnes
  const appointments = allAppointments.filter((appointment: Appointment) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Construire toutes les valeurs recherchables
    const fullName = `${appointment.patient_first_name} ${appointment.patient_last_name}`.toLowerCase();
    const phone = appointment.patient_phone.toLowerCase();
    const email = appointment.patient_email.toLowerCase();
    const date = new Date(appointment.date).toLocaleDateString('fr-FR');
    const time = appointment.time;
    const dateTime = `${date} ${time}`.toLowerCase();
    const type = appointment.consultation_type === 'generale' ? 'générale' : 'spécialisée';
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
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
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

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailsModalOpen(true);
  };

  const handleConfirm = async (id: number) => {
    try {
      await api.patch(`/appointments/appointments/${id}/`, { status: 'confirmed' });
      refetch();
    } catch (error) {
      console.error('Erreur confirmation:', error);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.patch(`/appointments/appointments/${id}/`, { status: 'cancelled' });
      refetch();
    } catch (error) {
      console.error('Erreur annulation:', error);
    }
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            {appointments.length} rendez-vous
          </span>
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
            />
          </div>

          {/* Status Filter */}
          <Dropdown
            value={statusFilter}
            onChange={(newValue) => handleFilterChange(newValue)}
            icon={<Filter className="h-3.5 w-3.5 text-gray-400" />}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'pending', label: 'En attente' },
              { value: 'confirmed', label: 'Confirmé' },
              { value: 'cancelled', label: 'Annulé' },
              { value: 'completed', label: 'Terminé' },
              { value: 'no_show', label: 'Absent' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 overflow-hidden vida-grain flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-vida-teal" />
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
                              <span>{new Date(appointment.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-700">
                            {appointment.consultation_type === 'generale' ? 'Générale' : 'Spécialisée'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewDetails(appointment)}
                              className="p-1.5 text-gray-600 hover:text-vida-teal hover:bg-vida-teal/10 rounded transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {appointment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleConfirm(appointment.id)}
                                  className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Confirmer"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleCancel(appointment.id)}
                                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Annuler"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination - Fixée en bas */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({startIndex + 1}-{Math.min(endIndex, appointments.length)} sur {appointments.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-gray-600 hover:text-vida-teal hover:bg-vida-teal/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Page précédente"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                          currentPage === page
                            ? 'bg-vida-teal text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 text-gray-600 hover:text-vida-teal hover:bg-vida-teal/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Page suivante"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
    </div>
  );
}
