import type { Note } from '@/types';
import type { ExportFormat, ExportOptions } from '@/types/export.types';

export type { ExportFormat, ExportOptions };

/**
 * Convert note content to HTML
 */
function markdownToHtml(markdown: string): string {
  // Basic markdown to HTML conversion
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Wrap in paragraphs if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }

  return html;
}

/**
 * Generate HTML document from note
 */
function generateHtmlDocument(note: Note): string {
  const htmlContent = markdownToHtml(note.content);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${note.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3 { margin-top: 1.5rem; }
    code {
      background: #f4f4f4;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'SF Mono', Monaco, monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      margin: 1rem 0;
      padding-left: 1rem;
      color: #666;
    }
    a { color: #0066cc; }
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 2rem 0;
    }
    .meta {
      color: #666;
      font-size: 0.875rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
  </style>
</head>
<body>
  <article>
    <h1>${note.title}</h1>
    <div class="meta">
      <p>Created: ${new Date(note.createdAt).toLocaleDateString()}</p>
      <p>Last modified: ${new Date(note.updatedAt).toLocaleDateString()}</p>
      ${note.tags.length > 0 ? `<p>Tags: ${note.tags.join(', ')}</p>` : ''}
    </div>
    <div class="content">
      ${htmlContent}
    </div>
  </article>
</body>
</html>`;
}

/**
 * Export a note to the specified format
 */
export function exportNote(note: Note, format: ExportFormat, options?: ExportOptions): string {
  const includeMetadata = options?.includeMetadata ?? true;

  switch (format) {
    case 'md':
    case 'markdown': {
      let content = '';
      if (includeMetadata) {
        content += `# ${note.title}\n\n`;
        content += `> Created: ${new Date(note.createdAt).toLocaleDateString()}\n`;
        content += `> Updated: ${new Date(note.updatedAt).toLocaleDateString()}\n`;
        if (note.tags.length > 0) {
          content += `> Tags: ${note.tags.join(', ')}\n`;
        }
        content += '\n---\n\n';
      }
      content += note.content;
      return content;
    }

    case 'txt':
    case 'text': {
      let content = '';
      if (includeMetadata) {
        content += `${note.title}\n`;
        content += `${'='.repeat(note.title.length)}\n\n`;
        content += `Created: ${new Date(note.createdAt).toLocaleDateString()}\n`;
        content += `Updated: ${new Date(note.updatedAt).toLocaleDateString()}\n`;
        if (note.tags.length > 0) {
          content += `Tags: ${note.tags.join(', ')}\n`;
        }
        content += '\n---\n\n';
      }
      // Strip markdown formatting for plain text
      const plainText = note.content
        .replace(/[#*`~\[\]()>]/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '[image]')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
      content += plainText;
      return content;
    }

    case 'html': {
      return generateHtmlDocument(note);
    }

    case 'json': {
      const exportData = {
        title: note.title,
        content: note.content,
        ...(includeMetadata && {
          id: note.id,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
          tags: note.tags,
          favorite: note.favorite,
          pinned: note.pinned,
          archived: note.archived,
        }),
      };
      return JSON.stringify(exportData, null, 2);
    }

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'md':
    case 'markdown':
      return 'md';
    case 'txt':
    case 'text':
      return 'txt';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    default:
      return 'txt';
  }
}

/**
 * Get MIME type for format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'md':
    case 'markdown':
      return 'text/markdown';
    case 'txt':
    case 'text':
      return 'text/plain';
    case 'html':
      return 'text/html';
    case 'json':
      return 'application/json';
    default:
      return 'text/plain';
  }
}

/**
 * Download note as file
 */
export function downloadNote(note: Note, format: ExportFormat, options?: ExportOptions): void {
  const content = exportNote(note, format, options);
  const mimeType = getMimeType(format);
  const extension = getFileExtension(format);
  
  // Create filename from note title
  const safeTitle = note.title
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50) || 'untitled';
  
  const filename = `${safeTitle}.${extension}`;
  
  // Create blob and download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export multiple notes as a single JSON file
 */
export function exportNotesAsJson(notes: Note[]): void {
  const data = {
    exportDate: new Date().toISOString(),
    noteCount: notes.length,
    notes: notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      tags: note.tags,
      favorite: note.favorite,
      pinned: note.pinned,
      archived: note.archived,
    })),
  };
  
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
