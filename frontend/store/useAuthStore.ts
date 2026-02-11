import { create } from "zustand";

interface AuthState {
  user: { token: string; firstName?: string } | null;
  setUser: (user: { token: string; firstName?: string } | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:
    typeof window !== "undefined" && localStorage.getItem("token")
      ? { token: localStorage.getItem("token")! }
      : null,
  setUser: (user) => {
    if (user) localStorage.setItem("token", user.token);
    else localStorage.removeItem("token");
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
  },
}));
