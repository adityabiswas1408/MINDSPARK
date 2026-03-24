import { create } from 'zustand';

// Add to this union as needed when building specific UI overlays
export type ModalType = 'PAUSE_EXAM' | 'FORCE_SUBMIT' | 'NETWORK_ERROR' | null;

interface UIState {
  isSidebarCollapsed: boolean;
  activeModal: ModalType;
  autoAdvance: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  toggleAutoAdvance: () => void;
  setAutoAdvance: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  activeModal: null,
  autoAdvance: true, // Defaulting to true for faster testing UX

  toggleSidebar: () => 
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => 
    set({ isSidebarCollapsed: collapsed }),
  
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  
  toggleAutoAdvance: () => 
    set((state) => ({ autoAdvance: !state.autoAdvance })),
  setAutoAdvance: (enabled) => 
    set({ autoAdvance: enabled }),
}));
