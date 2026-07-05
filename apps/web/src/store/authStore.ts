import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, User } from "@/types/api";
import { setTokens, clearTokens } from "@/lib/storage";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (res: AuthResponse) => void;
  setUser: (user: User) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      signIn: (res) => {
        setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
        set({
          user: res.user,
          isAuthenticated: true,
          isAdmin: res.user.role === "admin",
        });
      },
      setUser: (user) =>
        set({ user, isAuthenticated: true, isAdmin: user.role === "admin" }),
      signOut: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false, isAdmin: false });
      },
    }),
    {
      name: "farax.auth",
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        isAdmin: s.isAdmin,
      }),
    },
  ),
);
