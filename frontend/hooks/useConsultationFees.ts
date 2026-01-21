import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ConsultationFee {
  id: number;
  consultation_type: 'generale' | 'specialisee' | 'suivi' | 'urgence';
  consultation_type_display: string;
  price: number;
  description: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Hook pour récupérer tous les tarifs de consultation actifs
 */
export function useConsultationFees() {
  return useQuery<ConsultationFee[]>({
    queryKey: ['consultation-fees'],
    queryFn: async () => {
      const response = await api.get('/cms/consultation-fees/');
      // L'API peut retourner soit un tableau direct, soit un objet avec results
      const data = response.data;
      return Array.isArray(data) ? data : (data.results || []);
    },
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
  });
}

/**
 * Hook pour récupérer le prix d'un type de consultation spécifique
 */
export function useConsultationFeePrice(consultationType: string) {
  const { data: fees } = useConsultationFees();
  
  const fee = fees?.find(f => f.consultation_type === consultationType);
  return fee?.price || 0;
}

/**
 * Fonction utilitaire pour obtenir tous les tarifs sous forme d'objet
 */
export function getConsultationFeesMap(fees: ConsultationFee[] | undefined): Record<string, number> {
  if (!fees || !Array.isArray(fees) || fees.length === 0) return {};
  
  const map: Record<string, number> = {};
  fees.forEach((fee) => {
    map[fee.consultation_type] = fee.price;
  });
  return map;
}
