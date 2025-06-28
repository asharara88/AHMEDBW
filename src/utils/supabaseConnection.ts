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
        const missingVars = [];
        if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
        if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
        
        logError('Supabase environment variables are missing', { 
          missingVariables: missingVars,
          hasUrl: !!supabaseUrl, 
          hasAnonKey: !!supabaseAnonKey,
          instruction: 'Create a .env file with your Supabase credentials. See .env.example for the format.'
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
      
      // Enhanced error handling with more specific diagnostics
      let errorDetails: any = {
        attempt: retryCount,
        maxAttempts: MAX_RETRY_ATTEMPTS,
        willRetry: retryCount < MAX_RETRY_ATTEMPTS,
        timestamp: new Date().toISOString()
      };

      if (error instanceof Error) {
        errorDetails.error = {
          message: error.message || 'No error message available',
          name: error.name || 'Unknown error',
          details: error.toString()
        };

        // Provide specific guidance based on error type
        if (error.message.includes('fetch')) {
          errorDetails.commonCauses = [
            'Supabase URL is incorrect or project does not exist',
            'Network connectivity issues',
            'Supabase project is paused or suspended',
            'CORS configuration issues'
          ];
          errorDetails.troubleshooting = [
            'Verify your VITE_SUPABASE_URL in the .env file',
            'Check if your Supabase project is active in the dashboard',
            'Ensure you have internet connectivity',
            'Try accessing your Supabase URL directly in a browser'
          ];
        } else if (error.message.includes('API key')) {
          errorDetails.commonCauses = [
            'VITE_SUPABASE_ANON_KEY is incorrect or expired',
            'Anonymous key does not match the project'
          ];
          errorDetails.troubleshooting = [
            'Verify your VITE_SUPABASE_ANON_KEY in the .env file',
            'Get a fresh anonymous key from your Supabase dashboard',
            'Ensure the key matches your project'
          ];
        }
      } else {
        errorDetails.error = {
          message: String(error) || 'Unknown error occurred',
          type: typeof error
        };
      }
      
      logError(`Supabase connection attempt ${retryCount} failed`, errorDetails);
      
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        // Wait before retrying with exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, retryCount - 1);
        logInfo(`Retrying Supabase connection in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If we've exhausted all retries, show a user-friendly error
  if (!connected) {
    const connectionErrorEvent = new CustomEvent('supabase-connection-error', {
      detail: {
        message: `Unable to connect to Supabase after ${MAX_RETRY_ATTEMPTS} attempts. Please check your configuration and try again.`,
        retryCount,
        troubleshooting: [
          'Verify your .env file exists and contains valid Supabase credentials',
          'Check that your Supabase project is active',
          'Ensure you have internet connectivity',
          'Try restarting your development server'
        ]
      }
    });
    window.dispatchEvent(connectionErrorEvent);
    
    // Also log detailed troubleshooting information
    logError('All connection attempts failed', {
      totalAttempts: retryCount,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'configured' : 'missing',
      nextSteps: [
        '1. Check your .env file exists in the project root',
        '2. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set',
        '3. Get credentials from https://supabase.com/dashboard/project/your-project/settings/api',
        '4. Restart your development server after making changes'
      ]
    });
    
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