import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://leznzqfezoofngumpiqf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlem56cWZlem9vZm5ndW1waXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTI0NTUsImV4cCI6MjA1OTY2ODQ1NX0.5I67qAPpITjoBj2WqOm8e0NX78XPw0rEx54DTICnWME'


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const testConnection = async () => {
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('❌ Connection error:', error)
    return false
  }
}
