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
    
    // First try a simple health check
    try {
      const response = await fetch(`${supabaseUrl}/health`, {
        headers: {
          'apikey': supabaseAnonKey
        }
      })
      
      if (response.ok) {
        logInfo('Supabase health check successful')
      } else {
        logError('Supabase health check failed', await response.text())
      }
    } catch (healthError) {
      logError('Supabase health check error', healthError)
    }
    
    // Try with a simple query to a table that should exist
    try {
      const { data, error } = await supabase
        .from('supplements')
        .select('id')
        .limit(1)
      
      if (error) {
        logError('Database query test failed', error)
        
        // Try alternative test with auth endpoint
        try {
          const { data: authData, error: authError } = await supabase.auth.getSession()
          if (authError) {
            logError('Auth connection also failed', authError)
            return false
          }
          logInfo('Auth connection successful, but database query failed')
          return true
        } catch (authErr) {
          logError('Both database and auth connections failed', authErr)
          return false
        }
      }
      
      logInfo('Supabase connection successful')
      return true
    } catch (dbError) {
      logError('Database connection error', dbError)
      
      // Try a simpler connection test
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!error) {
          logInfo('Basic Supabase connection works')
          return true
        }
      } catch (fallbackError) {
        logError('Fallback connection test also failed', fallbackError)
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