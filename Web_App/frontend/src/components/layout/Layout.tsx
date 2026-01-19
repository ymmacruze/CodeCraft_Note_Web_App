import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SearchModal } from '@/components/modals/SearchModal';
import { DeleteModal } from '@/components/modals/DeleteModal';
import { ExportModal } from '@/components/modals/ExportModal';
import { ImportModal } from '@/components/modals/ImportModal';
import { useNoteStore, useUIStore } from '@/stores';
import { useKeyboardShortcuts } from '@/hooks';
import { cn } from '@/lib/utils';

export function Layout() {
  const navigate = useNavigate();
  const { selectedNote, createNote, deleteNote, fetchNotes } = useNoteStore();
  const { 
    focusMode,
    toggleSidebar, 
    searchOpen, 
    setSearchOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    exportModalOpen,
    setExportModalOpen,
    importModalOpen,
    setImportModalOpen,
  } = useUIStore();

  // Fetch notes on mount
  React.useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Handle new note creation
  const handleNewNote = async () => {
    const note = await createNote({ title: 'Untitled Note', format: 'markdown' });
    navigate(`/note/${note.id}`);
  };

  // Handle note deletion
  const handleDeleteNote = async () => {
    if (selectedNote) {
      await deleteNote(selectedNote.id);
      setDeleteModalOpen(false);
      navigate('/');
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'n', ctrl: true, action: handleNewNote },
    { key: 'k', ctrl: true, action: () => setSearchOpen(true) },
    { key: 'b', ctrl: true, action: toggleSidebar },
  ]);

  return (
    <div className={cn('flex h-screen bg-background', focusMode && 'focus-mode')}>
      {/* Sidebar */}
      {!focusMode && <Sidebar onNewNote={handleNewNote} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      <SearchModal 
        open={searchOpen} 
        onOpenChange={setSearchOpen} 
      />
      
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteNote}
        noteTitle={selectedNote?.title}
      />
      
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        note={selectedNote}
      />
      
      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
      />
    </div>
  );
}
