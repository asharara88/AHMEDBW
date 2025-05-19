import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment variables (without exposing sensitive data)
console.log('Supabase URL configured:', !!supabaseUrl);
console.log('Supabase Anon Key configured:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Create a single Supabase client instance to use throughout the app
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage
    },
    global: {
      fetch: (...args) => {
        return fetch(...args).catch(err => {
          console.error('Supabase fetch error:', err);
          throw err;
        });
      }
    }
  }
);

// Add a listener for auth state changes to handle token refresh errors
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    localStorage.removeItem('supabase.auth.token');
  }
  
  if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
    console.log('Auth state updated:', event);
  }
});