import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/authApi';
import { logError } from '../utils/logger';
import type { User, Session } from '@supabase/supabase-js';
import { refreshSessionIfNeeded } from '../lib/sessionManager';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email?: string;
  mobile?: string;
  age?: number | string;
  gender?: string;
  healthGoals?: string[];
  sleepHours?: number | string;
  exerciseFrequency?: string;
  dietPreference?: string;
  stressLevel?: string;
  onboardingCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isDemo: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  startDemo: () => void;
  refreshSession: () => Promise<void>;
  updateProfile: (profileData: UserProfile) => Promise<{ error: any }>;
  checkOnboardingStatus: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Demo user with a valid UUID
const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'demo@example.com',
  phone: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isDemo: false,
      loading: true,
      error: null,
      
      signIn: async (email, password) => {
        set({ loading: true, error: null });
        
        try {
          const data = await authApi.signIn(email, password);
          
          set({ 
            user: data.user, 
            session: data.session,
            loading: false 
          });
          
          // Load user profile data
          if (data.user) {
            try {
              const profile = await authApi.getUserProfile(data.user.id);
              set({ profile });
              
              // Save to localStorage for future use
              localStorage.setItem('biowell-user-data', JSON.stringify(profile));
            } catch (profileError) {
              logError('Error loading user profile', profileError);
            }
          }
          
          return { error: null };
        } catch (err: any) {
          const errorMessage = err.message || 'An unexpected error occurred';
          set({ error: errorMessage, loading: false });
          return { error: err };
        }
      },
      
      signUp: async (email, password) => {
        set({ loading: true, error: null });
        
        try {
          const { data, error } = await authApi.signUp(email, password);
          
          if (error) {
            set({ error: (error as any)?.message || 'An unexpected error occurred', loading: false });
            return { data: null, error };
          }
          
          // Type check and cast the data
          const authData = data as { user: User | null; session: Session | null };
          
          set({ 
            user: authData.user, 
            session: authData.session,
            loading: false 
          });
          
          return { data, error: null };
        } catch (err: any) {
          const errorMessage = err.message || 'An unexpected error occurred';
          set({ error: errorMessage, loading: false });
          return { data: null, error: err };
        }
      },
      
      signOut: async () => {
        try {
          const { isDemo } = get();
          
          if (!isDemo) {
            await authApi.signOut();
          }
          
          set({ 
            user: null, 
            session: null, 
            profile: null, 
            isDemo: false 
          });
          
          // Clear user data from localStorage
          localStorage.removeItem('biowell-user-data');
        } catch (err) {
          logError('Error signing out', err);
          
          // Even if there's an error, we should still clear the local state
          set({ 
            user: null, 
            session: null, 
            profile: null, 
            isDemo: false 
          });
          localStorage.removeItem('biowell-user-data');
        }
      },
      
      startDemo: () => {
        // Create demo user profile
        const demoProfile: UserProfile = {
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
          mobile: '+971 (50) 123 4567',
          onboardingCompleted: true
        };
        
        set({ 
          user: DEMO_USER, 
          isDemo: true, 
          loading: false,
          profile: demoProfile
        });
        
        // Save demo user data to localStorage
        localStorage.setItem('biowell-user-data', JSON.stringify(demoProfile));
      },
      
      refreshSession: async () => {
        try {
          const session = await refreshSessionIfNeeded();
          
          if (session) {
            set({ 
              session,
              user: session.user ?? null
            });
          }
        } catch (err) {
          logError('Unexpected error during session refresh', err);
        }
      },
      
      updateProfile: async (profileData) => {
        const { user, isDemo } = get();
        
        if (!user || isDemo) {
          return { error: 'User not authenticated or in demo mode' };
        }
        
        try {
          // Ensure email is included in the profile data, using only user.email with empty string fallback
          const profileWithEmail = {
            ...profileData,
            email: user.email || ''
          };
          
          // Validate that we have an email
          if (!profileWithEmail.email) {
            throw new Error('Email is required for profile creation');
          }
          
          await authApi.updateProfile(user.id, profileWithEmail);
          
          // Save to localStorage for future use
          localStorage.setItem('biowell-user-data', JSON.stringify({
            ...profileWithEmail,
            onboardingCompleted: true
          }));
          
          // Update state
          set({ 
            profile: {
              ...profileWithEmail,
              onboardingCompleted: true
            }
          });
          
          return { error: null };
        } catch (err: any) {
          logError('Error updating profile', err);
          return { error: err };
        }
      },
      
      checkOnboardingStatus: async () => {
        const { user, isDemo } = get();
        
        if (!user) return false;
        if (isDemo) return true; // Demo users are considered onboarded
        
        try {
          // First check localStorage for saved profile data
          const savedUserData = localStorage.getItem('biowell-user-data');
          if (savedUserData) {
            const userData = JSON.parse(savedUserData);
            if (userData.firstName && userData.lastName) {
              set({ profile: userData });
              return true;
            }
          }
          
          // If not in localStorage, check database
          const isOnboarded = await authApi.checkOnboardingStatus(user.id);
          
          if (isOnboarded) {
            try {
              const profile = await authApi.getUserProfile(user.id);
              set({ profile });
              localStorage.setItem('biowell-user-data', JSON.stringify(profile));
            } catch (profileError) {
              logError('Error loading user profile after onboarding check', profileError);
              // Don't fail the onboarding check if profile fetch fails
              // The user is still considered onboarded based on the database check
            }
          }
          
          return isOnboarded;
        } catch (err) {
          logError('Unexpected error checking onboarding status', err);
          return false;
        }
      },
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'biowell-auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        profile: state.profile,
        isDemo: state.isDemo
      }),
    }
  )
);