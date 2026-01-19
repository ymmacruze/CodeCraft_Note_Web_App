import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Trash2, Download, Database, Sparkles, 
  Upload, HardDrive, Clock, FolderOpen, RefreshCw, CheckCircle, ArrowLeft 
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useUIStore, useNoteStore } from '@/stores';
import { 
  getBackupSettings, 
  saveBackupSettings, 
  downloadBackup, 
  saveBackupToFileSystem,
  getBackupStats,
  type BackupSettings 
} from '@/services/backup.service';

export function SettingsPage() {
  const navigate = useNavigate();
  const { setImportModalOpen, setExportModalOpen } = useUIStore();
  const { notes, deleteNote } = useNoteStore();
  const [storageUsed, setStorageUsed] = React.useState<string>('Calculating...');
  const [backupSettings, setBackupSettingsState] = React.useState<BackupSettings>(getBackupSettings());
  const [backupStats, setBackupStats] = React.useState(() => getBackupStats(notes));
  const [isBackingUp, setIsBackingUp] = React.useState(false);
  const [backupSuccess, setBackupSuccess] = React.useState(false);

  // Update backup stats when notes change
  React.useEffect(() => {
    setBackupStats(getBackupStats(notes));
  }, [notes]);

  // Calculate storage usage
  React.useEffect(() => {
    const calculateStorage = async () => {
      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          const usedMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
          const quotaMB = ((estimate.quota || 0) / (1024 * 1024)).toFixed(0);
          setStorageUsed(`${usedMB} MB / ${quotaMB} MB`);
        } else {
          setStorageUsed('Not available');
        }
      } catch {
        setStorageUsed('Unable to calculate');
      }
    };
    calculateStorage();
  }, [notes]);

  const handleBackup = async (useFilePicker: boolean) => {
    setIsBackingUp(true);
    setBackupSuccess(false);
    try {
      if (useFilePicker) {
        await saveBackupToFileSystem(notes);
      } else {
        downloadBackup(notes);
      }
      setBackupStats(getBackupStats(notes));
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    } catch (error) {
      console.error('Backup failed:', error);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleBackupSettingChange = (key: keyof BackupSettings, value: boolean | number | string) => {
    const newSettings = { ...backupSettings, [key]: value };
    setBackupSettingsState(newSettings);
    saveBackupSettings(newSettings);
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to delete ALL notes? This cannot be undone.')) {
      if (window.confirm('This will permanently delete all your notes. Are you absolutely sure?')) {
        for (const note of notes) {
          await deleteNote(note.id);
        }
      }
    }
  };

  return (
    <div className="h-full overflow-auto bg-[hsl(var(--surface-1))]">
      <div className="max-w-3xl mx-auto p-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="h-12 w-12 rounded-xl bg-[hsl(var(--surface-3))] border-white/10 hover:bg-[hsl(var(--surface-hover))] text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-pink))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent-purple)/0.3)]">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] bg-clip-text text-transparent">Settings</h1>
            <p className="text-base text-muted-foreground mt-1">Customize your experience</p>
          </div>
        </div>

        {/* Storage */}
        <Card className="p-8 bg-[hsl(var(--surface-2))] border-white/5">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-foreground">
            <span className="h-8 w-8 rounded-xl bg-[hsl(var(--accent-cyan)/0.2)] flex items-center justify-center text-base">💾</span>
            Storage
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 rounded-xl bg-[hsl(var(--surface-3))]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[hsl(var(--accent-purple)/0.2)] flex items-center justify-center">
                  <Database className="h-6 w-6 text-[hsl(var(--accent-purple))]" />
                </div>
                <span className="text-base font-medium text-foreground">Storage Used</span>
              </div>
              <span className="text-base font-semibold px-4 py-2 rounded-full bg-[hsl(var(--accent-cyan)/0.2)] text-[hsl(var(--accent-cyan))]">{storageUsed}</span>
            </div>

            <div className="flex items-center justify-between p-5 rounded-xl bg-[hsl(var(--surface-3))]">
              <span className="text-base font-medium text-foreground">Total Notes</span>
              <span className="text-base font-semibold px-4 py-2 rounded-full bg-[hsl(var(--accent-purple)/0.2)] text-[hsl(var(--accent-purple))]">{notes.length}</span>
            </div>
          </div>
        </Card>

        {/* Backup & Sync */}
        <Card className="p-8 bg-[hsl(var(--surface-2))] border-white/5">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-foreground">
            <span className="h-8 w-8 rounded-xl bg-[hsl(var(--accent-green)/0.2)] flex items-center justify-center text-base">🔄</span>
            Backup & Sync
          </h2>
          
          <div className="space-y-5">
            {/* Backup Status */}
            <div className="p-6 rounded-xl bg-[hsl(var(--surface-3))]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--accent-green))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent-cyan)/0.3)]">
                    <HardDrive className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">Local Backup</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {backupStats.lastBackup 
                        ? `Last backup: ${new Date(backupStats.lastBackup).toLocaleDateString()}`
                        : 'No backups yet'
                      }
                    </p>
                  </div>
                </div>
                {backupSuccess && (
                  <span className="flex items-center gap-2 text-sm text-[hsl(var(--accent-green))] font-medium px-4 py-2 rounded-full bg-[hsl(var(--accent-green)/0.2)]">
                    <CheckCircle className="h-5 w-5" />
                    Saved!
                  </span>
                )}
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl gap-3 bg-[hsl(var(--surface-hover))] border-white/10 hover:bg-[hsl(var(--accent-cyan)/0.2)] hover:border-[hsl(var(--accent-cyan)/0.5)] text-foreground font-medium"
                  onClick={() => handleBackup(false)}
                  disabled={isBackingUp}
                >
                  {isBackingUp ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                  Download Backup
                </Button>
                {'showSaveFilePicker' in window && (
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl gap-3 bg-[hsl(var(--surface-hover))] border-white/10 hover:bg-[hsl(var(--accent-green)/0.2)] hover:border-[hsl(var(--accent-green)/0.5)] text-foreground font-medium"
                    onClick={() => handleBackup(true)}
                    disabled={isBackingUp}
                  >
                    <FolderOpen className="h-5 w-5" />
                    Save to Folder
                  </Button>
                )}
              </div>
            </div>

            {/* Auto-backup Toggle */}
            <div className="flex items-center justify-between p-5 rounded-xl bg-[hsl(var(--surface-3))]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[hsl(var(--accent-yellow)/0.2)] flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[hsl(var(--accent-yellow))]" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">Auto-backup</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Automatically remind to backup
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={backupSettings.autoBackupEnabled}
                  onChange={(e) => handleBackupSettingChange('autoBackupEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-[hsl(var(--surface-hover))] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            {backupSettings.autoBackupEnabled && (
              <div className="flex items-center justify-between p-5 rounded-xl bg-[hsl(var(--surface-3))]">
                <span className="text-base font-medium text-foreground">Backup Interval</span>
                <select
                  value={backupSettings.autoBackupInterval}
                  onChange={(e) => handleBackupSettingChange('autoBackupInterval', e.target.value)}
                  className="px-5 py-3 rounded-xl border border-white/10 bg-[hsl(var(--surface-hover))] text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Import & Export */}
        <Card className="p-8 bg-[hsl(var(--surface-2))] border-white/5">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-foreground">
            <span className="h-8 w-8 rounded-xl bg-[hsl(var(--accent-orange)/0.2)] flex items-center justify-center text-base">📦</span>
            Import & Export
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 rounded-xl bg-[hsl(var(--accent-green)/0.1)] border border-[hsl(var(--accent-green)/0.2)]">
              <div>
                <p className="text-base font-medium text-foreground">Import Notes</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Import from Markdown, Text, or JSON files
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setImportModalOpen(true)} 
                className="h-12 px-6 gap-3 rounded-xl bg-[hsl(var(--accent-green)/0.2)] border-[hsl(var(--accent-green)/0.3)] hover:bg-[hsl(var(--accent-green)/0.3)] hover:border-[hsl(var(--accent-green)/0.5)] text-[hsl(var(--accent-green))] font-medium"
              >
                <Upload className="h-5 w-5" />
                Import
              </Button>
            </div>

            <div className="flex items-center justify-between p-5 rounded-xl bg-[hsl(var(--accent-cyan)/0.1)] border border-[hsl(var(--accent-cyan)/0.2)]">
              <div>
                <p className="text-base font-medium text-foreground">Export Notes</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Export to various formats
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setExportModalOpen(true)} 
                className="h-12 px-6 gap-3 rounded-xl bg-[hsl(var(--accent-cyan)/0.2)] border-[hsl(var(--accent-cyan)/0.3)] hover:bg-[hsl(var(--accent-cyan)/0.3)] hover:border-[hsl(var(--accent-cyan)/0.5)] text-[hsl(var(--accent-cyan))] font-medium"
              >
                <Download className="h-5 w-5" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-8 bg-[hsl(var(--surface-2))] border-white/5">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-foreground">
            <span className="h-8 w-8 rounded-xl bg-destructive/20 flex items-center justify-center text-base">⚠️</span>
            Danger Zone
          </h2>
          
          <div className="flex items-center justify-between p-5 rounded-xl bg-destructive/10 border border-destructive/30">
            <div>
              <p className="text-base font-medium text-destructive">Delete All Data</p>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete all notes. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive" onClick={handleClearAllData} className="h-12 px-6 gap-3 rounded-xl shadow-lg shadow-destructive/30 font-medium">
              <Trash2 className="h-5 w-5" />
              Delete All
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card className="p-8 bg-[hsl(var(--surface-2))] border-white/5">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-foreground">
            <span className="h-8 w-8 rounded-xl bg-[hsl(var(--accent-pink)/0.2)] flex items-center justify-center text-base">✨</span>
            About
          </h2>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-pink))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent-purple)/0.3)]">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">CodeCraft Notes</p>
                <p className="text-sm text-muted-foreground mt-0.5">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              A modern, local-first note-taking app with Markdown support. 
              Built with React, TypeScript, and IndexedDB. All your notes are 
              stored locally on your device for maximum privacy and speed.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
