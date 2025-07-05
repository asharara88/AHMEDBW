import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';

// Error types for better error handling
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  SERVER = 'server',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

export interface ApiError {
  type: ErrorType;
  message: string;
  status?: number;
  originalError?: unknown;
}

// Base API client with error handling
export const apiClient = {
  /**
   * Make a request to the Supabase database
   */
  async request<T>(
    operation: () => Promise<{ data: T | null; error: unknown }>,
    errorMessage: string = 'An error occurred'
  ): Promise<T> {
    try {
      const { error } = await operation();
      
      if (error) {
        // Handle Supabase errors
        const apiError: ApiError = {
          message: (error as any).message || errorMessage,
          originalError: error,
          type: ErrorType.UNKNOWN
        };
        
        // Determine error type
        const code = (error as any).code;
        if (code === 'PGRST301' || code?.includes('auth')) {
          apiError.type = ErrorType.AUTHENTICATION;
        } else if (code?.includes('PGRST')) {
          apiError.type = ErrorType.VALIDATION;
        } else {
          apiError.type = ErrorType.SERVER;
        }
        
        throw apiError;
      }
      
      if (data === null) {
        throw {
          type: ErrorType.UNKNOWN,
          message: 'No data returned',
        } as ApiError;
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
        message: errorMessage,
        originalError: error
      };
      
      // Try to determine error type
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          apiError.type = ErrorType.NETWORK;
          apiError.message = 'Network error. Please check your connection.';
        }
      }
      
      logError(`API Error: ${apiError.message}`, error);
      throw apiError;
    }
  },
  
  /**
   * Make a request to a Supabase Edge Function
   */
  async callFunction<T>(
    functionName: string,
    payload: Record<string, unknown>,
    errorMessage: string = 'Function call failed'
  ): Promise<T> {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw {
          type: ErrorType.AUTHENTICATION,
          message: 'Authentication required',
        } as ApiError;
      }
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !anonKey) {
        throw {
          type: ErrorType.SERVER,
          message: 'Missing API configuration',
        } as ApiError;
      }
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': anonKey
          },
          body: JSON.stringify(payload),
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If we can't parse the error as JSON, use the status text
          errorData = { error: response.statusText };
        }
        
        const apiError: ApiError = {
          message: errorData.error?.message || errorMessage,
          status: response.status,
          originalError: errorData,
          type: ErrorType.UNKNOWN
        };
        
        // Determine error type based on status code
        if (response.status === 401 || response.status === 403) {
          apiError.type = ErrorType.AUTHENTICATION;
        } else if (response.status === 400 || response.status === 422) {
          apiError.type = ErrorType.VALIDATION;
        } else if (response.status >= 500) {
          apiError.type = ErrorType.SERVER;
        }
        
        throw apiError;
      }
      
      return await response.json();
    } catch (error) {
      // If it's already an ApiError, just rethrow it
      if (error && typeof error === 'object' && 'type' in error) {
        throw error;
      }
      
      // Otherwise, create a new ApiError
      const apiError: ApiError = {
        type: ErrorType.UNKNOWN,
        message: errorMessage,
        originalError: error
      };
      
      // Try to determine error type
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          apiError.type = ErrorType.NETWORK;
          apiError.message = 'Network error. Please check your connection.';
        }
      }
      
      logError(`API Function Error: ${apiError.message}`, error);
      throw apiError;
    }
  }
};