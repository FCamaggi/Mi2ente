import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  authStatus: 'idle',

  setAuth: (user, accessToken) => set({ user, accessToken, authStatus: 'authenticated' }),
  setToken: (accessToken) => set((state) => ({
    accessToken,
    // No marcar como 'authenticated' si aún estamos en bootstrap — bootstrapSuccess lo hará junto con el user
    authStatus: accessToken && state.authStatus !== 'bootstrapping' ? 'authenticated' : state.authStatus
  })),
  updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
  bootstrapStarted: () => set((state) => ({
    authStatus: state.authStatus === 'authenticated' ? 'authenticated' : 'bootstrapping'
  })),
  bootstrapSuccess: (user, accessToken) => set({ user, accessToken, authStatus: 'authenticated' }),
  bootstrapAnonymous: () => set({ user: null, accessToken: null, authStatus: 'anonymous' }),
  bootstrapError: () => set({ user: null, accessToken: null, authStatus: 'error' }),
  logout: () => set({ user: null, accessToken: null, authStatus: 'anonymous' }),
}));
