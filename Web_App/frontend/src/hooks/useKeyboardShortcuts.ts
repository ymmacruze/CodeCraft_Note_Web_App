import { useEffect, useCallback, useRef } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if typing in an input or textarea (unless it's a global shortcut)
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      for (const shortcut of shortcutsRef.current) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch = !!shortcut.shift === event.shiftKey;
        const altMatch = !!shortcut.alt === event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          // Allow Ctrl+S even in inputs
          if (isInput && !(shortcut.ctrl && shortcut.key.toLowerCase() === 's')) {
            continue;
          }
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Default shortcuts for the app
export const defaultShortcuts = {
  newNote: { key: 'n', ctrl: true, description: 'Create new note' },
  save: { key: 's', ctrl: true, description: 'Save note' },
  search: { key: 'k', ctrl: true, description: 'Open search' },
  delete: { key: 'Delete', shift: true, description: 'Delete note' },
  toggleSidebar: { key: 'b', ctrl: true, description: 'Toggle sidebar' },
  togglePreview: { key: 'p', ctrl: true, shift: true, description: 'Toggle preview' },
  focusMode: { key: 'f', ctrl: true, shift: true, description: 'Toggle focus mode' },
};
