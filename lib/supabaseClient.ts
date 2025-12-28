import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client only in the browser to avoid server-side errors during build when env vars are absent.
// When running server-side (during build or SSR), `supabase` will be a lightweight fallback object
// with compatible method shapes that safely no-op.
let supabase: any = null

if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn('Supabase env vars not set. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
  }
  supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
} else {
  // Server-side fallback: minimal compatible interface used only to avoid runtime errors during build.
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }
}

export { supabase }
export default supabase
