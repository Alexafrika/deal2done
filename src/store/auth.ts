/**
 * Auth store — persisted in localStorage.
 * Session is maintained via httpOnly cookie (managed by Next.js API routes).
 * The store holds the user object for UI rendering only — no tokens stored here.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "buyer" | "supplier" | "admin";
  kycStatus: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  kycCompleted: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setKycCompleted: (v: boolean) => void;
  clearAuth: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: "buyer" | "supplier";
  phone?: string;
}

function authFetch(path: string, body?: object): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      kycCompleted: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authFetch("/api/auth/login", { email, password });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Неверный email или пароль");
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const res = await authFetch("/api/auth/register", formData);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Ошибка регистрации");
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await authFetch("/api/auth/logout");
        get().clearAuth();
      },

      setUser: (user) => set({ user }),

      setKycCompleted: (v) => set({ kycCompleted: v }),

      clearAuth: () => {
        set({ user: null, isAuthenticated: false, kycCompleted: false });
      },
    }),
    {
      name: "deal2done-auth",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        kycCompleted: state.kycCompleted,
      }),
    }
  )
);
