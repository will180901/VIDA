import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface AppointmentData {
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  consultation_type: 'generale' | 'specialisee';
  reason?: string;
}

interface AvailableSlotsResponse {
  date: string;
  slots: string[];
}

export function useAvailableSlots(date: string | null) {
  return useQuery<AvailableSlotsResponse>({
    queryKey: ['available-slots', date],
    queryFn: () => api.get(`/appointments/slots/?date=${date}`).then(res => res.data),
    enabled: !!date,
    staleTime: 30000,
    refetchInterval: 30000,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AppointmentData) => 
      api.post('/appointments/', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useLockSlot() {
  return useMutation({
    mutationFn: (data: { date: string; time: string }) =>
      api.post('/appointments/lock/', data).then(res => res.data),
  });
}

export function useUnlockSlot() {
  return useMutation({
    mutationFn: (data: { date: string; time: string }) =>
      api.delete('/appointments/lock/', { data }).then(res => res.data),
  });
}

export function useMyAppointments() {
  return useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => api.get('/appointments/').then(res => res.data),
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      api.post(`/appointments/${id}/cancel/`, { reason }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    },
  });
}
