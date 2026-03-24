import { create } from 'zustand';

interface AuthUIState {
  // UI loading state — true while session is being validated on mount
  isSessionLoading: boolean;
  // UI flag — true during the redirect to /reset-password (prevents flash)
  isRedirecting: boolean;
  // UI flag — true after signOut is called (prevents duplicate signOut calls)
  isSigningOut: boolean;
  setSessionLoading: (value: boolean) => void;
  setRedirecting: (value: boolean) => void;
  setSigningOut: (value: boolean) => void;
}

export const useAuthStore = create<AuthUIState>((set) => ({
  isSessionLoading: true,
  isRedirecting: false,
  isSigningOut: false,
  setSessionLoading: (value) => set({ isSessionLoading: value }),
  setRedirecting: (value) => set({ isRedirecting: value }),
  setSigningOut: (value) => set({ isSigningOut: value }),
}));
