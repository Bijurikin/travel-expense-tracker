import { create } from 'zustand'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
interface AuthState {
  isAuthenticated: boolean
  user: User | null
  initialized: boolean
  initialized: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  initialized: false,
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      return false
    }
    set({ isAuthenticated: true, user: data.user })
    return true
  },
  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      console.error('Google login error:', error)
      throw error
    }
  },
  logout: async () => {
    try {
      // Clear store state first
      set({ 
        isAuthenticated: false, 
        user: null, 
        initialized: true 
      })

      // Then sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear all auth-related storage
      const storageKey = 'sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]
      window.localStorage.removeItem(storageKey + '-auth-token')
      window.localStorage.removeItem(storageKey + '-auth-state')
      
    } catch (error) {
      console.error('Logout error:', error)
      // Reset state even if there's an error
      set({ 
        isAuthenticated: false, 
        user: null, 
        initialized: true 
      })
      throw error
    }
  },
  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ 
        isAuthenticated: !!session,
        user: session?.user || null,
        initialized: true
      })
    } catch (error) {
      console.error('Error checking session:', error)
      set({ initialized: true })
    }
  }
}))

// Verbessere Auth State Handling
let currentSubscription: { unsubscribe: () => void } | null = null;

// Cleanup und neue Subscription erstellen
const setupAuthSubscription = () => {
  if (currentSubscription) {
    currentSubscription.unsubscribe();
  }

  currentSubscription = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, !!session);
    useAuthStore.setState({
      isAuthenticated: !!session,
      user: session?.user || null,
    });
  });
};

// Initial setup
setupAuthSubscription();

// Initial session check
useAuthStore.getState().checkSession()
