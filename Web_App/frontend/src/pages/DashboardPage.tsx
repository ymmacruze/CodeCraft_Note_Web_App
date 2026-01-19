import React from 'react';
import { Plus, ArrowUpDown, Grid, List, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotesList } from '@/components/notes';
import { Button } from '@/components/ui';
import { useNoteStore, useUIStore } from '@/stores';
import type { Note, SortOptions } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { notes, isLoading, createNote, fetchNotes, sortOptions, setSortOptions } = useNoteStore();
  const { viewMode, setViewMode } = useUIStore();

  React.useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    const note = await createNote({ title: 'Untitled Note', format: 'markdown' });
    if (note) {
      navigate(`/note/${note.id}`);
    }
  };

  // Get non-archived notes for the dashboard
  const activeNotes = React.useMemo(() => {
    return notes.filter((note: Note) => !note.archived);
  }, [notes]);

  // Separate pinned notes
  const { pinnedNotes, unpinnedNotes } = React.useMemo(() => {
    const pinned = activeNotes.filter((note: Note) => note.pinned);
    const unpinned = activeNotes.filter((note: Note) => !note.pinned);
    return { pinnedNotes: pinned, unpinnedNotes: unpinned };
  }, [activeNotes]);

  const handleSortToggle = () => {
    const sortFields: SortOptions['field'][] = ['updatedAt', 'createdAt', 'title'];
    const currentIndex = sortFields.indexOf(sortOptions.field);
    const nextIndex = (currentIndex + 1) % sortFields.length;
    setSortOptions({ ...sortOptions, field: sortFields[nextIndex] });
  };

  const getSortLabel = () => {
    switch (sortOptions.field) {
      case 'updatedAt':
        return 'Last Modified';
      case 'createdAt':
        return 'Created';
      case 'title':
        return 'Title';
      default:
        return 'Sort';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-pink))] flex items-center justify-center animate-pulse">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--surface-1))]">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-8 bg-[hsl(var(--surface-2))] border-b border-white/5 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-pink))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent-purple)/0.3)]">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] bg-clip-text text-transparent">
              All Notes
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">
              {activeNotes.length} {activeNotes.length !== 1 ? 'notes' : 'note'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSortToggle}
            className="h-12 px-5 gap-3 rounded-xl bg-[hsl(var(--surface-3))] border-white/10 hover:bg-[hsl(var(--surface-hover))] hover:border-[hsl(var(--accent-purple)/0.5)] text-white/90 shadow-sm font-medium"
          >
            <ArrowUpDown className="h-5 w-5" />
            <span>{getSortLabel()}</span>
          </Button>

          {/* View toggle */}
          <div className="flex items-center bg-[hsl(var(--surface-3))] rounded-xl p-2 border border-white/10 shadow-sm">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className={`h-10 w-10 rounded-lg ${viewMode === 'grid' ? 'bg-[hsl(var(--accent-purple))] text-white shadow-sm' : 'hover:bg-[hsl(var(--surface-hover))] text-white/70'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className={`h-10 w-10 rounded-lg ${viewMode === 'list' ? 'bg-[hsl(var(--accent-purple))] text-white shadow-sm' : 'hover:bg-[hsl(var(--surface-hover))] text-white/70'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>

          {/* Create button */}
          <Button 
            onClick={handleCreateNote} 
            className="h-12 px-6 gap-3 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <Plus className="h-5 w-5" />
            New Note
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {pinnedNotes.length > 0 && (
          <div className="px-10 py-8 bg-[hsl(var(--surface-2)/0.5)] border-b border-white/5">
            <h2 className="text-sm font-semibold text-[hsl(var(--accent-yellow))] flex items-center gap-3 mb-6">
              <span className="h-7 w-7 rounded-full bg-[hsl(var(--accent-yellow)/0.2)] flex items-center justify-center text-sm">📌</span>
              Pinned Notes
            </h2>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'flex flex-col gap-6'
            }>
              {pinnedNotes.map((note) => (
                <NotesList key={note.id} notes={[note]} />
              ))}
            </div>
          </div>
        )}

        <NotesList
          notes={unpinnedNotes}
          emptyMessage={notes.length === 0 
            ? "No notes yet. Create your first note to get started!" 
            : "No notes match your search"
          }
        />
      </div>
    </div>
  );
}
