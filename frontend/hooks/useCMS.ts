import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ClinicSetting, HeroSlide, MedicalService, SocialLink, FAQ } from "@/types/cms";

export const useClinicSettings = () => {
  return useQuery<ClinicSetting>({
    queryKey: ["clinic-settings"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await api.get("/cms/settings/");
      return response.data;
    },
  });
};

export const useHeroSlides = () => {
  return useQuery<HeroSlide[]>({
    queryKey: ["hero-slides"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await api.get("/cms/hero-slides/");
      return response.data.results || response.data;
    },
  });
};

export const useMedicalServices = () => {
  return useQuery<MedicalService[]>({
    queryKey: ["medical-services"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await api.get("/cms/services/");
      return response.data.results || response.data;
    },
  });
};

export const useSocialLinks = () => {
  return useQuery<SocialLink[]>({
    queryKey: ["social-links"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await api.get("/cms/social-links/");
      return response.data.results || response.data;
    },
  });
};

export const useFAQs = () => {
  return useQuery<FAQ[]>({
    queryKey: ["faqs"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await api.get("/cms/faqs/");
      return response.data.results || response.data;
    },
  });
};

export interface ClinicSchedule {
  id: number;
  day_of_week: number;
  day_name: string;
  is_open: boolean;
  morning_start: string | null;
  morning_end: string | null;
  afternoon_start: string | null;
  afternoon_end: string | null;
  slot_duration: number;
}

export interface ClinicHoliday {
  id: number;
  date: string;
  name: string;
  is_recurring: boolean;
}

export function useClinicSchedules() {
  return useQuery<ClinicSchedule[]>({
    queryKey: ['clinic-schedules'],
    queryFn: () => api.get('/cms/schedules/').then(res => res.data.results || res.data),
    staleTime: 60000,
  });
}

export function useClinicHolidays() {
  return useQuery<ClinicHoliday[]>({
    queryKey: ['clinic-holidays'],
    queryFn: () => api.get('/cms/holidays/').then(res => res.data.results || res.data),
    staleTime: 60000,
  });
}

export interface WhyVidaReason {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  order: number;
  is_active: boolean;
}

export function useWhyVidaReasons() {
  return useQuery<WhyVidaReason[]>({
    queryKey: ['why-vida-reasons'],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await api.get('/cms/why-vida-reasons/');
      return response.data.results || response.data;
    },
  });
}
