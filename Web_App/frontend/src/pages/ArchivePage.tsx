import React from 'react';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { NotesList } from '@/components/notes';
import { Button } from '@/components/ui';
import { useNoteStore } from '@/stores';
import type { Note } from '@/types';

export function ArchivePage() {
  const { notes, fetchNotes, isLoading, toggleArchive, deleteNote } = useNoteStore();

  React.useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const archivedNotes = React.useMemo(() => {
    return notes.filter((note: Note) => note.archived);
  }, [notes]);

  const handleUnarchiveAll = async () => {
    for (const note of archivedNotes) {
      await toggleArchive(note.id);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm(`Are you sure you want to permanently delete all ${archivedNotes.length} archived notes?`)) {
      for (const note of archivedNotes) {
        await deleteNote(note.id);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[hsl(var(--surface-1))]">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--accent-purple))] flex items-center justify-center animate-pulse">
          <Archive className="h-6 w-6 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--surface-1))]">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-8 bg-[hsl(var(--surface-2))] border-b border-white/5 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--accent-purple))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent-cyan)/0.3)]">
            <Archive className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] bg-clip-text text-transparent">Archive</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              {archivedNotes.length} {archivedNotes.length !== 1 ? 'notes' : 'note'} stored away
            </p>
          </div>
        </div>

        {archivedNotes.length > 0 && (
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnarchiveAll}
              className="h-12 px-5 gap-3 rounded-xl bg-[hsl(var(--surface-3))] border-white/10 hover:bg-[hsl(var(--accent-green)/0.2)] hover:border-[hsl(var(--accent-green)/0.5)] text-white/90 shadow-sm font-medium"
            >
              <ArchiveRestore className="h-5 w-5" />
              <span>Restore All</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              className="h-12 px-5 gap-3 rounded-xl shadow-lg shadow-destructive/20 font-medium"
            >
              <Trash2 className="h-5 w-5" />
              Delete All
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <NotesList
          notes={archivedNotes}
          emptyMessage="No archived notes. Archive a note to move it here."
        />
      </div>
    </div>
  );
}
