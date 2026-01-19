import { useRef, useEffect } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection, placeholder as placeholderExt } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { searchKeymap } from '@codemirror/search';

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

// Custom highlight style for markdown
const markdownHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: 'bold', fontSize: '1.6em' },
  { tag: tags.heading2, fontWeight: 'bold', fontSize: '1.4em' },
  { tag: tags.heading3, fontWeight: 'bold', fontSize: '1.2em' },
  { tag: tags.heading4, fontWeight: 'bold', fontSize: '1.1em' },
  { tag: tags.heading5, fontWeight: 'bold' },
  { tag: tags.heading6, fontWeight: 'bold' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, color: 'hsl(var(--primary))' },
  { tag: tags.url, color: 'hsl(var(--primary))' },
  { tag: tags.monospace, fontFamily: 'monospace', backgroundColor: 'hsl(var(--muted))' },
  { tag: tags.quote, color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' },
  { tag: tags.list, color: 'hsl(var(--primary))' },
]);

// Custom theme
const customTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '17px',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  '.cm-content': {
    padding: '24px 32px',
    caretColor: 'hsl(var(--foreground))',
  },
  '.cm-line': {
    padding: '2px 4px',
    lineHeight: '1.75',
  },
  '.cm-activeLine': {
    backgroundColor: 'hsl(var(--accent) / 0.3)',
  },
  '.cm-gutters': {
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--muted-foreground))',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'hsl(var(--accent) / 0.3)',
  },
  '.cm-cursor': {
    borderLeftColor: 'hsl(var(--foreground))',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'hsl(var(--primary) / 0.2)',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'hsl(var(--primary) / 0.3)',
  },
  '.cm-placeholder': {
    color: 'hsl(var(--muted-foreground))',
  },
});

export function CodeMirrorEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  readOnly = false,
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  
  // Keep onChange ref updated
  onChangeRef.current = onChange;

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newValue = update.state.doc.toString();
        onChangeRef.current(newValue);
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        markdown({ base: markdownLanguage }),
        syntaxHighlighting(markdownHighlightStyle),
        customTheme,
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        updateListener,
        EditorView.lineWrapping,
        EditorState.readOnly.of(readOnly),
        EditorView.contentAttributes.of({ 'aria-label': 'Markdown editor' }),
        placeholderExt(placeholder),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Update content when value changes externally
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full bg-background text-foreground ${className}`}
    />
  );
}
