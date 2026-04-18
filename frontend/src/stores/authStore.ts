import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      
      login: (token: string, refreshToken: string, user: User) => {
        set({ token, refreshToken, user, isAuthenticated: true });
      },
      
      logout: async () => {
        try {
          await api.post("/api/auth/logout");
        } catch (error) {
          console.error("Logout API failed:", error);
        }
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      },
      
      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
