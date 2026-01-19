// Note file formats supported by the application
export type FileFormat =
  | 'markdown'
  | 'plaintext'
  | 'html'
  | 'json';

// Note metadata interface
export interface NoteMetadata {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  favorite: boolean;
  archived: boolean;
  pinned: boolean;
  format: FileFormat;
  wordCount: number;
  folderId?: string;
  color?: string;
}

// Note content interface
export interface NoteContent {
  id: string;
  content: string;
  version: number;
}

// Full note interface
export interface Note extends NoteMetadata {
  content: string;
}

// Note creation input
export interface CreateNoteInput {
  title?: string;
  content?: string;
  format?: FileFormat;
  tags?: string[];
  folderId?: string;
}

// Note update input
export interface UpdateNoteInput {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  favorite?: boolean;
  archived?: boolean;
  pinned?: boolean;
  folderId?: string;
  color?: string;
}

// Folder interface
export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
}

// Tag interface
export interface Tag {
  id: string;
  name: string;
  color?: string;
  count: number;
}

// Search filters
export interface SearchFilters {
  query?: string;
  tags?: string[];
  format?: FileFormat;
  favorite?: boolean;
  archived?: boolean;
  folderId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Sort options
export type SortField = 'title' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}
