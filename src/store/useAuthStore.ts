import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';
import { logError, logInfo } from '../utils/logger';
import type { User, Session } from '@supabase/supabase-js';

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

// Helper function to generate a captcha token
const generateCaptchaToken = async () => {
  try {
    // In a real implementation, this would integrate with a captcha provider
    // For development, we're using a dummy token
    const captchaSecretKey = import.meta.env.VITE_CAPTCHA_SECRET_KEY;
    
    if (!captchaSecretKey) {
      logInfo('Captcha secret key not found in environment variables');
      return null;
    }
    
    // Simulate a captcha verification request
    return `${captchaSecretKey}-${Date.now()}`;
  } catch (error) {
    logError('Error generating captcha token', error);
    return null;
  }
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
          // Generate captcha token
          const captchaToken = await generateCaptchaToken();
          
          const { data, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password,
            options: {
              captchaToken
            }
          });
          
          if (error) {
            set({ error: error.message, loading: false });
            return { error };
          }
          
          set({ 
            user: data.user, 
            session: data.session,
            loading: false 
          });
          
          // Load user profile data
          if (data.user) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, onboarding_completed, mobile')
              .eq('id', data.user.id)
              .maybeSingle();
              
            if (!profileError && profileData) {
              const userProfile: UserProfile = {
                firstName: profileData.first_name || '',
                lastName: profileData.last_name || '',
                email: data.user.email || '',
                mobile: profileData.mobile || '',
                onboardingCompleted: profileData.onboarding_completed || false
              };
              
              set({ profile: userProfile });
              
              // Save to localStorage for future use
              localStorage.setItem('biowell-user-data', JSON.stringify(userProfile));
            }
          }
          
          return { error: null };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
          set({ error: errorMessage, loading: false });
          return { error: err };
        }
      },
      
      signUp: async (email, password) => {
        set({ loading: true, error: null });
        
        try {
          // Generate captcha token
          const captchaToken = await generateCaptchaToken();
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              captchaToken,
              emailRedirectTo: window.location.origin + '/dashboard',
              data: {
                email: email
              }
            }
          });
          
          if (error) {
            set({ error: error.message, loading: false });
            return { data: null, error };
          }
          
          set({ 
            user: data.user, 
            session: data.session,
            loading: false 
          });
          
          // Create default profile for new user
          if (data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                email: data.user.email,
                onboarding_completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (profileError) {
              logError('Error creating default profile', profileError);
            }
          }
          
          return { data, error: null };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
          set({ error: errorMessage, loading: false });
          return { data: null, error: err };
        }
      },
      
      signOut: async () => {
        try {
          const { isDemo } = get();
          
          if (!isDemo) {
            const { error } = await supabase.auth.signOut();
            if (error) {
              throw error;
            }
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
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            logError('Error refreshing session', error);
            
            // If the error is about invalid refresh token, clear the session
            if (error.message.includes('Invalid Refresh Token') || 
                error.message.includes('Refresh Token Not Found')) {
              logInfo('Invalid refresh token detected, clearing session');
              await supabase.auth.signOut();
              set({ 
                user: null, 
                session: null, 
                profile: null 
              });
              localStorage.removeItem('biowell-user-data');
            }
            
            return;
          }
          
          set({ 
            session: data.session,
            user: data.session?.user ?? null
          });
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
          // Update profile in database
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              first_name: profileData.firstName,
              last_name: profileData.lastName,
              mobile: profileData.mobile,
              onboarding_completed: true,
              updated_at: new Date().toISOString(),
            });
          
          if (error) throw error;
          
          // Update user metadata
          const { error: metadataError } = await supabase.auth.updateUser({
            data: { 
              first_name: profileData.firstName,
              last_name: profileData.lastName,
              mobile: profileData.mobile,
              onboarding_completed: true
            }
          });
          
          if (metadataError) {
            logError('Error updating user metadata', metadataError);
          }
          
          // Save to localStorage for future use
          localStorage.setItem('biowell-user-data', JSON.stringify({
            ...profileData,
            email: user.email,
            onboardingCompleted: true
          }));
          
          // Update state
          set({ 
            profile: {
              ...profileData,
              email: user.email,
              onboardingCompleted: true
            }
          });
          
          return { error: null };
        } catch (err) {
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
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed, first_name, last_name, email, is_admin, mobile')
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) {
            logError('Error checking onboarding status', error);
            return false;
          }
          
          // If no profile exists yet, create a default one
          if (!data) {
            const { error: insertError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email,
                onboarding_completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              logError('Error creating default profile', insertError);
            }
            return false;
          }
          
          // If we have profile data in the database, save it to localStorage for future use
          if (data && (data.onboarding_completed || (data.first_name && data.last_name))) {
            const profileData: UserProfile = {
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              email: user.email || '',
              mobile: data.mobile || '',
              onboardingCompleted: data.onboarding_completed || false
            };
            
            set({ profile: profileData });
            localStorage.setItem('biowell-user-data', JSON.stringify(profileData));
            return true;
          }
          
          return false;
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