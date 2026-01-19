import { useEffect, useRef, useCallback } from 'react';
import { useNoteStore } from '@/stores';
import type { UpdateNoteInput } from '@/types';

interface UseAutoSaveOptions {
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave(
  noteId: string | undefined,
  content: string,
  title: string,
  options: UseAutoSaveOptions = {}
) {
  const { delay = 2000, enabled = true } = options;
  const { updateNote } = useNoteStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef({ content, title });
  const isSavingRef = useRef(false);

  const save = useCallback(async () => {
    if (!noteId || isSavingRef.current) return;

    const hasChanges =
      content !== lastSavedRef.current.content ||
      title !== lastSavedRef.current.title;

    if (!hasChanges) return;

    isSavingRef.current = true;
    try {
      const input: UpdateNoteInput = { id: noteId };
      if (content !== lastSavedRef.current.content) {
        input.content = content;
      }
      if (title !== lastSavedRef.current.title) {
        input.title = title;
      }

      await updateNote(input);
      lastSavedRef.current = { content, title };
    } finally {
      isSavingRef.current = false;
    }
  }, [noteId, content, title, updateNote]);

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled || !noteId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, title, delay, enabled, noteId, save]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Immediate save on unmount
      save();
    };
  }, [save]);

  // Force save function
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return save();
  }, [save]);

  return {
    forceSave,
    isSaving: isSavingRef.current,
  };
}
