import { createClient } from '@supabase/supabase-js'

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
    console.log('🔄 Testing Supabase connection...')
    
    // Test with a simple query to a table that should exist
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error.message)
      // Try alternative test with auth endpoint
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession()
        if (authError) {
          console.error('❌ Auth connection also failed:', authError.message)
          return false
        }
        console.log('✅ Auth connection successful, but database query failed')
        return true
      } catch (authErr) {
        console.error('❌ Both database and auth connections failed')
        return false
      }
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Connection error:', error)
    
    // Try a simpler connection test
    try {
      const { data, error } = await supabase.auth.getSession()
      if (!error) {
        console.log('✅ Basic Supabase connection works')
        return true
      }
    } catch (fallbackError) {
      console.error('❌ Fallback connection test also failed:', fallbackError)
    }
    
    return false
  }
}

// Test connection on initialization (but don't block)
testConnection().catch(err => {
  console.warn('Initial connection test failed, but continuing...', err)
})