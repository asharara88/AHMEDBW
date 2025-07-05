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
    
    // Test with a simple auth session check first (most reliable and doesn't require specific tables)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        logError('Auth session check failed', error)
        return false
      } else {
        logInfo('Supabase auth connection successful')
        return true
      }
    } catch (authError) {
      logError('Auth connection error', authError)
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