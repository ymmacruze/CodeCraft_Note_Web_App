import Dexie, { type EntityTable } from 'dexie';
import type { Note, Folder, Tag } from '@/types';

// Database schema
interface NotesDatabase extends Dexie {
  notes: EntityTable<Note, 'id'>;
  folders: EntityTable<Folder, 'id'>;
  tags: EntityTable<Tag, 'id'>;
}

// Create database instance
const db = new Dexie('NoteTakingApp') as NotesDatabase;

// Define schema
db.version(1).stores({
  notes: 'id, title, createdAt, updatedAt, format, favorite, archived, pinned, folderId, *tags',
  folders: 'id, name, parentId, createdAt',
  tags: 'id, name, count',
});

export { db };
export type { NotesDatabase };
