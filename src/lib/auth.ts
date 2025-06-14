import { supabase } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { ErrorCode, handleAuthError } from '../utils/errorHandling';
import { AppError } from '../contexts/ErrorContext';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

export interface AuthResult {
  success: boolean;
  data?: any;
  user?: User | null;
  session?: Session | null;
  error?: Omit<AppError, 'id' | 'timestamp'> | null;
}

// Helper function to generate a captcha token
const generateCaptchaToken = async () => {
  try {
    // In a real implementation, this would integrate with a captcha provider
    // For development, we're using a dummy token
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

/**
 * Sign in with email and password
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    // Validate inputs
    if (!email || !password) {
      return {
        success: false,
        error: {
          message: 'Email and password are required',
          severity: 'warning',
          code: ErrorCode.VALIDATION_REQUIRED_FIELD,
          source: 'auth'
        }
      };
    }
    
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
      const errorObj = handleAuthError(error);
      return {
        success: false,
        error: errorObj
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Login error:', error);
    const errorObj = handleAuthError(error);
    return {
      success: false,
      error: errorObj
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  try {
    // Validate inputs
    if (!email || !password) {
      return {
        success: false,
        error: {
          message: 'Email and password are required',
          severity: 'warning',
          code: ErrorCode.VALIDATION_REQUIRED_FIELD,
          source: 'auth'
        }
      };
    }
    
    // Validate password strength
    if (password.length < 8) {
      return {
        success: false,
        error: {
          message: 'Password must be at least 8 characters',
          severity: 'warning',
          code: ErrorCode.VALIDATION_INVALID_VALUE,
          source: 'auth'
        }
      };
    }
    
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
      const errorObj = handleAuthError(error);
      return {
        success: false,
        error: errorObj
      };
    }

    return {
      success: true,
      data,
      user: data.user
    };
  } catch (error) {
    console.error('Signup error:', error);
    const errorObj = handleAuthError(error);
    return {
      success: false,
      error: errorObj
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      const errorObj = handleAuthError(error);
      return {
        success: false,
        error: errorObj
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Signout error:', error);
    const errorObj = handleAuthError(error);
    return {
      success: false,
      error: errorObj
    };
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      const errorObj = handleAuthError(error);
      return {
        success: false,
        error: errorObj
      };
    }
    
    return {
      success: true,
      session: data.session
    };
  } catch (error) {
    console.error('Get session error:', error);
    const errorObj = handleAuthError(error);
    return {
      success: false,
      error: errorObj
    };
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      // If the error is about invalid refresh token, clear the session
      if (error.message.includes('Invalid Refresh Token') || 
          error.message.includes('Refresh Token Not Found')) {
        await supabase.auth.signOut();
        
        return {
          success: false,
          error: {
            message: 'Your session has expired. Please sign in again.',
            severity: 'error',
            code: ErrorCode.AUTH_EXPIRED_SESSION,
            source: 'auth'
          }
        };
      }
      
      const errorObj = handleAuthError(error);
      return {
        success: false,
        error: errorObj
      };
    }
    
    return {
      success: true,
      session: data.session,
      user: data.user
    };
  } catch (error) {
    console.error('Refresh session error:', error);
    const errorObj = handleAuthError(error);
    return {
      success: false,
      error: errorObj
    };
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    if (!email) {
      return {
        success: false,
        error: {
          message: 'Email is required',
          severity: 'warning',
          code: ErrorCode.VALIDATION_REQUIRED_FIELD,
          source: 'auth'
        }
      };
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      const errorObj = handleAuthError(error);
      return {
        success: false,
        error: errorObj
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Reset password error:', error);
    const errorObj = handleAuthError(error);
    return {
      success: false,
      error: errorObj
    };
  }
}

/**
 * Update password
 */
export async function updatePassword(password: string): Promise<AuthResult> {
  try {
    if (!password) {
      return {
        success: false,
        error: {
          message: 'Password is required',
          severity: 'warning',
          code: ErrorCode.VALIDATION_REQUIRED_FIELD,
          source: 'auth'
        }
      };
    }
    
    if (password.length < 8) {
      return {
        success: false,
        error: {
          message: 'Password must be at least 8 characters',
          severity: 'warning',
          code: ErrorCode.VALIDATION_INVALID_VALUE,
          source: 'auth'
        }
      };
    }
    
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      const errorObj = handleAuthError(error);
      return {
        success: false,
        error: errorObj
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Update password error:', error);
    const errorObj = handleAuthError(error);
    return {
      success: false,
      error: errorObj
    };
  }
}