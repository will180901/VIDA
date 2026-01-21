'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Plus, Loader2 } from 'lucide-react';
import { useMyAppointments } from '@/hooks/useAppointments';
import AppointmentCard from '@/components/patient/AppointmentCard';
import AppointmentModal from '@/components/ui/AppointmentModal';

type TabType = 'upcoming' | 'past' | 'cancelled';

const tabs = [
  { id: 'upcoming' as TabType, label: 'À venir', count: 0 },
  { id: 'past' as TabType, label: 'Passés', count: 0 },
  { id: 'cancelled' as TabType, label: 'Annulés', count: 0 },
];

export default function PatientAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [newAppointmentModalOpen, setNewAppointmentModalOpen] = useState(false);
  
  const { data: appointmentsData, isLoading, refetch } = useMyAppointments();

  // Gérer la structure de réponse (array ou objet avec results)
  const allAppointments = Array.isArray(appointmentsData) 
    ? appointmentsData 
    : appointmentsData?.results || [];

  // Filtrer les RDV selon l'onglet actif
  const now = new Date();
  const upcomingAppointments = allAppointments.filter((apt: any) => {
    const aptDate = new Date(apt.date);
    return aptDate >= now && !['cancelled', 'rejected', 'rejected_by_patient'].includes(apt.status);
  });

  const pastAppointments = allAppointments.filter((apt: any) => {
    const aptDate = new Date(apt.date);
    return aptDate < now && ['completed', 'no_show'].includes(apt.status);
  });

  const cancelledAppointments = allAppointments.filter((apt: any) => {
    return ['cancelled', 'rejected', 'rejected_by_patient'].includes(apt.status);
  });

  // Mettre à jour les compteurs
  const tabsWithCounts = tabs.map(tab => ({
    ...tab,
    count: tab.id === 'upcoming' ? upcomingAppointments.length :
           tab.id === 'past' ? pastAppointments.length :
           cancelledAppointments.length
  }));

  // Sélectionner les RDV à afficher
  const displayedAppointments = 
    activeTab === 'upcoming' ? upcomingAppointments :
    activeTab === 'past' ? pastAppointments :
    cancelledAppointments;

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-heading">
            Mes rendez-vous
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Gérez vos rendez-vous et consultations
          </p>
        </div>
        <button
          onClick={() => setNewAppointmentModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-vida-teal rounded-md hover:bg-vida-teal/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nouveau RDV
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 vida-grain flex-shrink-0">
        <div className="flex border-b border-gray-200">
          {tabsWithCounts.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-vida-teal'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  activeTab === tab.id
                    ? 'bg-vida-teal/10 text-vida-teal'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activePatientTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-vida-teal"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 vida-grain flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-vida-teal" />
          </div>
        ) : displayedAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Calendar className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {activeTab === 'upcoming' && 'Aucun rendez-vous à venir'}
              {activeTab === 'past' && 'Aucun rendez-vous passé'}
              {activeTab === 'cancelled' && 'Aucun rendez-vous annulé'}
            </p>
            <p className="text-xs text-gray-500 text-center max-w-sm">
              {activeTab === 'upcoming' && 'Prenez rendez-vous en cliquant sur le bouton "Nouveau RDV"'}
              {activeTab === 'past' && 'Vos rendez-vous terminés apparaîtront ici'}
              {activeTab === 'cancelled' && 'Vos rendez-vous annulés apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-3">
              {displayedAppointments.map((appointment: any, index: number) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <AppointmentCard
                    appointment={appointment}
                    onUpdate={refetch}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Appointment Modal */}
      <AppointmentModal
        isOpen={newAppointmentModalOpen}
        onClose={() => {
          setNewAppointmentModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
