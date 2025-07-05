import { supabase } from './supabaseClient';
import { logInfo, logError } from '../utils/logger';

/**
 * Fetch the current session from Supabase.
 */
export async function restoreSession() {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      logError('restoreSession → getSession error', error);
      return null;
    }
    return data.session;
  } catch (err) {
    logError('restoreSession → unexpected error', err);
    return null;
  }
}

/**
 * Refresh session using refresh token if available.
 * If refresh fails, logs out the user.
 */
export async function refreshSessionIfNeeded() {
  try {
    const currentSession = await restoreSession();
    if (!currentSession?.refresh_token) {
      logInfo('No refresh token found — skipping refresh');
      return null;
    }

    const { error } = await supabase.auth.refreshSession();
    if (error) {
      logError('refreshSessionIfNeeded → refreshSession error', error);
      if (
        error.message.includes('Invalid Refresh Token') ||
        error.message.includes('Refresh Token Not Found')
      ) {
        await supabase.auth.signOut();
        localStorage.removeItem('biowell-user-data');
        window.location.href = '/login';
      }
      return null;
    }

    return data.session;
  } catch (err) {
    logError('refreshSessionIfNeeded → unexpected error', err);
    return null;
  }
}