import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Star, Pin, FileText, MoreVertical, Archive, Trash2, Copy } from 'lucide-react';
import { Card, Badge, Button, ScrollArea } from '@/components/ui';
import { useNoteStore, useUIStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
}

function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  const { toggleFavorite, togglePin, toggleArchive, duplicateNote, deleteNote } = useNoteStore();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleMenuAction = async (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    
    switch (action) {
      case 'favorite':
        await toggleFavorite(note.id);
        break;
      case 'pin':
        await togglePin(note.id);
        break;
      case 'archive':
        await toggleArchive(note.id);
        break;
      case 'duplicate':
        await duplicateNote(note.id);
        break;
      case 'delete':
        await deleteNote(note.id);
        break;
    }
  };

  // Get preview text (first 120 characters without markdown)
  const previewText = React.useMemo(() => {
    return note.content
      .replace(/[#*`~\[\]()>_-]/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 120);
  }, [note.content]);

  return (
    <Card
      className={cn(
        'group p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border bg-[hsl(var(--surface-2))] border-border/30 hover:border-primary/40 hover:-translate-y-0.5',
        isSelected && 'ring-2 ring-primary shadow-lg shadow-primary/15 border-primary/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-5">
            {note.pinned && (
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                <Pin className="h-4 w-4 text-primary fill-primary" />
              </div>
            )}
            <h3 className="font-semibold text-xl truncate text-foreground">{note.title || 'Untitled'}</h3>
            {note.favorite && (
              <Star className="h-5 w-5 text-[hsl(var(--accent-yellow))] fill-[hsl(var(--accent-yellow))] shrink-0" />
            )}
          </div>
          
          <p className="text-base text-muted-foreground leading-relaxed line-clamp-3 mb-6 h-[78px]">
            {previewText || 'Start writing...'}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-muted-foreground font-medium">
              {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
            </span>
            
            {note.tags.length > 0 && (
              <>
                <span className="text-muted-foreground/30">•</span>
                <div className="flex items-center gap-2">
                  {note.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-sm px-3.5 py-1.5 rounded-full bg-primary/20 text-primary font-medium border-0">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="text-sm text-muted-foreground">
                      +{note.tags.length - 2}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 opacity-0 group-hover:opacity-100 hover:opacity-100 rounded-xl transition-opacity hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-[100]"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-white/10 bg-[hsl(250,22%,16%)] shadow-2xl shadow-black/50 z-[101] overflow-hidden">
                <div className="p-3">
                  <button
                    onClick={(e) => handleMenuAction('favorite', e)}
                    className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-[hsl(var(--surface-hover))] text-foreground transition-colors"
                  >
                    <Star className="h-5 w-5 text-[hsl(var(--accent-yellow))]" />
                    {note.favorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  <button
                    onClick={(e) => handleMenuAction('pin', e)}
                    className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-[hsl(var(--surface-hover))] text-foreground transition-colors"
                  >
                    <Pin className="h-5 w-5 text-primary" />
                    {note.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={(e) => handleMenuAction('duplicate', e)}
                    className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-[hsl(var(--surface-hover))] text-foreground transition-colors"
                  >
                    <Copy className="h-5 w-5 text-[hsl(var(--accent-cyan))]" />
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => handleMenuAction('archive', e)}
                    className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-[hsl(var(--surface-hover))] text-foreground transition-colors"
                  >
                    <Archive className="h-5 w-5 text-[hsl(var(--accent-orange))]" />
                    {note.archived ? 'Unarchive' : 'Archive'}
                  </button>
                  <div className="h-px bg-white/10 my-3 mx-2" />
                  <button
                    onClick={(e) => handleMenuAction('delete', e)}
                    className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-destructive/20 text-destructive transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

interface NotesListProps {
  notes: Note[];
  emptyMessage?: string;
}

export function NotesList({ notes, emptyMessage = 'No notes yet' }: NotesListProps) {
  const navigate = useNavigate();
  const { selectedNote, selectNote } = useNoteStore();
  const { viewMode } = useUIStore();

  const handleNoteClick = (note: Note) => {
    selectNote(note);
    navigate(`/note/${note.id}`);
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-16">
        <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-primary/30 to-[hsl(var(--accent-pink)/0.3)] flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-3 text-foreground">{emptyMessage}</h3>
        <p className="text-base text-muted-foreground max-w-sm">
          Create a new note to start capturing your thoughts and ideas
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-10">
        <div
          className={cn(
            'gap-7',
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
              : 'flex flex-col max-w-3xl mx-auto'
          )}
        >
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={selectedNote?.id === note.id}
              onClick={() => handleNoteClick(note)}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
