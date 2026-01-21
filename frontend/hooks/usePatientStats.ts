import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface PatientStats {
  total: number;
  new_this_month: number;
  active: number;
  inactive: number;
  trends: {
    total: number;
    new_this_month: number;
    active: number;
    inactive: number;
  };
}

export function usePatientStats() {
  return useQuery({
    queryKey: ['patient-stats'],
    queryFn: async () => {
      const response = await api.get('/auth/patients/stats/');
      return response.data as PatientStats;
    },
    staleTime: 30000, // Cache 30 secondes
    refetchInterval: 30000, // Rafraîchir toutes les 30s
  });
}
