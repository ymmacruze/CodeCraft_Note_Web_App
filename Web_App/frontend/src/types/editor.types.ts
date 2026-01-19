// Editor mode
export type EditorMode = 'edit' | 'preview' | 'split';

// Editor state
export interface EditorState {
  noteId: string | null;
  mode: EditorMode;
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;
}

// Editor toolbar action
export interface ToolbarAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  disabled?: boolean;
}

// Editor configuration
export interface EditorConfig {
  autoSave: boolean;
  autoSaveDelay: number;
  lineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  tabSize: number;
}

// Default editor configuration
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  autoSave: true,
  autoSaveDelay: 2000,
  lineNumbers: false,
  wordWrap: true,
  fontSize: 14,
  tabSize: 2,
};
