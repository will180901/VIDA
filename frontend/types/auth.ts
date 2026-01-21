export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: 'patient' | 'staff' | 'doctor' | 'admin';
  date_of_birth: string | null;
  gender: 'M' | 'F' | '';
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  avatar: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  new_password_confirm: string;
}
