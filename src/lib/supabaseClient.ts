import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Present' : '❌ Missing')
  throw new Error('Missing required Supabase environment variables. Please check your .env file.')
}

console.log('🔄 Initializing Supabase client...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing')

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
    
    // Test with a simple query that should always work
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connected successfully!')
    return true
  } catch (error) {
    console.error('❌ Connection error:', error)
    return false
  }
}

// Test connection on initialization
testConnection()