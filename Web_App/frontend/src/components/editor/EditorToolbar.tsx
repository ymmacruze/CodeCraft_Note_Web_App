import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Link,
  Image,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Table,
  Eye,
  Edit,
  Columns,
  Maximize,
} from 'lucide-react';
import { Button, Tooltip } from '@/components/ui';
import { useUIStore } from '@/stores';

interface EditorToolbarProps {
  onInsert: (text: string, wrap?: boolean) => void;
}

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  action: () => void;
  shortcut?: string;
}

export function EditorToolbar({ onInsert }: EditorToolbarProps) {
  const { editorMode, setEditorMode, focusMode, toggleFocusMode } = useUIStore();

  const formatButtons: ToolbarButton[] = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => onInsert('**', true),
      shortcut: 'Ctrl+B',
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => onInsert('*', true),
      shortcut: 'Ctrl+I',
    },
    {
      icon: Strikethrough,
      label: 'Strikethrough',
      action: () => onInsert('~~', true),
    },
    {
      icon: Code,
      label: 'Inline Code',
      action: () => onInsert('`', true),
    },
  ];

  const insertButtons: ToolbarButton[] = [
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => onInsert('# '),
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => onInsert('## '),
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => onInsert('### '),
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => onInsert('- '),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => onInsert('1. '),
    },
    {
      icon: CheckSquare,
      label: 'Task List',
      action: () => onInsert('- [ ] '),
    },
    {
      icon: Quote,
      label: 'Blockquote',
      action: () => onInsert('> '),
    },
    {
      icon: Minus,
      label: 'Horizontal Rule',
      action: () => onInsert('\n---\n'),
    },
    {
      icon: Link,
      label: 'Link',
      action: () => onInsert('[text](url)'),
    },
    {
      icon: Image,
      label: 'Image',
      action: () => onInsert('![alt text](image-url)'),
    },
    {
      icon: Table,
      label: 'Table',
      action: () => onInsert('\n| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |\n'),
    },
  ];

  return (
    <div className="flex items-center justify-between border-b border-border/30 bg-[hsl(var(--surface-2))] px-6 py-3">
      {/* Format buttons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[hsl(var(--surface-3))] rounded-xl p-1.5">
          {formatButtons.map((button, index) => (
            <Tooltip key={index} content={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-lg hover:bg-primary/20 hover:text-primary text-muted-foreground" 
                onClick={button.action}
              >
                <button.icon className="h-5 w-5" />
              </Button>
            </Tooltip>
          ))}
        </div>

        <div className="w-px h-8 bg-border/30 mx-2" />

        <div className="flex items-center gap-1">
          {insertButtons.map((button, index) => (
            <Tooltip key={index} content={button.label}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-lg hover:bg-[hsl(var(--accent-cyan)/0.2)] hover:text-[hsl(var(--accent-cyan))] text-muted-foreground" 
                onClick={button.action}
              >
                <button.icon className="h-5 w-5" />
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* View mode buttons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[hsl(var(--surface-3))] rounded-xl p-1.5">
          <Tooltip content="Edit mode">
            <Button
              variant={editorMode === 'edit' ? 'secondary' : 'ghost'}
              size="icon"
              className={`h-10 w-10 rounded-lg ${editorMode === 'edit' ? 'bg-primary/20 text-primary shadow-sm' : 'hover:bg-[hsl(var(--surface-hover))] text-muted-foreground'}`}
              onClick={() => setEditorMode('edit')}
            >
              <Edit className="h-5 w-5" />
            </Button>
          </Tooltip>

          <Tooltip content="Split view">
            <Button
              variant={editorMode === 'split' ? 'secondary' : 'ghost'}
              size="icon"
              className={`h-10 w-10 rounded-lg ${editorMode === 'split' ? 'bg-primary/20 text-primary shadow-sm' : 'hover:bg-[hsl(var(--surface-hover))] text-muted-foreground'}`}
              onClick={() => setEditorMode('split')}
            >
              <Columns className="h-5 w-5" />
            </Button>
          </Tooltip>

          <Tooltip content="Preview mode">
            <Button
              variant={editorMode === 'preview' ? 'secondary' : 'ghost'}
              size="icon"
              className={`h-10 w-10 rounded-lg ${editorMode === 'preview' ? 'bg-primary/20 text-primary shadow-sm' : 'hover:bg-[hsl(var(--surface-hover))] text-muted-foreground'}`}
              onClick={() => setEditorMode('preview')}
            >
              <Eye className="h-5 w-5" />
            </Button>
          </Tooltip>
        </div>

        <div className="w-px h-8 bg-border/30 mx-2" />

        <Tooltip content="Focus mode (Ctrl+Shift+F)">
          <Button
            variant={focusMode ? 'secondary' : 'ghost'}
            size="icon"
            className={`h-10 w-10 rounded-lg ${focusMode ? 'bg-[hsl(var(--accent-yellow)/0.3)] text-[hsl(var(--accent-yellow))]' : 'hover:bg-[hsl(var(--accent-yellow)/0.2)] text-muted-foreground'}`}
            onClick={toggleFocusMode}
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
