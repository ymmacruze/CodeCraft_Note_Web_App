import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Note, CreateNoteInput, UpdateNoteInput, SearchFilters, SortOptions } from '@/types';
import { notesService } from '@/services/notes.service';

interface NoteState {
  // State
  notes: Note[];
  selectedNote: Note | null;
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  sortOptions: SortOptions;

  // Actions
  fetchNotes: () => Promise<void>;
  selectNote: (note: Note | null) => void;
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (input: UpdateNoteInput) => Promise<Note | undefined>;
  deleteNote: (id: string) => Promise<boolean>;
  duplicateNote: (id: string) => Promise<Note | undefined>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  setFilters: (filters: SearchFilters) => void;
  setSortOptions: (options: SortOptions) => void;
  clearError: () => void;
}

export const useNoteStore = create<NoteState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        notes: [],
        selectedNote: null,
        isLoading: false,
        error: null,
        filters: { archived: false },
        sortOptions: { field: 'updatedAt', direction: 'desc' },

        // Fetch all notes
        fetchNotes: async () => {
          set({ isLoading: true, error: null });
          try {
            const { filters, sortOptions } = get();
            const notes = await notesService.search(filters, sortOptions);
            set({ notes, isLoading: false });
          } catch (error) {
            set({ error: 'Failed to fetch notes', isLoading: false });
          }
        },

        // Select a note
        selectNote: (note) => {
          set({ selectedNote: note });
        },

        // Create a new note
        createNote: async (input) => {
          set({ isLoading: true, error: null });
          try {
            const note = await notesService.create(input);
            await get().fetchNotes();
            set({ selectedNote: note, isLoading: false });
            return note;
          } catch (error) {
            set({ error: 'Failed to create note', isLoading: false });
            throw error;
          }
        },

        // Update a note
        updateNote: async (input) => {
          set({ error: null });
          try {
            const note = await notesService.update(input);
            if (note) {
              const { notes, selectedNote } = get();
              const updatedNotes = notes.map(n => n.id === note.id ? note : n);
              set({
                notes: updatedNotes,
                selectedNote: selectedNote?.id === note.id ? note : selectedNote,
              });
            }
            return note;
          } catch (error) {
            set({ error: 'Failed to update note' });
            throw error;
          }
        },

        // Delete a note
        deleteNote: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const success = await notesService.delete(id);
            if (success) {
              const { notes, selectedNote } = get();
              set({
                notes: notes.filter(n => n.id !== id),
                selectedNote: selectedNote?.id === id ? null : selectedNote,
                isLoading: false,
              });
            }
            return success;
          } catch (error) {
            set({ error: 'Failed to delete note', isLoading: false });
            return false;
          }
        },

        // Duplicate a note
        duplicateNote: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const note = await notesService.duplicate(id);
            if (note) {
              await get().fetchNotes();
              set({ selectedNote: note, isLoading: false });
            }
            return note;
          } catch (error) {
            set({ error: 'Failed to duplicate note', isLoading: false });
            return undefined;
          }
        },

        // Toggle favorite
        toggleFavorite: async (id) => {
          const note = get().notes.find(n => n.id === id);
          if (note) {
            await get().updateNote({ id, favorite: !note.favorite });
          }
        },

        // Toggle archive
        toggleArchive: async (id) => {
          const note = get().notes.find(n => n.id === id);
          if (note) {
            await get().updateNote({ id, archived: !note.archived });
            await get().fetchNotes();
          }
        },

        // Toggle pin
        togglePin: async (id) => {
          const note = get().notes.find(n => n.id === id);
          if (note) {
            await get().updateNote({ id, pinned: !note.pinned });
            await get().fetchNotes();
          }
        },

        // Set filters
        setFilters: (filters) => {
          set({ filters });
          get().fetchNotes();
        },

        // Set sort options
        setSortOptions: (options) => {
          set({ sortOptions: options });
          get().fetchNotes();
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'note-store',
        partialize: (state) => ({
          filters: state.filters,
          sortOptions: state.sortOptions,
        }),
      }
    )
  )
);
