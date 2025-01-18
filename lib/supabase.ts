import { createClient } from '@supabase/supabase-js'

// Ensure single instance
let supabaseInstance: ReturnType<typeof createClient>

if (!supabaseInstance) {
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',  // Wichtig für OAuth
        storage: {
          getItem: (key) => {
            try {
              return Promise.resolve(localStorage.getItem(key))
            } catch {
              return Promise.resolve(null)
            }
          },
          setItem: (key, value) => {
            try {
              localStorage.setItem(key, value)
              return Promise.resolve()
            } catch {
              return Promise.resolve()
            }
          },
          removeItem: (key) => {
            try {
              localStorage.removeItem(key)
              return Promise.resolve()
            } catch {
              return Promise.resolve()
            }
          },
        },
      }
    }
  )
}

export const supabase = supabaseInstance
