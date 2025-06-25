import { supabase } from '../lib/supabaseClient';
import { logError, logInfo } from './logger';

/**
 * Maximum number of connection attempts
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Delay between retry attempts in milliseconds
 */
const RETRY_DELAY = 1000;

/**
 * Check if the Supabase connection is working
 * @returns {Promise<boolean>} True if connection is successful, false otherwise
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  let retryCount = 0;
  let connected = false;

  while (retryCount < MAX_RETRY_ATTEMPTS && !connected) {
    try {
      // First check if we have the required environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        logError('Supabase environment variables are missing', { 
          hasUrl: !!supabaseUrl, 
          hasAnonKey: !!supabaseAnonKey 
        });
        return false;
      }
      
      // Try a simple health check first - just get the current user
      // This is less likely to fail due to table permissions
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError && 
          authError.message !== 'Invalid JWT' && 
          authError.name !== 'AuthSessionMissingError') {
        // If it's not just an invalid JWT or missing auth session (which are expected for anonymous users), it's a real error
        throw authError;
      }
      
      // If we get here without throwing, the connection is working
      connected = true;
      logInfo('Supabase connection established successfully');
      return true;
      
    } catch (error) {
      retryCount++;
      
      // Log with more details about the attempt
      logError(`Supabase connection attempt ${retryCount} failed`, {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          details: error.toString()
        } : String(error),
        maxAttempts: MAX_RETRY_ATTEMPTS,
        willRetry: retryCount < MAX_RETRY_ATTEMPTS
      });
      
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount - 1)));
      }
    }
  }

  // If we've exhausted all retries, show a user-friendly error
  if (!connected) {
    // Dispatch a custom event that can be caught by an error boundary or notification system
    const connectionErrorEvent = new CustomEvent('supabase-connection-error', {
      detail: {
        message: 'Unable to connect to the database. Please check your internet connection and try again.',
        retryCount
      }
    });
    window.dispatchEvent(connectionErrorEvent);
    
    // Continue with the application in a degraded mode
    logInfo('Application continuing in offline/demo mode due to connection failure');
  }

  return connected;
}

/**
 * Event listener for connection errors
 * @param callback Function to call when a connection error occurs
 * @returns {() => void} Function to remove the event listener
 */
export function onConnectionError(callback: (event: CustomEvent) => void): () => void {
  const typedCallback = (event: Event) => {
    callback(event as CustomEvent);
  };
  
  window.addEventListener('supabase-connection-error', typedCallback);
  
  return () => {
    window.removeEventListener('supabase-connection-error', typedCallback);
  };
}