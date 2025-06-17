import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSupabase } from './SupabaseContext';
import { useError } from './ErrorContext';
import { ErrorCode, createErrorObject } from '../utils/errorHandling';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  startDemo: () => void;
  refreshSession: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
  updateUserProfile: (profileData: UserProfileData) => Promise<{ error: any }>;
  userProfile: UserProfileData | null;
}

export interface UserProfileData {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { supabase, isInitialized } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const { addError } = useError();

  // Function to check if user has completed onboarding
  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (!user) return false;
    if (isDemo) return true; // Demo users are considered onboarded
    
    try {
      // First check localStorage for saved profile data
      const savedUserData = localStorage.getItem('biowell-user-data');
      let onboardingCompleted = false;
      
      if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        onboardingCompleted = !!(userData.firstName && userData.lastName);
      } else {
        // If not in localStorage, check database
        if (!isInitialized) {
          console.warn('Skipping onboarding check - Supabase not initialized');
          return false;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, first_name, last_name, email, is_admin')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          addError(createErrorObject(
            'Error checking onboarding status',
            'warning',
            ErrorCode.API_REQUEST_FAILED,
            'auth',
            error
          ));
          return false;
        }
        
        // If no profile exists yet, create a default one
        if (!data) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            addError(createErrorObject(
              'Error creating user profile',
              'warning',
              ErrorCode.API_REQUEST_FAILED,
              'auth',
              insertError
            ));
          }
          return false;
        }
        
        // If we have profile data in the database, save it to localStorage for future use
        if (data && (data.onboarding_completed || (data.first_name && data.last_name))) {
          const profileData: UserProfileData = {
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: user.email || '',
            mobile: '',
            onboardingCompleted: data.onboarding_completed || false
          };
          
          setUserProfile(profileData);
          localStorage.setItem('biowell-user-data', JSON.stringify(profileData));
          return true;
        }
      }
      
      return false;
    } catch (err) {
      addError(createErrorObject(
        'Unexpected error checking onboarding status',
        'error',
        ErrorCode.UNKNOWN_ERROR,
        'auth',
        err
      ));
      return false;
    }
  };

  // Function to update user profile
  const updateUserProfile = async (profileData: UserProfileData): Promise<{ error: any }> => {
    if (!user || isDemo) {
      return { error: 'User not authenticated or in demo mode' };
    }
    
    try {
      if (!isInitialized) {
        return { error: 'Database connection not available' };
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
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
        console.error('Error updating user metadata:', metadataError);
        addError(createErrorObject(
          'Error updating user metadata',
          'warning',
          ErrorCode.API_REQUEST_FAILED,
          'auth',
          metadataError
        ));
      }
      
      // Save to localStorage for future use
      localStorage.setItem('biowell-user-data', JSON.stringify({
        ...profileData,
        email: user.email,
        onboardingCompleted: true
      }));
      
      // Update state
      setUserProfile({
        ...profileData,
        email: user.email,
        onboardingCompleted: true
      });
      
      return { error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      addError(createErrorObject(
        'Error updating user profile',
        'error',
        ErrorCode.API_REQUEST_FAILED,
        'auth',
        err
      ));
      return { error: err };
    }
  };

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      if (!isInitialized) {
        console.warn('Skipping session refresh - Supabase not initialized');
        return;
      }

      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        addError(createErrorObject(
          'Your session has expired. Please sign in again.',
          'error',
          ErrorCode.AUTH_EXPIRED_SESSION,
          'auth',
          error
        ));
        
        // If the error is about invalid refresh token, clear the session
        if (error.message.includes('Invalid Refresh Token') || 
            error.message.includes('Refresh Token Not Found')) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setUserProfile(null);
          localStorage.removeItem('biowell-user-data');
          
          // Redirect to login page
          window.location.href = '/login';
        }
        return;
      }
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (err) {
      console.error('Unexpected error during session refresh:', err);
      addError(createErrorObject(
        'Error refreshing your session',
        'error',
        ErrorCode.UNKNOWN_ERROR,
        'auth',
        err
      ));
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have saved user data in localStorage
        const savedUserData = localStorage.getItem('biowell-user-data');
        if (savedUserData) {
          setUserProfile(JSON.parse(savedUserData));
        }
        
        // Check for demo mode in URL params
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('demo') === 'true') {
          startDemo();
          return;
        }
        
        if (!isInitialized) {
          console.warn('Skipping auth initialization - Supabase not initialized');
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          addError(createErrorObject(
            'Error retrieving your session',
            'error',
            ErrorCode.AUTH_EXPIRED_SESSION,
            'auth',
            error
          ));
          setLoading(false);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        // If session exists but is close to expiry, refresh it
        if (data.session) {
          const expiresAt = data.session.expires_at;
          const now = Math.floor(Date.now() / 1000);
          
          // If session expires in less than 5 minutes (300 seconds), refresh it
          if (expiresAt && expiresAt - now < 300) {
            await refreshSession();
          }
          
          // Load user profile data if not already loaded
          if (data.session.user && !userProfile) {
            await loadUserProfile(data.session.user.id);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        addError(createErrorObject(
          'Error initializing authentication',
          'error',
          ErrorCode.UNKNOWN_ERROR,
          'auth',
          err
        ));
      } finally {
        setLoading(false);
      }
    };

    const loadUserProfile = async (userId: string) => {
      try {
        if (!isInitialized) {
          console.warn('Skipping profile load - Supabase not initialized');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, onboarding_completed')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error loading user profile:', error);
          addError(createErrorObject(
            'Error loading your profile data',
            'warning',
            ErrorCode.API_REQUEST_FAILED,
            'auth',
            error
          ));
          return;
        }
        
        if (data) {
          const profileData: UserProfileData = {
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            mobile: '',
            onboardingCompleted: data.onboarding_completed || false
          };
          
          setUserProfile(profileData);
          localStorage.setItem('biowell-user-data', JSON.stringify(profileData));
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        addError(createErrorObject(
          'Error loading your profile data',
          'warning',
          ErrorCode.UNKNOWN_ERROR,
          'auth',
          err
        ));
      }
    };

    if (!isDemo) {
      initializeAuth();
    }

    // Set up auth listener only if Supabase is initialized
    let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null;
    
    if (isInitialized) {
      authListener = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);
          setSession(session);
          setUser(session?.user ?? null);
          
          // If user signed in, load their profile
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserProfile(session.user.id);
          }
          
          // If the event is SIGNED_OUT, clear the session and profile
          if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            setUser(null);
            setSession(null);
            setUserProfile(null);
            localStorage.removeItem('biowell-user-data');
          }
          
          setLoading(false);
        }
      );
    }

    // Set up a timer to periodically check and refresh the session if needed
    const refreshInterval = setInterval(async () => {
      if (!isDemo && session && isInitialized) {
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        // If session expires in less than 5 minutes (300 seconds), refresh it
        if (expiresAt && expiresAt - now < 300) {
          console.log('Session expiring soon, refreshing...');
          await refreshSession();
        }
      }
    }, 60000); // Check every minute

    return () => {
      if (authListener?.data?.subscription) {
        authListener.subscription.unsubscribe();
      }
      clearInterval(refreshInterval);
    };
  }, [supabase, isDemo, session, refreshSession, isInitialized, userProfile, addError]);

  const signIn = async (email: string, password: string) => {
    try {
      // Check if Supabase is initialized first
      if (!isInitialized) {
        console.error('Cannot sign in: Supabase not initialized');
        return { 
          error: new Error('Authentication service is not available. Please try again later or use the demo.') 
        };
      }

      // Generate captcha token
      const captchaToken = await generateCaptchaToken();
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          captchaToken,
          redirectTo: 'https://biowell.ai/auth/v1/callback'
        }
      });
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Add to global error context
        addError(createErrorObject(
          error.message.includes('Invalid login credentials')
            ? 'Incorrect email or password. Please try again.'
            : error.message,
          'error',
          ErrorCode.AUTH_INVALID_CREDENTIALS,
          'auth',
          error
        ));
        
        return { error };
      }
      
      // Store session in memory
      setSession(data.session);
      setUser(data.user);
      
      // Load user profile data
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, onboarding_completed')
          .eq('id', data.user.id)
          .single();
          
        if (!profileError && profileData) {
          const userProfileData: UserProfileData = {
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: data.user.email || '',
            mobile: '',
            onboardingCompleted: profileData.onboarding_completed || false
          };
          
          setUserProfile(userProfileData);
          localStorage.setItem('biowell-user-data', JSON.stringify(userProfileData));
        }
      }
      
      return { error: null };
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      
      // Add to global error context
      addError(createErrorObject(
        'An unexpected error occurred during sign in. Please try again.',
        'error',
        ErrorCode.UNKNOWN_ERROR,
        'auth',
        err
      ));
      
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Check if Supabase is initialized first
      if (!isInitialized) {
        console.error('Cannot sign up: Supabase not initialized');
        return { 
          data: null, 
          error: new Error('Authentication service is not available. Please try again later or use the demo.') 
        };
      }

      // Generate captcha token
      const captchaToken = await generateCaptchaToken();
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          captchaToken,
          emailRedirectTo: 'https://biowell.ai/auth/v1/callback'
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        
        // Add to global error context
        addError(createErrorObject(
          error.message,
          'error',
          ErrorCode.API_REQUEST_FAILED,
          'auth',
          error
        ));
        
        return { data: null, error };
      }
      
      // Create default profile for new user
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error('Error creating default profile:', profileError);
          
          // Add to global error context
          addError(createErrorObject(
            'Error creating your profile. Some features might be limited.',
            'warning',
            ErrorCode.API_REQUEST_FAILED,
            'auth',
            profileError
          ));
        }
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      
      // Add to global error context
      addError(createErrorObject(
        'An unexpected error occurred during sign up. Please try again.',
        'error',
        ErrorCode.UNKNOWN_ERROR,
        'auth',
        err
      ));
      
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      if (!isDemo && isInitialized) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Sign out error:', error);
          
          // Add to global error context
          addError(createErrorObject(
            'Error signing out. Please try again.',
            'warning',
            ErrorCode.API_REQUEST_FAILED,
            'auth',
            error
          ));
          
          throw error;
        }
      }
      setIsDemo(false);
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Clear user data from localStorage
      localStorage.removeItem('biowell-user-data');
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      
      // Add to global error context
      addError(createErrorObject(
        'Error during sign out. Please try refreshing the page.',
        'warning',
        ErrorCode.UNKNOWN_ERROR,
        'auth',
        err
      ));
      
      // Even if there's an error, we should still clear the local state
      setIsDemo(false);
      setUser(null);
      setSession(null);
      setUserProfile(null);
      localStorage.removeItem('biowell-user-data');
    }
  };

  const startDemo = () => {
    setIsDemo(true);
    setUser(DEMO_USER);
    setLoading(false);
    
    // Create demo user profile
    const demoProfile: UserProfileData = {
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      mobile: '+971 (50) 123 4567',
      onboardingCompleted: true
    };
    
    setUserProfile(demoProfile);
    
    // Save demo user data to localStorage
    localStorage.setItem('biowell-user-data', JSON.stringify(demoProfile));
  };

  // Helper function to generate a captcha token
  const generateCaptchaToken = async () => {
    try {
      // In a real implementation, this would integrate with a captcha provider like hCaptcha or reCAPTCHA
      // For development purposes, we're using a dummy token
      const captchaSecretKey = import.meta.env.VITE_CAPTCHA_SECRET_KEY;
      
      if (!captchaSecretKey) {
        console.warn('Captcha secret key not found in environment variables');
        return null;
      }
      
      // Simulate a captcha verification request
      return `${captchaSecretKey}-${Date.now()}`;
    } catch (error) {
      console.error('Error generating captcha token:', error);
      return null;
    }
  };

  const value = {
    user: isDemo ? DEMO_USER : user,
    session,
    loading,
    isDemo,
    signIn,
    signUp,
    signOut,
    startDemo,
    refreshSession,
    checkOnboardingStatus,
    updateUserProfile,
    userProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext }