import React, { useState, useCallback } from 'react';
import { CodeMirrorEditor } from './CodeMirrorEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { EditorToolbar } from './EditorToolbar';
import { useUIStore } from '@/stores';
import { useAutoSave } from '@/hooks';
import type { Note } from '@/types';

interface MarkdownEditorProps {
  note: Note;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
}

export function MarkdownEditor({ note, onContentChange, onTitleChange }: MarkdownEditorProps) {
  const { editorMode } = useUIStore();
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);

  // Auto-save hook
  useAutoSave(note.id, content, title, { delay: 2000 });

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);
  }, [onContentChange]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange(newTitle);
  }, [onTitleChange]);

  // Insert text at cursor (simplified - would need CodeMirror integration)
  const handleInsert = useCallback((text: string, wrap = false) => {
    // For now, just append to content
    // A full implementation would integrate with CodeMirror's API
    if (wrap) {
      handleContentChange(content + text + 'text' + text);
    } else {
      handleContentChange(content + text);
    }
  }, [content, handleContentChange]);

  // Only sync when switching to a different note (not on content updates)
  const noteIdRef = React.useRef(note.id);
  React.useEffect(() => {
    if (noteIdRef.current !== note.id) {
      setContent(note.content);
      setTitle(note.title);
      noteIdRef.current = note.id;
    }
  }, [note.id, note.content, note.title]);

  // Initialize on first mount
  React.useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--surface-1))]">
      {/* Title Input */}
      <div className="border-b border-border/30 px-8 py-6 bg-gradient-to-r from-primary/10 to-transparent">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="w-full text-3xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 focus:placeholder:text-muted-foreground/30"
        />
      </div>

      {/* Toolbar */}
      <EditorToolbar onInsert={handleInsert} />

      {/* Editor / Preview */}
      <div className="flex-1 overflow-hidden">
        {editorMode === 'edit' && (
          <CodeMirrorEditor
            value={content}
            onChange={handleContentChange}
            className="h-full"
          />
        )}

        {editorMode === 'preview' && (
          <MarkdownPreview content={content} className="h-full" />
        )}

        {editorMode === 'split' && (
          <div className="flex h-full">
            <div className="flex-1 border-r border-border/30 overflow-hidden">
              <CodeMirrorEditor
                value={content}
                onChange={handleContentChange}
                className="h-full"
              />
            </div>
            <div className="flex-1 overflow-hidden bg-[hsl(var(--surface-2))]">
              <MarkdownPreview content={content} className="h-full" />
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="border-t border-border/30 px-8 py-3 text-sm text-muted-foreground flex items-center justify-between bg-[hsl(var(--surface-2))]">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary font-medium">{note.wordCount} words</span>
          <span className="px-3 py-1 rounded-full bg-[hsl(var(--accent-cyan)/0.2)] text-[hsl(var(--accent-cyan))] font-medium">{content.length} chars</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="capitalize px-3 py-1 rounded-full bg-[hsl(var(--accent-orange)/0.2)] text-[hsl(var(--accent-orange))] font-medium">{note.format}</span>
          <span className="flex items-center gap-2 font-medium text-[hsl(var(--accent-green))]">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent-green))] animate-pulse"></span>
            Auto-saved
          </span>
        </div>
      </div>
    </div>
  );
}
