export interface User {
  id: string;
  email: string;
  password_hash: string; // Stored securely, never returned to client
  first_name: string;
  last_name: string;
  phone?: string;
  address?: Address;
  health_data?: HealthData;
  preferences?: UserPreferences;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  role: 'customer' | 'admin';
  is_verified: boolean;
  reset_token?: string;
  reset_token_expires?: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface HealthData {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  activity_level?: string;
  health_goals?: string[];
  allergies?: string[];
  medical_conditions?: string[];
  current_supplements?: string[];
}

export interface UserPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  preferred_categories?: string[];
  dietary_preferences?: string[];
}