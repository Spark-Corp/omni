import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      vendor: null,
      loading: false,
      error: null,
      setUser: (u) => set({ user: u, isAuthenticated: !!u, error: null }),
      setVendor: (v) => set({ vendor: v }),
      setLoading: (l) => set({ loading: l }),
      setError: (e) => set({ error: e }),
      signIn: async (phone, otp) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, otp }) });
          const result = await res.json();
          if (result.success) { set({ user: result.user, isAuthenticated: true, loading: false }); return { success: true, user: result.user }; }
          set({ error: result.error || 'Echec', loading: false }); return { success: false, error: result.error };
        } catch (e) { set({ error: 'Erreur', loading: false }); return { success: false, error: 'Erreur' }; }
      },
      signOut: () => set({ user: null, isAuthenticated: false, vendor: null, error: null }),
      sendOTP: async (phone) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
          const result = await res.json();
          if (result.success) { set({ loading: false }); return { success: true }; }
          set({ error: result.error || 'Echec', loading: false }); return { success: false, error: result.error };
        } catch (e) { set({ error: 'Erreur', loading: false }); return { success: false, error: 'Erreur' }; }
      },
      clearError: () => set({ error: null }),
    }),
    { name: 'omni-auth-storage', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, vendor: s.vendor }) }
  )
);
