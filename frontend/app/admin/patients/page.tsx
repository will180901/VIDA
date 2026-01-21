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
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import PatientDetailsModal from '@/components/admin/PatientDetailsModal';

interface Patient {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  email_verified: boolean;
  created_at: string;
  gender: string;
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Récupérer la liste des patients
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await api.get('/auth/patients/');
      return response.data;
    },
  });

  // S'assurer que patients est un tableau
  const patients = Array.isArray(patientsData) ? patientsData : [];

  // Filtrer les patients selon la recherche
  const filteredPatients = patients.filter((patient: Patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.first_name?.toLowerCase().includes(searchLower) ||
      patient.last_name?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  // Reset page quand on change la recherche
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailsModalOpen(true);
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
            Gestion des patients et de leurs dossiers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            {filteredPatients.length} patient(s)
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
              placeholder="Rechercher (nom, email, téléphone...)"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
            />
          </div>

          <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-vida-teal hover:bg-vida-teal-dark rounded-md transition-colors">
            <UserPlus className="h-3.5 w-3.5" />
            Nouveau Patient
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 overflow-hidden vida-grain flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-vida-teal" />
          </div>
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
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Téléphone
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
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-700">{patient.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-700">{patient.phone || '-'}</span>
                        </div>
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(patient)}
                            className="p-1.5 text-gray-600 hover:text-vida-teal hover:bg-vida-teal/5 rounded transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className="p-1.5 text-gray-600 hover:text-vida-teal hover:bg-vida-teal/5 rounded transition-colors"
                            title="Voir RDV"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                          </button>
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
      <PatientDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        patient={selectedPatient}
      />
    </div>
  );
}
