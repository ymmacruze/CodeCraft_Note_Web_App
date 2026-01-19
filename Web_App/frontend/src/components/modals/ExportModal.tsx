import React from 'react';
import {
  Download,
  FileText,
  FileJson,
  FileCode,
  File,
  CheckCircle,
  Loader2,
  HardDrive,
  FolderDown,
} from 'lucide-react';
import { Dialog, DialogContent, Button, ScrollArea } from '@/components/ui';
import { useNoteStore } from '@/stores';
import {
  downloadNote,
  exportNotesAsJson,
  type ExportFormat,
} from '@/services/export.service';
import { saveNoteToFileSystem, downloadBackup, saveBackupToFileSystem } from '@/services/backup.service';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note | null;
}

type ExportMode = 'single' | 'bulk' | 'backup';

interface FormatOption {
  id: ExportFormat;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'md',
    name: 'Markdown',
    description: 'Standard markdown format (.md)',
    icon: FileText,
    color: 'text-blue-500',
  },
  {
    id: 'txt',
    name: 'Plain Text',
    description: 'Simple text without formatting (.txt)',
    icon: File,
    color: 'text-gray-500',
  },
  {
    id: 'html',
    name: 'HTML',
    description: 'Web page with styling (.html)',
    icon: FileCode,
    color: 'text-orange-500',
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Data format with metadata (.json)',
    icon: FileJson,
    color: 'text-amber-500',
  },
];

export function ExportModal({ open, onOpenChange, note }: ExportModalProps) {
  const { notes } = useNoteStore();
  const [mode, setMode] = React.useState<ExportMode>(note ? 'single' : 'bulk');
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>('md');
  const [includeMetadata, setIncludeMetadata] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportComplete, setExportComplete] = React.useState(false);
  const [useFilePicker, setUseFilePicker] = React.useState(false);
  const [selectedNotes, setSelectedNotes] = React.useState<Set<string>>(new Set());

  const availableNotes = React.useMemo(() => {
    return notes.filter((n) => !n.archived);
  }, [notes]);

  React.useEffect(() => {
    if (open) {
      setMode(note ? 'single' : 'bulk');
      setExportComplete(false);
      setSelectedNotes(new Set(availableNotes.map((n) => n.id)));
    }
  }, [open, note, availableNotes]);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (mode === 'backup') {
        if (useFilePicker) {
          await saveBackupToFileSystem(notes);
        } else {
          downloadBackup(notes);
        }
      } else if (mode === 'single' && note) {
        if (useFilePicker) {
          await saveNoteToFileSystem(note, selectedFormat as 'md' | 'txt' | 'json' | 'html');
        } else {
          downloadNote(note, selectedFormat, { includeMetadata });
        }
      } else if (mode === 'bulk') {
        const notesToExport = availableNotes.filter((n) => selectedNotes.has(n.id));
        
        if (selectedFormat === 'json') {
          exportNotesAsJson(notesToExport);
        } else {
          for (const noteToExport of notesToExport) {
            downloadNote(noteToExport, selectedFormat, { includeMetadata });
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      }
      
      setExportComplete(true);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const selectAllNotes = () => {
    setSelectedNotes(new Set(availableNotes.map((n) => n.id)));
  };

  const deselectAllNotes = () => {
    setSelectedNotes(new Set());
  };

  const getExportSummary = () => {
    if (mode === 'backup') {
      return `${notes.length} notes as backup`;
    } else if (mode === 'single' && note) {
      return `"${note.title}" as ${selectedFormat.toUpperCase()}`;
    } else {
      return `${selectedNotes.size} notes as ${selectedFormat.toUpperCase()}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0" onClose={() => onOpenChange(false)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--pastel-sky))] to-[hsl(var(--pastel-lavender))] flex items-center justify-center">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Export Notes</h2>
              <p className="text-sm text-muted-foreground">
                Save your notes to your computer
              </p>
            </div>
          </div>

          {!exportComplete ? (
            <div className="space-y-5">
              {!note && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Export Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        mode === 'bulk'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => setMode('bulk')}
                    >
                      <FolderDown className="h-6 w-6 mb-2 text-primary" />
                      <p className="font-medium">Export Notes</p>
                      <p className="text-xs text-muted-foreground">
                        Export selected notes
                      </p>
                    </button>
                    <button
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        mode === 'backup'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => setMode('backup')}
                    >
                      <HardDrive className="h-6 w-6 mb-2 text-green-600" />
                      <p className="font-medium">Full Backup</p>
                      <p className="text-xs text-muted-foreground">
                        Backup all notes
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {mode !== 'backup' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FORMAT_OPTIONS.map((format) => (
                      <button
                        key={format.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                          selectedFormat === format.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => setSelectedFormat(format.id)}
                      >
                        <format.icon className={cn('h-5 w-5', format.color)} />
                        <div className="text-left">
                          <p className="font-medium text-sm">{format.name}</p>
                          <p className="text-xs text-muted-foreground">.{format.id}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'bulk' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Select Notes ({selectedNotes.size} / {availableNotes.length})
                    </label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={selectAllNotes} className="text-xs">
                        Select All
                      </Button>
                      <Button variant="ghost" size="sm" onClick={deselectAllNotes} className="text-xs">
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="max-h-[150px] rounded-xl border">
                    <div className="p-2 space-y-1">
                      {availableNotes.map((n) => (
                        <label
                          key={n.id}
                          className={cn(
                            'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                            selectedNotes.has(n.id) ? 'bg-primary/10' : 'hover:bg-muted/50'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedNotes.has(n.id)}
                            onChange={() => toggleNoteSelection(n.id)}
                            className="rounded border-border"
                          />
                          <span className="text-sm truncate flex-1">{n.title}</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-medium">Options</label>
                <div className="space-y-2">
                  {mode !== 'backup' && (
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMetadata}
                        onChange={(e) => setIncludeMetadata(e.target.checked)}
                        className="rounded border-border"
                      />
                      <div>
                        <p className="text-sm font-medium">Include metadata</p>
                        <p className="text-xs text-muted-foreground">Add dates, tags, and other info</p>
                      </div>
                    </label>
                  )}
                  
                  {'showSaveFilePicker' in window && (
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useFilePicker}
                        onChange={(e) => setUseFilePicker(e.target.checked)}
                        className="rounded border-border"
                      />
                      <div>
                        <p className="text-sm font-medium">Choose save location</p>
                        <p className="text-xs text-muted-foreground">Select where to save the file</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <Button
                className="w-full rounded-xl h-11"
                onClick={handleExport}
                disabled={isExporting || (mode === 'bulk' && selectedNotes.size === 0)}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {getExportSummary()}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Export Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Your notes have been exported successfully
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="rounded-xl" onClick={() => setExportComplete(false)}>
                  Export More
                </Button>
                <Button className="rounded-xl" onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
