import { createClient } from '@supabase/supabase-js'
import { logError, logInfo } from '../utils/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Present' : '❌ Missing')
  throw new Error('Missing required Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public'
  }
})

export const testConnection = async () => {
  try {
    logInfo('Testing Supabase connection...')
    
    // Test with a simple auth session check first (most reliable)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        logError('Auth session check failed', error)
      } else {
        logInfo('Supabase auth connection successful')
      }
    } catch (authError) {
      logError('Auth connection error', authError)
    }
    
    // Try a simple database query to test database connectivity
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (error) {
        logError('Database query test failed', error)
        
        // If profiles table doesn't exist, try a different approach
        try {
          const { data: configData, error: configError } = await supabase
            .from('configuration')
            .select('id')
            .limit(1)
          
          if (configError) {
            logError('Alternative database query also failed', configError)
            return false
          }
          
          logInfo('Supabase database connection successful (via configuration table)')
          return true
        } catch (fallbackError) {
          logError('Fallback database query failed', fallbackError)
          return false
        }
      }
      
      logInfo('Supabase database connection successful')
      return true
    } catch (dbError) {
      logError('Database connection error', dbError)
      
      // If database queries fail, at least check if we can reach Supabase
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!error) {
          logInfo('Basic Supabase connection works (auth only)')
          return true
        }
      } catch (fallbackError) {
        logError('All connection tests failed', fallbackError)
      }
      
      return false
    }
  } catch (error) {
    logError('Connection error', error)
    return false
  }
}

// Test connection on initialization (but don't block)
testConnection().catch(err => {
  console.warn('Initial connection test failed, but continuing...', err)
})