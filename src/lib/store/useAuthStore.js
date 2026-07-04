import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  session: null,
  profile: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ session: null, profile: null, isLoading: false })
}));
