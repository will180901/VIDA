import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface DashboardStats {
  today_appointments: {
    total: number;
    confirmed: number;
    pending: number;
    subtitle: string;
  };
  total_patients: {
    total: number;
    new_this_month: number;
    subtitle: string;
  };
  month_revenue: {
    amount: number;
    formatted: string;
    consultations: number;
    subtitle: string;
  };
  fill_rate: {
    rate: number;
    formatted: string;
    subtitle: string;
  };
  trends: {
    appointments: number;
    patients: number;
    revenue: number;
    fill_rate: number;
  };
  recent_appointments: any[];
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/appointments/appointments/dashboard_stats/');
      return response.data;
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    staleTime: 10000, // Considérer les données comme fraîches pendant 10 secondes
  });
}
