import type { Note } from '@/types';

/**
 * Parsed note data from import
 */
export interface ImportedNote {
  title: string;
  content: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
  favorite?: boolean;
  pinned?: boolean;
  archived?: boolean;
}

/**
 * Import result with statistics
 */
export interface ImportResult {
  success: boolean;
  imported: ImportedNote[];
  errors: string[];
  totalFiles: number;
  successCount: number;
  errorCount: number;
}

/**
 * Supported import formats
 */
export type ImportFormat = 'md' | 'markdown' | 'txt' | 'text' | 'json';

/**
 * Extract title from markdown content
 */
function extractTitleFromMarkdown(content: string): { title: string; content: string } {
  const lines = content.split('\n');
  
  // Look for H1 header at the beginning
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.startsWith('# ')) {
      const title = line.substring(2).trim();
      // Remove the title line from content
      lines.splice(i, 1);
      return { title, content: lines.join('\n').trim() };
    }
  }
  
  // If no H1, use first non-empty line as title
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('---') && !line.startsWith('>')) {
      const title = line.replace(/^#+\s*/, '').substring(0, 100);
      return { title, content };
    }
  }
  
  return { title: 'Untitled Import', content };
}

/**
 * Extract tags from content (looks for #tag patterns or YAML frontmatter)
 */
function extractTags(content: string): string[] {
  const tags: Set<string> = new Set();
  
  // Check for YAML frontmatter tags
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const tagsMatch = frontmatterMatch[1].match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch) {
      tagsMatch[1].split(',').forEach(tag => {
        tags.add(tag.trim().replace(/['"]/g, ''));
      });
    }
    // Also check for YAML list format
    const yamlListMatch = frontmatterMatch[1].match(/tags:\s*\n((?:\s*-\s*.+\n?)+)/);
    if (yamlListMatch) {
      yamlListMatch[1].split('\n').forEach(line => {
        const tagMatch = line.match(/^\s*-\s*(.+)/);
        if (tagMatch) {
          tags.add(tagMatch[1].trim().replace(/['"]/g, ''));
        }
      });
    }
  }
  
  // Extract hashtags from content (excluding headers)
  const hashtagMatches = content.match(/(?:^|\s)#([a-zA-Z][a-zA-Z0-9_-]*)/g);
  if (hashtagMatches) {
    hashtagMatches.forEach(match => {
      const tag = match.trim().substring(1);
      if (tag.length > 1 && tag.length < 30) {
        tags.add(tag.toLowerCase());
      }
    });
  }
  
  return Array.from(tags).slice(0, 10); // Limit to 10 tags
}

/**
 * Parse a markdown file
 */
function parseMarkdownFile(content: string, filename: string): ImportedNote {
  // Remove frontmatter for main content
  const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  
  const { title, content: noteContent } = extractTitleFromMarkdown(contentWithoutFrontmatter);
  const tags = extractTags(content);
  
  // Use filename as fallback title
  const finalTitle = title || filename.replace(/\.(md|markdown|txt)$/i, '');
  
  return {
    title: finalTitle,
    content: noteContent,
    tags,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Parse a plain text file
 */
function parseTextFile(content: string, filename: string): ImportedNote {
  const lines = content.split('\n');
  let title = filename.replace(/\.txt$/i, '');
  let noteContent = content;
  
  // Use first line as title if it looks like a title
  if (lines.length > 0 && lines[0].trim().length < 100) {
    title = lines[0].trim();
    // Check if second line is a separator
    if (lines.length > 1 && /^[=\-]+$/.test(lines[1].trim())) {
      noteContent = lines.slice(2).join('\n').trim();
    }
  }
  
  return {
    title,
    content: noteContent,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Parse a JSON file (single note or backup)
 */
function parseJsonFile(content: string): ImportedNote[] {
  const data = JSON.parse(content);
  const notes: ImportedNote[] = [];
  
  // Check if it's a backup file with multiple notes
  if (data.notes && Array.isArray(data.notes)) {
    for (const noteData of data.notes) {
      notes.push({
        title: noteData.title || 'Untitled',
        content: noteData.content || '',
        tags: noteData.tags || [],
        createdAt: noteData.createdAt ? new Date(noteData.createdAt) : new Date(),
        updatedAt: noteData.updatedAt ? new Date(noteData.updatedAt) : new Date(),
        favorite: noteData.favorite || false,
        pinned: noteData.pinned || false,
        archived: noteData.archived || false,
      });
    }
  } else if (data.title !== undefined || data.content !== undefined) {
    // Single note
    notes.push({
      title: data.title || 'Untitled',
      content: data.content || '',
      tags: data.tags || [],
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      favorite: data.favorite || false,
      pinned: data.pinned || false,
      archived: data.archived || false,
    });
  }
  
  return notes;
}

/**
 * Detect file format from extension
 */
export function detectFormat(filename: string): ImportFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'md':
    case 'markdown':
      return 'md';
    case 'txt':
    case 'text':
      return 'txt';
    case 'json':
      return 'json';
    default:
      return null;
  }
}

/**
 * Parse a single file
 */
export function parseFile(content: string, filename: string, format?: ImportFormat): ImportedNote[] {
  const detectedFormat = format || detectFormat(filename);
  
  if (!detectedFormat) {
    throw new Error(`Unsupported file format: ${filename}`);
  }
  
  switch (detectedFormat) {
    case 'md':
    case 'markdown':
      return [parseMarkdownFile(content, filename)];
    case 'txt':
    case 'text':
      return [parseTextFile(content, filename)];
    case 'json':
      return parseJsonFile(content);
    default:
      throw new Error(`Unknown format: ${detectedFormat}`);
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
}

/**
 * Import multiple files
 */
export async function importFiles(files: FileList | File[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: [],
    errors: [],
    totalFiles: files.length,
    successCount: 0,
    errorCount: 0,
  };
  
  for (const file of Array.from(files)) {
    try {
      const content = await readFileAsText(file);
      const notes = parseFile(content, file.name);
      result.imported.push(...notes);
      result.successCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`${file.name}: ${message}`);
      result.errorCount++;
    }
  }
  
  result.success = result.errorCount === 0;
  return result;
}

/**
 * Convert imported note to full Note object
 */
export function importedNoteToNote(imported: ImportedNote): Omit<Note, 'id'> {
  return {
    title: imported.title,
    content: imported.content,
    tags: imported.tags,
    createdAt: imported.createdAt || new Date(),
    updatedAt: imported.updatedAt || new Date(),
    favorite: imported.favorite || false,
    pinned: imported.pinned || false,
    archived: imported.archived || false,
    format: 'markdown',
    wordCount: imported.content.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Validate imported data structure
 */
export function validateImportData(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Check for backup format
  if ('notes' in data && Array.isArray((data as { notes: unknown[] }).notes)) {
    return true;
  }
  
  // Check for single note format
  if ('title' in data || 'content' in data) {
    return true;
  }
  
  return false;
}
