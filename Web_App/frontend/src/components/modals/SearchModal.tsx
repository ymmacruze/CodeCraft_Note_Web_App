import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Clock } from 'lucide-react';
import { Dialog, DialogContent, ScrollArea } from '@/components/ui';
import { useNoteStore } from '@/stores';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const navigate = useNavigate();
  const { notes } = useNoteStore();
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter notes based on query
  const filteredNotes = React.useMemo(() => {
    if (!query) {
      return notes.slice(0, 10);
    }
    const lowerQuery = query.toLowerCase();
    return notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10);
  }, [notes, query]);

  // Reset state when opening
  React.useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredNotes.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredNotes[selectedIndex]) {
          handleSelect(filteredNotes[selectedIndex].id);
        }
        break;
      case 'Escape':
        onOpenChange(false);
        break;
    }
  };

  const handleSelect = (noteId: string) => {
    onOpenChange(false);
    navigate(`/note/${noteId}`);
  };

  // Highlight matching text
  const highlightMatch = (text: string, maxLength = 100) => {
    if (!query) return text.substring(0, maxLength);
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text.substring(0, maxLength);
    
    const start = Math.max(0, index - 20);
    const end = Math.min(text.length, index + query.length + 60);
    let excerpt = text.substring(start, end);
    
    if (start > 0) excerpt = '...' + excerpt;
    if (end < text.length) excerpt = excerpt + '...';
    
    return excerpt.replace(
      new RegExp(`(${query})`, 'gi'),
      '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>'
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0" onClose={() => onOpenChange(false)}>
        <div className="flex items-center border-b px-5 gap-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 py-4 outline-none bg-transparent text-base"
          />
        </div>

        <ScrollArea className="max-h-[400px]">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notes found</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotes.map((note, index) => (
                <button
                  key={note.id}
                  onClick={() => handleSelect(note.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-md transition-colors',
                    index === selectedIndex
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-medium truncate"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(note.title),
                        }}
                      />
                      <p
                        className="text-sm text-muted-foreground mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(note.content, 150),
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center gap-4">
          <span><kbd className="px-1.5 py-0.5 rounded bg-muted">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd> Open</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-muted">Esc</kbd> Close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
