import { db } from './database';
import type { Note, CreateNoteInput, UpdateNoteInput, SearchFilters, SortOptions } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Count words in content
const countWords = (content: string): number => {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Notes service
export const notesService = {
  // Get all notes
  async getAll(): Promise<Note[]> {
    return await db.notes.toArray();
  },

  // Get note by ID
  async getById(id: string): Promise<Note | undefined> {
    return await db.notes.get(id);
  },

  // Create a new note
  async create(input: CreateNoteInput): Promise<Note> {
    const now = new Date();
    const note: Note = {
      id: uuidv4(),
      title: input.title || 'Untitled Note',
      content: input.content || '',
      format: input.format || 'markdown',
      tags: input.tags || [],
      folderId: input.folderId,
      createdAt: now,
      updatedAt: now,
      favorite: false,
      archived: false,
      pinned: false,
      wordCount: countWords(input.content || ''),
    };

    await db.notes.add(note);
    return note;
  },

  // Update a note
  async update(input: UpdateNoteInput): Promise<Note | undefined> {
    const note = await db.notes.get(input.id);
    if (!note) return undefined;

    const updates: Partial<Note> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updates.title = input.title;
    if (input.content !== undefined) {
      updates.content = input.content;
      updates.wordCount = countWords(input.content);
    }
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.favorite !== undefined) updates.favorite = input.favorite;
    if (input.archived !== undefined) updates.archived = input.archived;
    if (input.pinned !== undefined) updates.pinned = input.pinned;
    if (input.folderId !== undefined) updates.folderId = input.folderId;
    if (input.color !== undefined) updates.color = input.color;

    await db.notes.update(input.id, updates);
    return { ...note, ...updates };
  },

  // Delete a note
  async delete(id: string): Promise<boolean> {
    const note = await db.notes.get(id);
    if (!note) return false;
    await db.notes.delete(id);
    return true;
  },

  // Search and filter notes
  async search(filters: SearchFilters, sort?: SortOptions): Promise<Note[]> {
    let collection = db.notes.toCollection();

    // Apply filters
    let notes = await collection.toArray();

    if (filters.archived !== undefined) {
      notes = notes.filter(n => n.archived === filters.archived);
    }

    if (filters.favorite !== undefined) {
      notes = notes.filter(n => n.favorite === filters.favorite);
    }

    if (filters.format) {
      notes = notes.filter(n => n.format === filters.format);
    }

    if (filters.folderId) {
      notes = notes.filter(n => n.folderId === filters.folderId);
    }

    if (filters.tags && filters.tags.length > 0) {
      notes = notes.filter(n => 
        filters.tags!.some(tag => n.tags.includes(tag))
      );
    }

    if (filters.query) {
      const query = filters.query.toLowerCase();
      notes = notes.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      );
    }

    if (filters.dateFrom) {
      notes = notes.filter(n => n.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      notes = notes.filter(n => n.createdAt <= filters.dateTo!);
    }

    // Apply sorting
    if (sort) {
      notes.sort((a, b) => {
        let comparison = 0;
        switch (sort.field) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'createdAt':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case 'updatedAt':
            comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
            break;
        }
        return sort.direction === 'desc' ? -comparison : comparison;
      });
    } else {
      // Default sort: pinned first, then by updatedAt desc
      notes.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
    }

    return notes;
  },

  // Duplicate a note
  async duplicate(id: string): Promise<Note | undefined> {
    const note = await db.notes.get(id);
    if (!note) return undefined;

    const now = new Date();
    const duplicatedNote: Note = {
      ...note,
      id: uuidv4(),
      title: `${note.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      pinned: false,
    };

    await db.notes.add(duplicatedNote);
    return duplicatedNote;
  },

  // Get all unique tags from notes
  async getAllTags(): Promise<string[]> {
    const notes = await db.notes.toArray();
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  },

  // Get notes count
  async getCount(): Promise<number> {
    return await db.notes.count();
  },

  // Clear all notes (for testing)
  async clearAll(): Promise<void> {
    await db.notes.clear();
  },
};

export default notesService;
