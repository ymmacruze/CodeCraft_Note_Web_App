import type { FileFormat } from './note.types';

// Export format options
export type ExportFormat = 'markdown' | 'md' | 'txt' | 'text' | 'html' | 'json';

// Export options
export interface ExportOptions {
  format?: ExportFormat;
  includeMetadata?: boolean;
  fileName?: string;
}

// Export result
export interface ExportResult {
  success: boolean;
  fileName: string;
  blob?: Blob;
  error?: string;
}

// Format conversion mapping
export const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  markdown: '.md',
  md: '.md',
  txt: '.txt',
  text: '.txt',
  html: '.html',
  json: '.json',
};

// MIME types for export
export const FORMAT_MIME_TYPES: Record<ExportFormat, string> = {
  markdown: 'text/markdown',
  md: 'text/markdown',
  txt: 'text/plain',
  text: 'text/plain',
  html: 'text/html',
  json: 'application/json',
};

// File format to export format mapping
export const FILE_FORMAT_TO_EXPORT: Record<FileFormat, ExportFormat> = {
  markdown: 'markdown',
  plaintext: 'txt',
  html: 'html',
  json: 'json',
};
