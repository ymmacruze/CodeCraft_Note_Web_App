import React from 'react';
import { Menu, MoreVertical, Download, Trash2, Copy, Star, Archive, Pin, ArrowLeft } from 'lucide-react';
import { Button, Tooltip } from '@/components/ui';
import { useUIStore, useNoteStore } from '@/stores';
import type { Note } from '@/types';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  currentNote?: Note | null;
}

export function Header({ currentNote }: HeaderProps) {
  const { sidebarOpen, toggleSidebar, setExportModalOpen, setDeleteModalOpen } = useUIStore();
  const { toggleFavorite, togglePin, toggleArchive, duplicateNote } = useNoteStore();
  const [showMenu, setShowMenu] = React.useState(false);
  const navigate = useNavigate();

  const handleAction = async (action: string) => {
    if (!currentNote) return;
    
    switch (action) {
      case 'favorite':
        await toggleFavorite(currentNote.id);
        break;
      case 'pin':
        await togglePin(currentNote.id);
        break;
      case 'archive':
        await toggleArchive(currentNote.id);
        break;
      case 'duplicate':
        await duplicateNote(currentNote.id);
        break;
      case 'export':
        setExportModalOpen(true);
        break;
      case 'delete':
        setDeleteModalOpen(true);
        break;
    }
    setShowMenu(false);
  };

  return (
    <header className="h-16 border-b border-border/50 bg-[hsl(var(--surface-1))] flex items-center justify-between px-6">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {!sidebarOpen && !currentNote && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-10 w-10 hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {currentNote && (
          <Tooltip content="Back to notes list">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="h-10 w-10 hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Tooltip>
        )}
        
        {currentNote && (
          <div className="flex items-center gap-3">
            {currentNote.pinned && (
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Pin className="h-4 w-4 text-primary fill-primary" />
              </div>
            )}
            <h2 className="font-semibold text-lg truncate max-w-[300px] text-foreground">
              {currentNote.title}
            </h2>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {currentNote && (
          <>
            <Tooltip content={currentNote.favorite ? 'Remove from favorites' : 'Add to favorites'}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAction('favorite')}
                className="h-10 w-10 hover:bg-[hsl(var(--surface-hover))]"
              >
                <Star
                  className={`h-5 w-5 ${currentNote.favorite ? 'fill-[hsl(var(--accent-yellow))] text-[hsl(var(--accent-yellow))]' : 'text-muted-foreground'}`}
                />
              </Button>
            </Tooltip>

            <div className="relative">
              <Tooltip content="More options">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMenu(!showMenu)}
                  className="h-10 w-10 hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </Tooltip>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[100]"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-white/10 bg-[hsl(250,22%,16%)] shadow-2xl shadow-black/50 z-[101] overflow-hidden backdrop-blur-none">
                    <div className="p-3">
                      <button
                        onClick={() => handleAction('pin')}
                        className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-[hsl(var(--surface-hover))] text-foreground transition-colors"
                      >
                        <Pin className="h-5 w-5 text-primary" />
                        {currentNote.pinned ? 'Unpin' : 'Pin to top'}
                      </button>
                      <button
                        onClick={() => handleAction('duplicate')}
                        className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-[hsl(var(--surface-hover))] text-foreground transition-colors"
                      >
                        <Copy className="h-5 w-5 text-[hsl(var(--accent-cyan))]" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleAction('archive')}
                        className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-[hsl(var(--surface-hover))] text-foreground transition-colors"
                      >
                        <Archive className="h-5 w-5 text-[hsl(var(--accent-orange))]" />
                        {currentNote.archived ? 'Unarchive' : 'Archive'}
                      </button>
                      <button
                        onClick={() => handleAction('export')}
                        className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-[hsl(var(--surface-hover))] text-foreground transition-colors"
                      >
                        <Download className="h-5 w-5 text-[hsl(var(--accent-green))]" />
                        Export
                      </button>
                      <div className="h-px bg-white/10 my-3 mx-2" />
                      <button
                        onClick={() => handleAction('delete')}
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
          </>
        )}
      </div>
    </header>
  );
}
