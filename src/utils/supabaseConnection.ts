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
      // Attempt to make a simple query to check connection
      // Using error_logs table as it doesn't have RLS enabled
      const { data, error } = await supabase.from('error_logs').select('id').limit(1);
      
      if (error) {
        throw error;
      }
      
      // If we get here, connection is successful
      connected = true;
      logInfo('Supabase connection established successfully');
      return true;
    } catch (error) {
      retryCount++;
      logError(`Supabase connection attempt ${retryCount} failed`, error);
      
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
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