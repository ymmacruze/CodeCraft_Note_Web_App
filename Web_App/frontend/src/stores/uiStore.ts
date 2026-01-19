import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'list' | 'grid';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;

  // Editor
  editorMode: 'edit' | 'preview' | 'split';
  setEditorMode: (mode: 'edit' | 'preview' | 'split') => void;
  focusMode: boolean;
  toggleFocusMode: () => void;

  // View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Modals
  deleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
  importModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;

  // Search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: true,
      sidebarWidth: 280,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(400, width)) }),

      // Editor
      editorMode: 'split',
      setEditorMode: (editorMode) => set({ editorMode }),
      focusMode: false,
      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),

      // View
      viewMode: 'list',
      setViewMode: (viewMode) => set({ viewMode }),

      // Modals
      deleteModalOpen: false,
      setDeleteModalOpen: (deleteModalOpen) => set({ deleteModalOpen }),
      exportModalOpen: false,
      setExportModalOpen: (exportModalOpen) => set({ exportModalOpen }),
      importModalOpen: false,
      setImportModalOpen: (importModalOpen) => set({ importModalOpen }),
      settingsModalOpen: false,
      setSettingsModalOpen: (settingsModalOpen) => set({ settingsModalOpen }),

      // Search
      searchOpen: false,
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      searchQuery: '',
      setSearchQuery: (searchQuery) => set({ searchQuery }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        editorMode: state.editorMode,
        viewMode: state.viewMode,
      }),
    }
  )
);
