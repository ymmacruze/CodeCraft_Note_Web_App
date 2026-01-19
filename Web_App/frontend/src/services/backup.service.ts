import type { Note } from '@/types';

/**
 * Backup settings interface
 */
export interface BackupSettings {
  autoBackupEnabled: boolean;
  autoBackupInterval: 'daily' | 'weekly' | 'monthly';
  lastBackupDate: string | null;
  backupLocation: 'download' | 'filesystem';
  maxBackups: number;
}

/**
 * Default backup settings
 */
export const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  autoBackupEnabled: false,
  autoBackupInterval: 'weekly',
  lastBackupDate: null,
  backupLocation: 'download',
  maxBackups: 5,
};

/**
 * Storage key for backup settings
 */
const BACKUP_SETTINGS_KEY = 'codecraft-backup-settings';
const LAST_BACKUP_KEY = 'codecraft-last-backup';

/**
 * Get backup settings from localStorage
 */
export function getBackupSettings(): BackupSettings {
  try {
    const stored = localStorage.getItem(BACKUP_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_BACKUP_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load backup settings:', error);
  }
  return DEFAULT_BACKUP_SETTINGS;
}

/**
 * Save backup settings to localStorage
 */
export function saveBackupSettings(settings: Partial<BackupSettings>): void {
  try {
    const current = getBackupSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(BACKUP_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save backup settings:', error);
  }
}

/**
 * Get the last backup timestamp
 */
export function getLastBackupDate(): Date | null {
  try {
    const stored = localStorage.getItem(LAST_BACKUP_KEY);
    if (stored) {
      return new Date(stored);
    }
  } catch (error) {
    console.error('Failed to get last backup date:', error);
  }
  return null;
}

/**
 * Update the last backup timestamp
 */
export function updateLastBackupDate(): void {
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
  saveBackupSettings({ lastBackupDate: new Date().toISOString() });
}

/**
 * Check if backup is due based on settings
 */
export function isBackupDue(): boolean {
  const settings = getBackupSettings();
  
  if (!settings.autoBackupEnabled) {
    return false;
  }
  
  const lastBackup = getLastBackupDate();
  if (!lastBackup) {
    return true; // Never backed up
  }
  
  const now = new Date();
  const daysSinceBackup = Math.floor(
    (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  switch (settings.autoBackupInterval) {
    case 'daily':
      return daysSinceBackup >= 1;
    case 'weekly':
      return daysSinceBackup >= 7;
    case 'monthly':
      return daysSinceBackup >= 30;
    default:
      return false;
  }
}

/**
 * Create a backup filename with timestamp
 */
export function generateBackupFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `codecraft-backup-${timestamp}-${time}.json`;
}

/**
 * Create backup data structure
 */
export function createBackupData(notes: Note[]): object {
  return {
    version: '1.0.0',
    appName: 'CodeCraft Notes',
    exportDate: new Date().toISOString(),
    noteCount: notes.length,
    notes: notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
      updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt,
      tags: note.tags,
      favorite: note.favorite,
      pinned: note.pinned,
      archived: note.archived,
      format: note.format,
      wordCount: note.wordCount,
    })),
    metadata: {
      totalWords: notes.reduce((sum, note) => sum + note.wordCount, 0),
      totalTags: [...new Set(notes.flatMap(n => n.tags))].length,
      favoriteCount: notes.filter(n => n.favorite).length,
      archivedCount: notes.filter(n => n.archived).length,
    },
  };
}

/**
 * Download backup file
 */
export function downloadBackup(notes: Note[]): void {
  const backupData = createBackupData(notes);
  const content = JSON.stringify(backupData, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = generateBackupFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  updateLastBackupDate();
}

/**
 * Save backup using File System Access API (if supported)
 */
export async function saveBackupToFileSystem(notes: Note[]): Promise<boolean> {
  // Check if File System Access API is supported
  if (!('showSaveFilePicker' in window)) {
    console.warn('File System Access API not supported, falling back to download');
    downloadBackup(notes);
    return true;
  }
  
  try {
    const backupData = createBackupData(notes);
    const content = JSON.stringify(backupData, null, 2);
    
    const handle = await (window as Window & { showSaveFilePicker: (options: object) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
      suggestedName: generateBackupFilename(),
      types: [
        {
          description: 'JSON Backup Files',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
    });
    
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    
    updateLastBackupDate();
    return true;
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to save backup:', error);
      throw error;
    }
    return false;
  }
}

/**
 * Open file picker for importing
 */
export async function openFilePickerForImport(): Promise<File[] | null> {
  // Check if File System Access API is supported
  if ('showOpenFilePicker' in window) {
    try {
      const handles = await (window as Window & { showOpenFilePicker: (options: object) => Promise<FileSystemFileHandle[]> }).showOpenFilePicker({
        multiple: true,
        types: [
          {
            description: 'Note Files',
            accept: {
              'text/markdown': ['.md', '.markdown'],
              'text/plain': ['.txt'],
              'application/json': ['.json'],
            },
          },
        ],
      });
      
      const files: File[] = [];
      for (const handle of handles) {
        const file = await handle.getFile();
        files.push(file);
      }
      return files;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null; // User cancelled
      }
      throw error;
    }
  }
  
  // Fallback to traditional file input
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.md,.markdown,.txt,.json';
    
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      resolve(files.length > 0 ? files : null);
    };
    
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/**
 * Save single note to file system
 */
export async function saveNoteToFileSystem(
  note: Note,
  format: 'md' | 'txt' | 'json' | 'html' = 'md'
): Promise<boolean> {
  const { exportNote, getMimeType, getFileExtension } = await import('./export.service');
  
  const content = exportNote(note, format, { includeMetadata: true });
  const extension = getFileExtension(format);
  const mimeType = getMimeType(format);
  
  const safeTitle = note.title
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50) || 'untitled';
  
  // Check if File System Access API is supported
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as Window & { showSaveFilePicker: (options: object) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
        suggestedName: `${safeTitle}.${extension}`,
        types: [
          {
            description: `${format.toUpperCase()} Files`,
            accept: {
              [mimeType]: [`.${extension}`],
            },
          },
        ],
      });
      
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return false; // User cancelled
      }
      throw error;
    }
  }
  
  // Fallback to download
  const { downloadNote } = await import('./export.service');
  downloadNote(note, format, { includeMetadata: true });
  return true;
}

/**
 * Perform auto-backup if due
 */
export async function performAutoBackupIfDue(notes: Note[]): Promise<boolean> {
  if (!isBackupDue()) {
    return false;
  }
  
  const settings = getBackupSettings();
  
  try {
    if (settings.backupLocation === 'filesystem' && 'showSaveFilePicker' in window) {
      // For filesystem, we need user interaction, so just trigger notification
      return false;
    }
    
    // For download location, we can auto-download
    downloadBackup(notes);
    return true;
  } catch (error) {
    console.error('Auto-backup failed:', error);
    return false;
  }
}

/**
 * Get backup statistics
 */
export function getBackupStats(notes: Note[]): {
  totalNotes: number;
  totalWords: number;
  estimatedSize: string;
  lastBackup: string | null;
} {
  const backupData = createBackupData(notes);
  const jsonSize = JSON.stringify(backupData).length;
  
  // Convert to human-readable size
  let sizeString: string;
  if (jsonSize < 1024) {
    sizeString = `${jsonSize} B`;
  } else if (jsonSize < 1024 * 1024) {
    sizeString = `${(jsonSize / 1024).toFixed(1)} KB`;
  } else {
    sizeString = `${(jsonSize / (1024 * 1024)).toFixed(2)} MB`;
  }
  
  const lastBackup = getLastBackupDate();
  
  return {
    totalNotes: notes.length,
    totalWords: notes.reduce((sum, note) => sum + note.wordCount, 0),
    estimatedSize: sizeString,
    lastBackup: lastBackup?.toLocaleString() || null,
  };
}
