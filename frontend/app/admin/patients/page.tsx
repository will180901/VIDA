'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  UserPlus, 
  Eye, 
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { Skeleton, SkeletonCircle } from '@/components/ui/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import PatientDetailsModalNew from '@/components/admin/PatientDetailsModalNew';
import NewPatientModal from '@/components/admin/NewPatientModal';
import { usePatientStats } from '@/hooks/usePatientStats';
import Dropdown from '@/components/ui/Dropdown';
import PatientActionMenu from '@/components/admin/PatientActionMenu';
import { useToast } from '@/components/ui/Toast';

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
}

export default function PatientsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Filtres
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  // Récupérer les statistiques
  const { data: stats, isLoading: statsLoading } = usePatientStats();

  // Récupérer la liste des patients
  const { data: patientsData, isLoading, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await api.get('/auth/patients/');
      return response.data;
    },
  });

  // S'assurer que patients est un tableau
  const patients = Array.isArray(patientsData) ? patientsData : [];

  // Filtrer les patients selon la recherche et les filtres
  let filteredPatients = patients.filter((patient: Patient) => {
    // Recherche textuelle
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      patient.first_name?.toLowerCase().includes(searchLower) ||
      patient.last_name?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.toLowerCase().includes(searchLower)
    );

    // Filtre statut
    let matchesStatus = true;
    if (statusFilter === 'verified') {
      matchesStatus = patient.email_verified === true;
    } else if (statusFilter === 'unverified') {
      matchesStatus = patient.email_verified === false;
    }
    // 'all', 'active', 'inactive' seront gérés après avoir les données RDV

    // Filtre genre
    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;

    return matchesSearch && matchesStatus && matchesGender;
  });

  // Tri
  filteredPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      case 'name_desc':
        return `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`);
      case 'date_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'date_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  // Reset page quand on change la recherche ou les filtres
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleGenderFilterChange = (value: string) => {
    setGenderFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailsModalOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    // TODO: Ouvrir modal d'édition
    showToast('Fonctionnalité en cours de développement', 'info');
  };

  const handleCreateAppointment = (patient: Patient) => {
    // Rediriger vers la page RDV avec le patient pré-sélectionné
    router.push(`/admin/appointments?create=true&patient=${patient.id}`);
  };

  const handleSendEmail = (patient: Patient) => {
    // Ouvrir le client email
    window.location.href = `mailto:${patient.email}`;
  };

  const handleCall = (patient: Patient) => {
    if (patient.phone) {
      // Click-to-call
      window.location.href = `tel:${patient.phone}`;
    } else {
      showToast('Aucun numéro de téléphone', 'error');
    }
  };

  const handlePrint = (patient: Patient) => {
    // TODO: Générer et imprimer la fiche patient
    showToast('Fonctionnalité en cours de développement', 'info');
  };

  const handleViewStats = (patient: Patient) => {
    // TODO: Ouvrir modal statistiques
    showToast('Fonctionnalité en cours de développement', 'info');
  };

  const handleArchive = (patient: Patient) => {
    // TODO: Archiver le patient
    showToast('Fonctionnalité en cours de développement', 'info');
  };

  // Calculer l'âge depuis la date de naissance
  const calculateAge = (dateOfBirth?: string): string => {
    if (!dateOfBirth) return '-';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-heading">
            Patients
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Gestion des dossiers patients
          </p>
        </div>
        <button 
          onClick={() => setNewPatientModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-vida-teal hover:bg-vida-teal-dark rounded-md transition-colors"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Nouveau Patient
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        {statsLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
                <div className="flex items-center justify-between mb-3">
                  <SkeletonCircle size="md" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-20 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Total Patients */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-full bg-vida-teal/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-vida-teal" />
                </div>
                {stats && stats.trends.total !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    stats.trends.total >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.trends.total >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    <span>{Math.abs(stats.trends.total)}%</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Total patients</p>
            </div>

            {/* Nouveaux ce mois */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                {stats && stats.trends.new_this_month !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    stats.trends.new_this_month >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.trends.new_this_month >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    <span>{Math.abs(stats.trends.new_this_month)}%</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.new_this_month || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Nouveaux ce mois</p>
            </div>

            {/* Patients actifs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.active || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Actifs (RDV &lt; 6 mois)</p>
            </div>

            {/* Patients inactifs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.inactive || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Inactifs (&gt; 6 mois)</p>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher (nom, email, téléphone...)"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
              aria-label="Rechercher un patient"
            />
          </div>

          {/* Filtre Statut */}
          <Dropdown
            value={statusFilter}
            onChange={handleStatusFilterChange}
            icon={<Filter className="h-3.5 w-3.5 text-gray-400" />}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'verified', label: 'Email vérifié' },
              { value: 'unverified', label: 'Email non vérifié' },
            ]}
            aria-label="Filtrer par statut"
          />

          {/* Filtre Genre */}
          <Dropdown
            value={genderFilter}
            onChange={handleGenderFilterChange}
            icon={<Filter className="h-3.5 w-3.5 text-gray-400" />}
            options={[
              { value: 'all', label: 'Tous les genres' },
              { value: 'M', label: 'Masculin' },
              { value: 'F', label: 'Féminin' },
            ]}
            aria-label="Filtrer par genre"
          />

          {/* Tri */}
          <Dropdown
            value={sortBy}
            onChange={handleSortChange}
            icon={<ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />}
            options={[
              { value: 'name_asc', label: 'Nom (A → Z)' },
              { value: 'name_desc', label: 'Nom (Z → A)' },
              { value: 'date_desc', label: 'Plus récents' },
              { value: 'date_asc', label: 'Plus anciens' },
            ]}
            aria-label="Trier les patients"
          />

          <div className="flex-1" />

          {/* Compteur de résultats */}
          <span className="text-xs text-gray-600">
            {filteredPatients.length} patient(s)
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 overflow-hidden vida-grain flex-1 flex flex-col">
        {isLoading ? (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Patient</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Téléphone</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Inscription</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <SkeletonCircle size="md" />
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-2.5 w-16" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Skeleton className="h-3 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-3 w-28" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-3 w-24" /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Skeleton className="h-7 w-7 rounded" />
                          <Skeleton className="h-7 w-7 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : !patients || patients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-gray-500">Aucun patient trouvé</p>
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
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Âge
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Inscription
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedPatients.map((patient: Patient, index: number) => (
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-vida-teal/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-vida-teal">
                              {patient.first_name?.[0]}{patient.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">
                              {patient.first_name} {patient.last_name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {patient.gender === 'M' ? 'Masculin' : patient.gender === 'F' ? 'Féminin' : '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-700">{patient.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-700">{patient.phone || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-700">
                          {calculateAge(patient.date_of_birth)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {patient.email_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-700 border border-green-200/50">
                            <CheckCircle className="h-3 w-3" />
                            Vérifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/10 text-gray-700 border border-gray-200/50">
                            <XCircle className="h-3 w-3" />
                            Non vérifié
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          {new Date(patient.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <PatientActionMenu
                            onViewDetails={() => handleViewDetails(patient)}
                            onEdit={() => handleEdit(patient)}
                            onCreateAppointment={() => handleCreateAppointment(patient)}
                            onSendEmail={() => handleSendEmail(patient)}
                            onCall={() => handleCall(patient)}
                            onPrint={() => handlePrint(patient)}
                            onViewStats={() => handleViewStats(patient)}
                            onArchive={() => handleArchive(patient)}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                <p className="text-xs text-gray-600">
                  Page {currentPage} sur {totalPages} • {filteredPatients.length} patient(s)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-gray-600 hover:text-vida-teal hover:bg-vida-teal/5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                          currentPage === page
                            ? 'bg-vida-teal text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 text-gray-600 hover:text-vida-teal hover:bg-vida-teal/5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de détails patient */}
      <PatientDetailsModalNew
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        patient={selectedPatient}
        onUpdate={() => refetch()}
      />

      {/* Modal nouveau patient */}
      <NewPatientModal
        isOpen={newPatientModalOpen}
        onClose={() => setNewPatientModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
