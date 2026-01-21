import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface AppointmentData {
  patient_first_name: string;
  patient_last_name: string;
  patient_email?: string;
  patient_phone: string;
  date: string;
  time: string;
  consultation_type: 'generale' | 'specialisee' | 'suivi' | 'urgence';
  reason?: string;
}

interface AvailableSlotsResponse {
  date: string;
  slots: string[];
}

export function useAvailableSlots(date: string | null) {
  return useQuery<AvailableSlotsResponse>({
    queryKey: ['available-slots', date],
    queryFn: () => api.get(`/appointments/appointments/available_slots/?date=${date}`).then(res => res.data),
    enabled: !!date,
    staleTime: 30000,
    refetchInterval: 30000,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AppointmentData) => 
      api.post('/appointments/appointments/', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useLockSlot() {
  return useMutation({
    mutationFn: (data: { date: string; time: string }) =>
      api.post('/appointments/appointments/lock_slot/', data).then(res => res.data),
  });
}

export function useUnlockSlot() {
  return useMutation({
    mutationFn: (data: { date: string; time: string }) =>
      api.post('/appointments/appointments/unlock_slot/', data).then(res => res.data),
  });
}

export function useMyAppointments() {
  return useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => api.get('/appointments/appointments/').then(res => res.data),
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      api.post(`/appointments/appointments/${id}/cancel/`, { reason }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    },
  });
}


// ============================================================================
// NOUVEAUX HOOKS POUR WORKFLOW BIDIRECTIONNEL
// ============================================================================

/**
 * Hook pour que l'admin réponde à une demande de RDV
 */
export function useRespondToAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      action, 
      data 
    }: { 
      id: number; 
      action: 'accept' | 'reject' | 'propose'; 
      data: any 
    }) => {
      return api.post(`/appointments/appointments/${id}/respond/`, { action, ...data })
        .then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

/**
 * Hook pour que le patient accepte une proposition
 */
export function useAcceptProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      proposalId 
    }: { 
      id: number; 
      proposalId: number 
    }) => {
      return api.post(`/appointments/appointments/${id}/accept/`, { proposal_id: proposalId })
        .then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Hook pour que le patient refuse une proposition
 */
export function useRejectProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      proposalId,
      reason 
    }: { 
      id: number; 
      proposalId: number;
      reason?: string;
    }) => {
      return api.post(`/appointments/appointments/${id}/reject/`, { 
        proposal_id: proposalId,
        reason 
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Hook pour que le patient contre-propose une date
 */
export function useCounterPropose() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      proposedDate, 
      proposedTime, 
      message 
    }: { 
      id: number; 
      proposedDate: string; 
      proposedTime: string; 
      message?: string 
    }) => {
      return api.post(`/appointments/appointments/${id}/counter_propose/`, { 
        proposed_date: proposedDate, 
        proposed_time: proposedTime, 
        patient_message: message 
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Hook pour que le patient modifie un RDV confirmé
 */
export function useModifyAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      newDate, 
      newTime, 
      reason 
    }: { 
      id: number; 
      newDate: string; 
      newTime: string; 
      reason?: string 
    }) => {
      return api.post(`/appointments/appointments/${id}/modify/`, { 
        new_date: newDate, 
        new_time: newTime, 
        reason 
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Hook pour récupérer l'historique d'un RDV
 */
export function useAppointmentHistory(appointmentId: number | null) {
  return useQuery({
    queryKey: ['appointment-history', appointmentId],
    queryFn: () => api.get(`/appointments/appointments/${appointmentId}/history/`)
      .then(res => res.data.history), // ✅ Extraire le tableau history
    enabled: !!appointmentId,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    staleTime: 10000, // Considérer les données comme fraîches pendant 10 secondes
  });
}

/**
 * Hook pour récupérer tous les RDV (admin)
 */
export function useAppointments(filters?: {
  status?: string;
  date?: string;
  patient?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.date) params.append('date', filters.date);
  if (filters?.patient) params.append('patient', filters.patient);
  
  const queryString = params.toString();
  
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => api.get(`/appointments/appointments/${queryString ? `?${queryString}` : ''}`)
      .then(res => res.data),
  });
}

/**
 * Hook pour l'édition admin d'un RDV
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: Partial<AppointmentData> & { status?: string; notes_staff?: string; }
    }) => {
      // Si le status n'est pas fourni, récupérer le RDV actuel pour obtenir le status
      if (!data.status) {
        const currentAppointment = await api.get(`/appointments/appointments/${id}/`);
        data = { ...data, status: currentAppointment.data.status };
      }
      
      return api.patch(`/appointments/appointments/${id}/`, data)
        .then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}

/**
 * Hook pour supprimer un RDV
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => {
      return api.delete(`/appointments/appointments/${id}/`)
        .then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
