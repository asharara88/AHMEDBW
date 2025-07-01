import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging for development
if (import.meta.env.DEV) {
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
    // Show first few characters of key for debugging (safe)
    keyPrefix: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 8)}...` : 'undefined'
  });
}

if (!supabaseUrl) {
  const errorMessage = `
Missing VITE_SUPABASE_URL environment variable.

To fix this:
1. Create a .env file in your project root (copy from .env.example)
2. Add your Supabase project URL:
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
3. Get your project URL from: https://supabase.com/dashboard/project/your-project/settings/api
4. Restart your development server after making changes

Current value: ${supabaseUrl || 'undefined'}
  `.trim();
  
  throw new Error(errorMessage);
}

if (!supabaseAnonKey) {
  const errorMessage = `
Missing VITE_SUPABASE_ANON_KEY environment variable.

To fix this:
1. Create a .env file in your project root (copy from .env.example)
2. Add your Supabase anonymous key:
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
3. Get your anon key from: https://supabase.com/dashboard/project/your-project/settings/api
4. Restart your development server after making changes

Current value: ${supabaseAnonKey || 'undefined'}
  `.trim();
  
  throw new Error(errorMessage);
}

// Validate URL format
try {
  const url = new URL(supabaseUrl);
  if (!url.hostname.includes('supabase.co') && !url.hostname.includes('localhost')) {
    console.warn('Warning: Supabase URL does not appear to be a standard Supabase URL:', supabaseUrl);
  }
} catch (error) {
  const errorMessage = `
Invalid VITE_SUPABASE_URL format: "${supabaseUrl}"

Expected format: https://your-project-ref.supabase.co
Current value: ${supabaseUrl}

To fix this:
1. Check your .env file
2. Ensure the URL starts with https:// and ends with .supabase.co
3. Get the correct URL from: https://supabase.com/dashboard/project/your-project/settings/api
  `.trim();
  
  throw new Error(errorMessage);
}

// Validate anon key format (basic check)
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.warn('Warning: VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT token');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'biowell-app'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add connection error handling
supabase.auth.onAuthStateChange((event, session) => {
  if (import.meta.env.DEV) {
    console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
  }
});

// Test connection on client creation (non-blocking)
if (import.meta.env.DEV) {
  supabase
    .from('profiles')
    .select('count', { count: 'exact', head: true })
    .limit(1)
    .then(({ error }) => {
      if (error && !error.message.includes('permission') && !error.message.includes('RLS')) {
        console.warn('Supabase client connection test failed:', error.message);
      } else {
        console.log('Supabase client connection test passed');
      }
    })
    .catch((error) => {
      console.warn('Supabase client connection test error:', error.message);
    });
}