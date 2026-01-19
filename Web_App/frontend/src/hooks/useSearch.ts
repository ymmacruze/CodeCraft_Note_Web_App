import { useState, useCallback, useMemo } from 'react';
import { useNoteStore } from '@/stores';

export function useSearch() {
  const { notes, setFilters, filters } = useNoteStore();
  const [localQuery, setLocalQuery] = useState('');

  // Debounced search
  const search = useCallback(
    (query: string) => {
      setLocalQuery(query);
      setFilters({ ...filters, query: query || undefined });
    },
    [filters, setFilters]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setLocalQuery('');
    setFilters({ ...filters, query: undefined });
  }, [filters, setFilters]);

  // Filter by tag
  const filterByTag = useCallback(
    (tag: string) => {
      const currentTags = filters.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
      setFilters({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
    },
    [filters, setFilters]
  );

  // Clear tag filter
  const clearTagFilter = useCallback(() => {
    setFilters({ ...filters, tags: undefined });
  }, [filters, setFilters]);

  // Toggle favorites filter
  const toggleFavorites = useCallback(() => {
    setFilters({
      ...filters,
      favorite: filters.favorite ? undefined : true,
    });
  }, [filters, setFilters]);

  // Toggle archived filter
  const toggleArchived = useCallback(() => {
    setFilters({
      ...filters,
      archived: filters.archived ? undefined : true,
    });
  }, [filters, setFilters]);

  // Highlighted results (for search highlighting)
  const highlightedNotes = useMemo(() => {
    if (!localQuery) return notes;

    const query = localQuery.toLowerCase();
    return notes.map((note) => ({
      ...note,
      _highlights: {
        title: highlightText(note.title, query),
        content: highlightText(note.content.substring(0, 200), query),
      },
    }));
  }, [notes, localQuery]);

  return {
    query: localQuery,
    search,
    clearSearch,
    filterByTag,
    clearTagFilter,
    toggleFavorites,
    toggleArchived,
    filters,
    notes: highlightedNotes,
  };
}

// Helper function to highlight matching text
function highlightText(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
