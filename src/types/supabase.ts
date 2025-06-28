export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          is_admin: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      health_metrics: {
        Row: {
          id: string
          user_id: string
          date: string
          deep_sleep: number | null
          rem_sleep: number | null
          steps: number | null
          calories: number | null
          heart_rate: number | null
          bmi: number | null
          weight: number | null
          cgm: number | null
          health_score: number | null
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          deep_sleep?: number | null
          rem_sleep?: number | null
          steps?: number | null
          calories?: number | null
          heart_rate?: number | null
          bmi?: number | null
          weight?: number | null
          cgm?: number | null
          health_score?: number | null
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          deep_sleep?: number | null
          rem_sleep?: number | null
          steps?: number | null
          calories?: number | null
          heart_rate?: number | null
          bmi?: number | null
          weight?: number | null
          cgm?: number | null
          health_score?: number | null
          source?: string | null
          created_at?: string
        }
      }
      quiz_responses: {
        Row: {
          id: string
          user_id: string
          age: number | null
          gender: string | null
          height_cm: number | null
          weight_kg: number | null
          health_goals: string[] | null
          sleep_hours: number | null
          exercise_frequency: string | null
          diet_preference: string | null
          stress_level: string | null
          existing_conditions: string[] | null
          medications: string[] | null
          supplements: string[] | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          age?: number | null
          gender?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          health_goals?: string[] | null
          sleep_hours?: number | null
          exercise_frequency?: string | null
          diet_preference?: string | null
          stress_level?: string | null
          existing_conditions?: string[] | null
          medications?: string[] | null
          supplements?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          age?: number | null
          gender?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          health_goals?: string[] | null
          sleep_hours?: number | null
          exercise_frequency?: string | null
          diet_preference?: string | null
          stress_level?: string | null
          existing_conditions?: string[] | null
          medications?: string[] | null
          supplements?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
      }
      wearable_connections: {
        Row: {
          id: string
          user_id: string
          provider: string
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      supplements: {
        Row: {
          id: string
          name: string
          description: string
          benefits: string[] | null
          dosage: string | null
          price: number
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          benefits?: string[] | null
          dosage?: string | null
          price: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          benefits?: string[] | null
          dosage?: string | null
          price?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      user_supplements: {
        Row: {
          id: string
          user_id: string
          supplement_id: string
          subscription_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          supplement_id: string
          subscription_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          supplement_id?: string
          subscription_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          message: string
          response: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          response: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          response?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}