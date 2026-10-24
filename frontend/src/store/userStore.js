import { create } from "zustand";

export const useUserStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("aaina_user") || "null"),
  token: localStorage.getItem("aaina_token") || null,
  profile: null,
  isLoadingUser: false,
  fontSizeScale: parseFloat(localStorage.getItem("aaina_font_scale") || "1"),
  toast: { show: false, message: "", type: "info" },

  setAuth: (user, token) => {
    localStorage.setItem("aaina_user", JSON.stringify(user));
    localStorage.setItem("aaina_token", token);
    set({ user, token });
  },

  setUser: (user) => {
    localStorage.setItem("aaina_user", JSON.stringify(user));
    set({ user });
  },

  setProfile: (profile) => set({ profile }),

  setFontSizeScale: (scale) => {
    const clamped = Math.max(0.85, Math.min(1.25, scale));
    localStorage.setItem("aaina_font_scale", clamped.toString());
    set({ fontSizeScale: clamped });
  },

  showToast: (message, type = "info") => {
    set({ toast: { show: true, message, type } });
    setTimeout(() => {
      set((state) => ({ toast: { ...state.toast, show: false } }));
    }, 4000);
  },

  hideToast: () => {
    set((state) => ({ toast: { ...state.toast, show: false } }));
  },

  logout: () => {
    localStorage.removeItem("aaina_token");
    localStorage.removeItem("aaina_user");
    set({ user: null, token: null, profile: null });
  }
}));
