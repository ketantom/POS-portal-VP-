import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Initialize the Supabase client
// For App Router client components, we export a singleton instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
