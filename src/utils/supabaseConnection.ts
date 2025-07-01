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
      
      // Validate URL format before attempting connection
      try {
        const url = new URL(supabaseUrl);
        if (!url.hostname.includes('supabase.co') && !url.hostname.includes('localhost')) {
          logError('Invalid Supabase URL format', {
            url: supabaseUrl,
            expected: 'https://your-project-ref.supabase.co'
          });
          return false;
        }
      } catch (urlError) {
        logError('Malformed Supabase URL', {
          url: supabaseUrl,
          error: urlError instanceof Error ? urlError.message : String(urlError)
        });
        return false;
      }
      
      // Try a simple health check with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        // Use a simple query that doesn't require authentication
        const { error } = await supabase
          .from('profiles')
          .select('count', { count: 'exact', head: true })
          .abortSignal(controller.signal);
        
        clearTimeout(timeoutId);
        
        // If we get a permission error, that's actually good - it means we connected
        if (error && error.message.includes('permission')) {
          connected = true;
          logInfo('Supabase connection established successfully (permission check passed)');
          return true;
        }
        
        // If no error, connection is working
        if (!error) {
          connected = true;
          logInfo('Supabase connection established successfully');
          return true;
        }
        
        // If it's a different error, throw it to be caught below
        throw error;
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // If it's an abort error, it's a timeout
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Connection timeout - Supabase server did not respond within 10 seconds');
        }
        
        throw fetchError;
      }
      
    } catch (error) {
      retryCount++;
      
      // Enhanced error handling with more specific diagnostics
      let errorDetails: any = {
        attempt: retryCount,
        maxAttempts: MAX_RETRY_ATTEMPTS,
        willRetry: retryCount < MAX_RETRY_ATTEMPTS,
        timestamp: new Date().toISOString(),
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      };

      if (error instanceof Error) {
        errorDetails.error = {
          message: error.message || 'No error message available',
          name: error.name || 'Unknown error',
          details: error.toString()
        };

        // Provide specific guidance based on error type
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
          errorDetails.commonCauses = [
            'Supabase URL is incorrect or project does not exist',
            'Network connectivity issues',
            'Supabase project is paused or suspended',
            'CORS configuration issues',
            'Firewall blocking the connection'
          ];
          errorDetails.troubleshooting = [
            'Verify your VITE_SUPABASE_URL in the .env file',
            'Check if your Supabase project is active in the dashboard',
            'Ensure you have internet connectivity',
            'Try accessing your Supabase URL directly in a browser',
            'Check if you\'re behind a corporate firewall'
          ];
        } else if (error.message.includes('API key') || error.message.includes('Invalid JWT')) {
          errorDetails.commonCauses = [
            'VITE_SUPABASE_ANON_KEY is incorrect or expired',
            'Anonymous key does not match the project'
          ];
          errorDetails.troubleshooting = [
            'Verify your VITE_SUPABASE_ANON_KEY in the .env file',
            'Get a fresh anonymous key from your Supabase dashboard',
            'Ensure the key matches your project'
          ];
        } else if (error.message.includes('CORS')) {
          errorDetails.commonCauses = [
            'CORS policy blocking the request',
            'Incorrect origin configuration in Supabase'
          ];
          errorDetails.troubleshooting = [
            'Check your Supabase project\'s CORS settings',
            'Ensure localhost is allowed in development',
            'Verify your domain is configured in production'
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
          'Check that your Supabase project is active and not paused',
          'Ensure you have internet connectivity',
          'Try restarting your development server',
          'Verify your Supabase URL format: https://your-project-ref.supabase.co',
          'Check your Supabase anonymous key is correct and not expired'
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
        '4. Restart your development server after making changes',
        '5. Check your Supabase project is not paused or suspended'
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