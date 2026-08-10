import { create } from "zustand"

interface UiState {
  isSidebarCollapsed: boolean
  isMobileNavigationOpen: boolean
  toggleSidebar: () => void
  setMobileNavigationOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  isMobileNavigationOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setMobileNavigationOpen: (open) => set({ isMobileNavigationOpen: open }),
}))
