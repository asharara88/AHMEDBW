import { apiClient, ErrorType, ApiError } from './apiClient';
import { supabase } from '../lib/supabaseClient';
import { logError, logInfo } from '../utils/logger';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '../store/useAuthStore';
import { refreshSessionIfNeeded } from '../lib/sessionManager';

// Helper function to generate a Google reCAPTCHA token
const generateCaptchaToken = async () => {
  try {
    // For Google reCAPTCHA integration
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      logInfo('Google Client ID not found in environment variables');
      return null;
    }
    
    // In a real implementation, this would integrate with Google reCAPTCHA
    // For development, we're using a dummy token
    return `${googleClientId}-${Date.now()}`;
  } catch (error) {
    logError('Error generating captcha token', error);
    return null;
  }
};

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

export const authApi = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Generate captcha token
      const captchaToken = await generateCaptchaToken();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken,
          redirectTo: window.location.origin + '/dashboard'
        }
      });

      if (error) {
        const apiError: ApiError = {
          type: ErrorType.AUTHENTICATION,
          message: error.message || 'Login failed',
          originalError: error
        };
        throw apiError;
      }

      return data;
    } catch (error) {
      // If it's already an ApiError, just rethrow it
      if (error && typeof error === 'object' && 'type' in error) {
        throw error;
      }
      
      // Otherwise, create a new ApiError
      const apiError: ApiError = {
        type: ErrorType.UNKNOWN,
        message: 'Login failed',
        originalError: error
      };
      
      logError('Login error', error);
      throw apiError;
    }
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string): Promise<{ data: any; error: any }> {
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
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logError('Signup error', error);
      return { data: null, error };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      logError('Signout error', error);
      throw error;
    }
  },

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<Session | null> {
    return refreshSessionIfNeeded();
  },

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, onboarding_completed, mobile')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logError('Failed to fetch user profile', error);
        throw error;
      }

      // If no profile exists, return null instead of throwing an error
      if (!data) {
        return null;
      }

      return {
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        mobile: data.mobile || '',
        onboardingCompleted: data.onboarding_completed || false
      };
    } catch (error) {
      logError('Error fetching user profile', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: UserProfile): Promise<void> {
    // Ensure email is provided
    if (!profileData.email) {
      throw new Error('Email is required for profile update');
    }

    await apiClient.request(
      () => supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: profileData.email,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          mobile: profileData.mobile,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }),
      'Failed to update profile'
    );
    
    // Update user metadata
    try {
      await supabase.auth.updateUser({
        data: { 
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          mobile: profileData.mobile,
          onboarding_completed: true
        }
      });
    } catch (error) {
      logError('Error updating user metadata', error);
      // Continue even if metadata update fails
    }
  },

  /**
   * Check if user has completed onboarding
   */
  async checkOnboardingStatus(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, first_name, last_name')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logError('Failed to check onboarding status', error);
        throw error;
      }

      // If no profile exists, onboarding is not completed
      if (!data) {
        return false;
      }

      return !!(data.onboarding_completed || (data.first_name && data.last_name));
    } catch (error) {
      logError('Error checking onboarding status', error);
      throw error;
    }
  }
};