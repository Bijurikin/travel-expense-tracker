import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (email: string, password: string) => {
        console.log('Login attempt:', { email, password }); // Debug log
        if (email === 'admin@admin' && password === 'admin') {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize the store
const store = useAuthStore.getState();
console.log('Initial auth state:', store.isAuthenticated); // Debug log
