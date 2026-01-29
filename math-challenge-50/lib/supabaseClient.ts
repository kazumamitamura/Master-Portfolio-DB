import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client (for use in Client Components)
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    throw new Error(
      `Invalid SUPABASE_URL: "${supabaseUrl}". Must be a valid HTTP or HTTPS URL.\n` +
      'Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL is set correctly.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
