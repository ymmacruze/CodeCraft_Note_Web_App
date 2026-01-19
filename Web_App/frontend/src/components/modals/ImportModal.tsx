import React from 'react';
import { Upload, FileText, FileJson, File, CheckCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, Button, ScrollArea } from '@/components/ui';
import { importFiles, type ImportResult } from '@/services/import.service';
import { openFilePickerForImport } from '@/services/backup.service';
import { useNoteStore } from '@/stores';
import { cn } from '@/lib/utils';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = 'select' | 'preview' | 'importing' | 'complete';

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const { createNote } = useNoteStore();
  const [step, setStep] = React.useState<ImportStep>('select');
  const [files, setFiles] = React.useState<File[]>([]);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const [importedCount, setImportedCount] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('select');
        setFiles([]);
        setResult(null);
        setImportedCount(0);
      }, 300);
    }
  }, [open]);

  const handleFileSelect = async () => {
    const selectedFiles = await openFilePickerForImport();
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(selectedFiles);
      // Parse files for preview
      const importResult = await importFiles(selectedFiles);
      setResult(importResult);
      setStep('preview');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['md', 'markdown', 'txt', 'json'].includes(ext || '');
    });
    
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      const importResult = await importFiles(droppedFiles);
      setResult(importResult);
      setStep('preview');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleImport = async () => {
    if (!result) return;
    
    setStep('importing');
    const { updateNote } = useNoteStore.getState();
    
    for (let i = 0; i < result.imported.length; i++) {
      const note = result.imported[i];
      const createdNote = await createNote({
        title: note.title,
        content: note.content,
        tags: note.tags,
        format: 'markdown',
      });
      
      // Update the note with favorite/pinned status if needed
      if (note.favorite || note.pinned) {
        await updateNote({
          id: createdNote.id,
          favorite: note.favorite,
          pinned: note.pinned,
        });
      }
      
      setImportedCount(i + 1);
    }
    
    setStep('complete');
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'json':
        return <FileJson className="h-5 w-5 text-amber-500" />;
      case 'md':
      case 'markdown':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0" onClose={() => onOpenChange(false)}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--pastel-mint))] to-[hsl(var(--pastel-sky))] flex items-center justify-center">
              <Upload className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Import Notes</h2>
              <p className="text-sm text-muted-foreground">
                Import notes from Markdown, Text, or JSON files
              </p>
            </div>
          </div>

          {/* Step: Select Files */}
          {step === 'select' && (
            <div className="space-y-4">
              <div
                className={cn(
                  'border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
                onClick={handleFileSelect}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-1">
                  {isDragging ? 'Drop files here' : 'Click to select files'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or drag and drop files here
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports .md, .txt, .json files
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".md,.markdown,.txt,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files));
                  }
                }}
              />
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && result && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Files to import</span>
                  <span className="text-sm text-muted-foreground">
                    {result.imported.length} notes from {files.length} files
                  </span>
                </div>
                
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-card"
                      >
                        {getFileIcon(file.name)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-destructive/10 rounded-xl p-4">
                  <p className="font-medium text-destructive mb-2">
                    {result.errors.length} error(s)
                  </p>
                  <div className="space-y-1">
                    {result.errors.map((error, index) => (
                      <p key={index} className="text-sm text-destructive/80">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted/30 rounded-xl p-4">
                <p className="font-medium mb-3">Notes Preview</p>
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-2">
                    {result.imported.map((note, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-white dark:bg-card"
                      >
                        <p className="font-medium text-sm">{note.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {note.content.substring(0, 150)}...
                        </p>
                        {note.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {note.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setStep('select');
                    setFiles([]);
                    setResult(null);
                  }}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 rounded-xl"
                  onClick={handleImport}
                  disabled={result.imported.length === 0}
                >
                  Import {result.imported.length} Notes
                </Button>
              </div>
            </div>
          )}

          {/* Step: Importing */}
          {step === 'importing' && result && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="font-medium mb-2">Importing notes...</p>
              <p className="text-sm text-muted-foreground">
                {importedCount} of {result.imported.length} notes imported
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(importedCount / result.imported.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && result && (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Import Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Successfully imported {result.imported.length} notes
              </p>
              <Button
                className="rounded-xl px-8"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
