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

interface ChartData {
  appointments_evolution: Array<{
    name: string;
    rdv: number;
  }>;
  status_distribution: Array<{
    name: string;
    value: number;
    fill: string;
    description?: string;
  }>;
  revenue_data: Array<{
    month: string;
    revenue: number;
  }>;
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

export function useChartData() {
  return useQuery<ChartData>({
    queryKey: ['chart-data'],
    queryFn: async () => {
      const response = await api.get('/appointments/appointments/chart_data/');
      return response.data;
    },
    refetchInterval: 60000, // Rafraîchir toutes les minutes
    staleTime: 30000, // Considérer les données comme fraîches pendant 30 secondes
  });
}
