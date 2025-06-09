import { createClient } from '@supabase/supabase-js';
import { logError, logInfo, logWarning } from '../utils/logger';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Log environment setup in development only (prevents leaking info)
if (import.meta.env.DEV) {
  logInfo('Supabase environment variables are set.');
}

// Create Supabase client (singleton)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage, // use sessionStorage if tokens must clear on tab close
  },
  global: {
    headers: {
      'X-Client-Info': 'biowell-ai-web'
    },
    fetch: async (...args) => {
      try {
        return await fetch(...args);
      } catch (err) {
        logError('Global Supabase fetch failed:', err);
        throw err;
      }
    },
  },
});

// Handle auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  switch (event) {
    case 'TOKEN_REFRESHED':
      logInfo('Session token refreshed');
      break;

    case 'TOKEN_REFRESH_FAILED':
      logWarning('Session refresh failed. Signing out...');
      supabase.auth.signOut().catch(err => logError('Sign out error:', err));
      localStorage.removeItem('biowell-user-data');
      break;

    case 'SIGNED_OUT':
      logInfo('User signed out');
      localStorage.removeItem('supabase.auth.token');
      break;

    case 'SIGNED_IN':
    case 'USER_UPDATED':
      logInfo('Auth state changed:', event);
      break;

    default:
      if (import.meta.env.DEV) {
        logInfo('Unhandled auth event:', event);
      }
      break;
  }
});
