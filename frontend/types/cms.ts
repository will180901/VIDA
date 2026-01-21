export interface ClinicSetting {
  id: number;
  name: string;
  address: string;
  phone_primary: string;
  phone_secondary: string;
  whatsapp: string;
  email: string;
  fee_general: number;
  fee_specialized: number;
  opening_hours: Record<string, string>;
  about_text: string;
  rccm: string;
  niu: string;
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  order: number;
  is_active: boolean;
}

export interface MedicalService {
  id: number;
  title: string;
  description: string;
  details: string;
  image: string;
  icon_name: string;
  order: number;
  is_active: boolean;
}

export interface SocialLink {
  id: number;
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'linkedin' | 'tiktok' | 'youtube';
  url: string;
  order: number;
  is_active: boolean;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
}
