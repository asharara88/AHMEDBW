import { createClient } from '@supabase/supabase-js';
import { logError, logInfo, logWarning } from '../utils/logger';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  logError('Missing Supabase environment variables', { 
    hasUrl: !!supabaseUrl, 
    hasAnonKey: !!supabaseAnonKey 
  });
  
  // Provide a more helpful error message in development
  if (import.meta.env.DEV) {
    console.error(`
      ⚠️ Supabase configuration is missing! ⚠️
      
      Please ensure you have the following in your .env file:
      VITE_SUPABASE_URL=your-supabase-url
      VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
      
      If you're running in development mode, you can create a .env.local file with these values.
    `);
  }
}

// Log environment setup in development only (prevents leaking info)
if (import.meta.env.DEV) {
  logInfo('Supabase environment variables are set.');
}

// Create Supabase client with simplified configuration
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  global: {
    headers: {
      'X-Client-Info': 'biowell-ai-web'
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