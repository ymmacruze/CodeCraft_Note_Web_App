import React from 'react';
import { Star } from 'lucide-react';
import { NotesList } from '@/components/notes';
import { useNoteStore } from '@/stores';
import type { Note } from '@/types';

export function FavoritesPage() {
  const { notes, fetchNotes, isLoading } = useNoteStore();

  React.useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const favoriteNotes = React.useMemo(() => {
    return notes.filter((note: Note) => note.favorite && !note.archived);
  }, [notes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[hsl(var(--surface-1))]">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-yellow))] to-[hsl(var(--accent-orange))] flex items-center justify-center animate-pulse">
          <Star className="h-6 w-6 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--surface-1))]">
      {/* Header */}
      <div className="flex items-center gap-5 px-10 py-8 bg-[hsl(var(--surface-2))] border-b border-white/5 shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-yellow))] to-[hsl(var(--accent-orange))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent-yellow)/0.3)]">
          <Star className="h-8 w-8 text-white fill-white/80" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--accent-yellow))] to-[hsl(var(--accent-orange))] bg-clip-text text-transparent">Favorites</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {favoriteNotes.length} {favoriteNotes.length !== 1 ? 'notes' : 'note'} you love
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <NotesList
          notes={favoriteNotes}
          emptyMessage="No favorite notes yet. Star a note to add it here."
        />
      </div>
    </div>
  );
}
