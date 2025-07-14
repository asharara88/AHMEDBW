import { supabase } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { logError, logInfo, logWarn } from '../utils/logger';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

// Helper function to generate a captcha token
const generateCaptchaToken = async () => {
  try {
    // In a real implementation, this would integrate with a captcha provider
    // For development, we're using a dummy token
    const captchaSecretKey = import.meta.env.VITE_CAPTCHA_SECRET_KEY;
    
    if (!captchaSecretKey) {
      logWarn('Captcha secret key not found in environment variables');
      return null;
    }
    
    // Simulate a captcha verification request
    return `${captchaSecretKey}-${Date.now()}`;
  } catch (error) {
    logError('Error generating captcha token', error);
    return null;
  }
};

/**
 * Sign in with email and password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
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
      logError('Login error', error.message);
      throw new Error(error.message);
    }

    logInfo('Login success');
    return data;
  } catch (error) {
    logError('Login error', error);
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<{ data: any; error: any }> {
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
      logError('Signup error', error.message);
      return { data: null, error };
    }

    logInfo('Signup success');
    return { data, error: null };
  } catch (error) {
    logError('Signup error', error);
    return { data: null, error };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logError('Signout error', error.message);
      throw new Error(error.message);
    }
    
    logInfo('Signout success');
  } catch (error) {
    logError('Signout error', error);
    throw error;
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      logError('Get session error', error.message);
      throw new Error(error.message);
    }
    
    return data.session;
  } catch (error) {
    logError('Get session error', error);
    throw error;
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      logError('Refresh session error', error.message);
      
      // If the error is about invalid refresh token, clear the session
      if (error.message.includes('Invalid Refresh Token') || 
          error.message.includes('Refresh Token Not Found')) {
        logInfo('Invalid refresh token detected, clearing session');
        await supabase.auth.signOut();
      }
      
      throw new Error(error.message);
    }
    
    return data.session;
  } catch (error) {
    logError('Refresh session error', error);
    throw error;
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      logError('Get user error', error.message);
      throw new Error(error.message);
    }
    
    return data.user;
  } catch (error) {
    logError('Get user error', error);
    throw error;
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      logError('Reset password error', error.message);
      throw new Error(error.message);
    }
    
    logInfo('Reset password email sent');
  } catch (error) {
    logError('Reset password error', error);
    throw error;
  }
}

/**
 * Update password
 */
export async function updatePassword(password: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      logError('Update password error', error.message);
      throw new Error(error.message);
    }
    
    logInfo('Password updated successfully');
  } catch (error) {
    logError('Update password error', error);
    throw error;
  }
}