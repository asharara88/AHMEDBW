import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Create client with error handling
const createSupabaseClient = () => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
      }
    });
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    // Return a minimal mock client that doesn't throw errors
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not initialized properly') }),
        signUp: async () => ({ data: null, error: new Error('Supabase not initialized properly') }),
        signOut: async () => ({ error: null })
      },
      from: () => ({
        select: () => ({ data: null, error: new Error('Supabase not initialized properly') }),
        insert: () => ({ error: new Error('Supabase not initialized properly') }),
        update: () => ({ error: new Error('Supabase not initialized properly') }),
        delete: () => ({ error: new Error('Supabase not initialized properly') }),
      })
    };
  }
};

export const supabase = createSupabaseClient();

// Add connection check function
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};