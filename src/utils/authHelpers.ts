import { supabase } from '../lib/supabaseClient';

/**
 * Checks if the current session is valid and refreshes it if needed
 * @returns {Promise<boolean>} True if session is valid, false otherwise
 */
export async function validateSession(): Promise<boolean> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return false;
    }
    
    // If no session exists, return false
    if (!session) {
      console.log('No session found');
      return false;
    }
    
    // Check if session is about to expire (within 5 minutes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    
    if (expiresAt && expiresAt - now < 300) {
      console.log('Session expiring soon, refreshing...');

      if (!session.refresh_token) {
        console.warn('No refresh token available, skipping refresh');
        return false;
      }

      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        
        // If the error is about invalid refresh token, clear the session
        if (refreshError.message.includes('Invalid Refresh Token') || 
            refreshError.message.includes('Refresh Token Not Found')) {
          console.log('Invalid refresh token detected, clearing session');
          await supabase.auth.signOut();
          return false;
        }
        
        return false;
      }
      
      return !!refreshData.session;
    }
    
    // Session is valid and not expiring soon
    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

/**
 * Handles authentication errors and takes appropriate action
 * @param {any} error The error object to handle
 * @returns {Promise<void>}
 */
export async function handleAuthError(error: any): Promise<void> {
  if (!error) return;
  
  const errorMessage = error.message || error.toString();
  console.error('Auth error:', errorMessage);
  
  // Handle specific auth errors
  if (errorMessage.includes('Invalid Refresh Token') || 
      errorMessage.includes('Refresh Token Not Found')) {
    console.log('Invalid refresh token detected, signing out');
    await supabase.auth.signOut();
    
    // Redirect to login page
    window.location.href = '/login?error=' + encodeURIComponent('Your session has expired. Please sign in again.');
  }
}

/**
 * Sets up a periodic session validation check
 * @returns {Function} Cleanup function to clear the interval
 */
export function setupSessionValidation(): () => void {
  // Check session validity every minute
  const interval = setInterval(async () => {
    const isValid = await validateSession();
    if (!isValid) {
      console.log('Session validation failed, redirecting to login');
      window.location.href = '/login?error=' + encodeURIComponent('Your session has expired. Please sign in again.');
    }
  }, 60000);
  
  return () => clearInterval(interval);
}