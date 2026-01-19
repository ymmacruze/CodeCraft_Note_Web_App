import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  Star,
  Archive,
  Settings,
  Plus,
  Search,
  ChevronLeft,
  Hash,
  Sparkles,
  Upload,
  Download,
} from 'lucide-react';
import { Button, ScrollArea, Input } from '@/components/ui';
import { useUIStore, useNoteStore } from '@/stores';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onNewNote: () => void;
}

export function Sidebar({ onNewNote }: SidebarProps) {
  const { sidebarOpen, toggleSidebar, searchQuery, setSearchQuery, setSearchOpen, setImportModalOpen, setExportModalOpen } = useUIStore();
  const { notes, filters, setFilters } = useNoteStore();

  // Get unique tags from all notes
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes]);

  // Count notes
  const noteCounts = React.useMemo(() => {
    return {
      all: notes.filter((n) => !n.archived).length,
      favorites: notes.filter((n) => n.favorite && !n.archived).length,
      archived: notes.filter((n) => n.archived).length,
    };
  }, [notes]);

  const navItems = [
    { to: '/', icon: FileText, label: 'All Notes', count: noteCounts.all },
    { to: '/favorites', icon: Star, label: 'Favorites', count: noteCounts.favorites },
    { to: '/archive', icon: Archive, label: 'Archive', count: noteCounts.archived },
  ];

  if (!sidebarOpen) {
    return (
      <div className="w-20 bg-[hsl(var(--surface-1))] flex flex-col items-center py-6 gap-4 border-r border-border/50">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-12 w-12 rounded-xl hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-6 w-6 rotate-180" />
        </Button>
        <div className="w-10 h-px bg-border/50 my-2" />
        <Button variant="ghost" size="icon" onClick={onNewNote} className="h-12 w-12 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary">
          <Plus className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="h-12 w-12 rounded-xl hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground">
          <Search className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[hsl(var(--surface-1))] flex flex-col h-full border-r border-border/50">
      {/* Header */}
      <div className="p-7 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--accent-pink))] flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-foreground">CodeCraft</h1>
            <p className="text-sm text-muted-foreground font-medium mt-0.5">Notes</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-11 w-11 rounded-xl hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 pb-5">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg bg-[hsl(var(--surface-3))] flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-primary/20">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
          </div>
          <Input
            placeholder="Search notes..."
            className="h-14 pl-16 pr-5 bg-[hsl(var(--surface-2))] border-border/50 rounded-xl focus:bg-[hsl(var(--surface-3))] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-base text-foreground placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => setSearchOpen(true)}
          />
        </div>
      </div>

      {/* New Note Button */}
      <div className="px-6 pb-6">
        <Button 
          onClick={onNewNote} 
          className="w-full rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 font-semibold h-14 text-base bg-gradient-to-r from-primary to-[hsl(var(--accent-pink))] hover:opacity-90 transition-all text-white"
        >
          <Plus className="h-6 w-6 mr-3" />
          New Note
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-5">
        <nav className="space-y-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-4 px-5 py-4 rounded-xl text-base font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-primary/20 text-primary shadow-sm'
                    : 'hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground'
                )
              }
            >
              <item.icon className="h-6 w-6" />
              <span className="flex-1">{item.label}</span>
              {item.count > 0 && (
                <span className="text-sm bg-[hsl(var(--surface-3))] text-foreground px-3 py-1 rounded-full font-semibold">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div className="mt-6">
            <h3 className="px-4 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tags
            </h3>
            <div className="space-y-1">
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    const currentTags = filters.tags || [];
                    const newTags = currentTags.includes(tag)
                      ? currentTags.filter((t) => t !== tag)
                      : [...currentTags, tag];
                    setFilters({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
                  }}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition-all duration-200',
                    filters.tags?.includes(tag)
                      ? 'bg-primary/20 text-primary font-medium'
                      : 'hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Hash className="h-4 w-4" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-5 border-t border-border/30 space-y-3">
        {/* Quick Actions */}
        <div className="flex gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setImportModalOpen(true)}
            className="flex-1 h-10 rounded-xl gap-2 text-sm hover:bg-[hsl(var(--accent-green)/0.2)] hover:text-[hsl(var(--accent-green))] text-muted-foreground"
          >
            <Upload className="h-5 w-5" />
            Import
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExportModalOpen(true)}
            className="flex-1 h-10 rounded-xl gap-2 text-sm hover:bg-[hsl(var(--accent-cyan)/0.2)] hover:text-[hsl(var(--accent-cyan))] text-muted-foreground"
          >
            <Download className="h-5 w-5" />
            Export
          </Button>
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-4 px-5 py-3 rounded-xl text-base font-medium transition-all duration-200',
              isActive
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground'
            )
          }
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
}
