import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables for Supabase:');
  if (!supabaseUrl) console.error('- VITE_SUPABASE_URL is missing');
  if (!supabaseAnonKey) console.error('- VITE_SUPABASE_ANON_KEY is missing');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// This function can be used to check if Supabase is properly initialized
export const checkSupabaseConnection = async () => {
  try {
    // Attempt a simple query to verify the connection
    const { data, error } = await supabase.from('supplements').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};