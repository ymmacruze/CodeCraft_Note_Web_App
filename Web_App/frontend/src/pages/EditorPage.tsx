import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { MarkdownEditor } from '@/components/editor';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui';
import { useNoteStore, useUIStore } from '@/stores';
import { cn } from '@/lib/utils';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedNote, selectNote, notes, fetchNotes, isLoading } = useNoteStore();
  const { focusMode } = useUIStore();

  // Fetch notes if not loaded
  React.useEffect(() => {
    if (notes.length === 0) {
      fetchNotes();
    }
  }, [notes.length, fetchNotes]);

  // Load note from ID
  React.useEffect(() => {
    if (id && notes.length > 0) {
      const note = notes.find((n) => n.id === id);
      if (note) {
        selectNote(note);
      } else {
        // Note not found, redirect to dashboard
        navigate('/');
      }
    }
  }, [id, notes, selectNote, navigate]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/');
  };

  // Keyboard shortcut for back
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusMode) {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[hsl(var(--surface-1))]">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-pink))] flex items-center justify-center animate-pulse">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
      </div>
    );
  }

  if (!selectedNote) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-[hsl(var(--surface-1))]">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-pink))] flex items-center justify-center">
          <span className="text-3xl">📝</span>
        </div>
        <p className="text-muted-foreground text-lg font-medium">Note not found</p>
        <Button 
          onClick={() => navigate('/')}
          className="rounded-xl bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] hover:opacity-90 shadow-md shadow-primary/20"
        >
          Go back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('h-full flex flex-col', focusMode ? 'bg-[hsl(var(--surface-1))]' : 'bg-[hsl(var(--surface-1))]')}>
      {/* Editor header */}
      {!focusMode && (
        <div className="relative z-50 flex items-center justify-between gap-3 px-6 py-4 bg-[hsl(var(--surface-2))] border-b border-white/5">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="shrink-0 rounded-xl hover:bg-[hsl(var(--surface-hover))] border-white/10 gap-2 text-white/90"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold truncate max-w-[200px] sm:max-w-[400px] text-white">
                {selectedNote.title || 'Untitled'}
              </span>
              {selectedNote.pinned && (
                <span className="h-6 w-6 rounded-full bg-[hsl(var(--accent-yellow)/0.2)] flex items-center justify-center text-xs">📌</span>
              )}
              {selectedNote.favorite && (
                <span className="h-6 w-6 rounded-full bg-[hsl(var(--accent-pink)/0.2)] flex items-center justify-center text-xs">⭐</span>
              )}
            </div>
          </div>

          <Header currentNote={selectedNote} />
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <MarkdownEditor
          note={selectedNote}
          onTitleChange={() => {}}
          onContentChange={() => {}}
        />
      </div>
    </div>
  );
}
