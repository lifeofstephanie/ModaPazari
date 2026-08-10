import { create } from "zustand";

export type Role = "buyer" | "vendor" | "admin";

export interface AuthUser {
  token: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
  avatar?: string;
  vendorStatus?: "pending" | "approved" | "rejected";
  emailVerified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const STORAGE_KEY = "auth_user";

const readInitial = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      /* fall through */
    }
  }
  // Backward-compat with the older token-only storage.
  const token = localStorage.getItem("token");
  return token ? { token } : null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: readInitial(),
  setUser: (user) => {
    if (user) {
      // "token" is kept in its own key because the axios interceptor reads it.
      localStorage.setItem("token", user.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },
}));
