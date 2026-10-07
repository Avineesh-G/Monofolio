import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useLockStore } from '../../store/useLockStore';
import { exportBackup, importBackup } from '../../db/backup';
import { db } from '../../db/schema';
import { SheetCard } from '../../components/SheetCard';
import { 
  Key, 
  Zap, 
  Download, 
  Upload, 
  Database,
  Check,
  Sparkles,
  Lock,
  Shield,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const groqApiKey = useSettingsStore(state => state.groqApiKey);
  const aiModel = useSettingsStore(state => state.aiModel);
  const performanceMode = useSettingsStore(state => state.performanceMode);
  
  const setGroqApiKey = useSettingsStore(state => state.setGroqApiKey);
  const setAiModel = useSettingsStore(state => state.setAiModel);
  const setPerformanceMode = useSettingsStore(state => state.setPerformanceMode);

  const pin = useLockStore(state => state.pin);
  const lockTimeoutMs = useLockStore(state => state.lockTimeoutMs);
  const setPin = useLockStore(state => state.setPin);
  const removePin = useLockStore(state => state.removePin);
  const setLockTimeout = useLockStore(state => state.setLockTimeout);
  const lock = useLockStore(state => state.lock);

  const seedDemoData = useLibraryStore(state => state.seedDemoData);
  const refreshAll = useLibraryStore(state => state.refreshAll);

  const [inputKey, setInputKey] = useState(groqApiKey);
  const [isSaved, setIsSaved] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  // PIN modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Clear cache / wipe modal
  const [confirmWipeOpen, setConfirmWipeOpen] = useState(false);

  const handleSaveApiKey = () => {
    setGroqApiKey(inputKey.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    await seedDemoData();
    setIsSeeding(false);
    setBackupMsg('Seeded 500 items into library!');
    setTimeout(() => setBackupMsg(''), 3000);
  };

  const handleExportBackup = async () => {
    const json = await exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyVault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMsg('Backup downloaded successfully');
    setTimeout(() => setBackupMsg(''), 3000);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await importBackup(text);
      await refreshAll();
      setBackupMsg(`Imported ${res.count} records successfully`);
      setTimeout(() => setBackupMsg(''), 3000);
    } catch {
      setBackupMsg('Failed to parse backup file');
      setTimeout(() => setBackupMsg(''), 3000);
    }
  };

  const handleSetNewPin = () => {
    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    setPin(newPin);
    setIsPinModalOpen(false);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setBackupMsg('Security PIN configured successfully');
    setTimeout(() => setBackupMsg(''), 3000);
  };

  const handleClearCache = async () => {
    await db.analyses.clear();
    setBackupMsg('Analysis cache cleared (0 API cache entries)');
    setTimeout(() => setBackupMsg(''), 3000);
  };

  const handleWipeDatabase = async () => {
    await db.transaction('rw', [db.semesters, db.subjects, db.topics, db.items, db.analyses, db.quizzes], async () => {
      await Promise.all([
        db.semesters.clear(),
        db.subjects.clear(),
        db.topics.clear(),
        db.items.clear(),
        db.analyses.clear(),
        db.quizzes.clear(),
      ]);
    });
    await refreshAll();
    setConfirmWipeOpen(false);
    setBackupMsg('All study data wiped clean');
    setTimeout(() => setBackupMsg(''), 3000);
  };

  return (
    <div className="h-full flex flex-col px-5 pt-6 pb-20 overflow-y-auto scroll-container space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Settings & Security</h1>
        <p className="text-xs text-text-secondary">App lock, AI keys, performance mode & vault backup</p>
      </div>

      {backupMsg && (
        <div className="p-3 rounded-xl bg-accent/20 border border-accent/40 text-xs font-semibold text-accent text-center animate-in fade-in">
          {backupMsg}
        </div>
      )}

      {/* App Lock & Security */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-primary">
            <Lock size={16} className="text-purple-400" />
            <h2 className="text-sm font-semibold">Vault App Lock</h2>
          </div>
          {pin ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              PIN Protected
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-text-muted">
              Disabled
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Lock StudyVault with a PIN on cold start and automatically when backgrounded.
        </p>

        {pin ? (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-border-subtle text-xs font-medium text-text-primary"
              >
                Change PIN
              </button>
              <button
                onClick={removePin}
                className="py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium"
              >
                Disable Lock
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">Auto-Lock When Backgrounded</label>
              <select
                value={lockTimeoutMs}
                onChange={(e) => setLockTimeout(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="0">Immediately upon backgrounding</option>
                <option value="60000">After 1 minute</option>
                <option value="300000">After 5 minutes</option>
                <option value="900000">After 15 minutes</option>
              </select>
            </div>

            <button
              onClick={lock}
              className="w-full py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-semibold active:scale-98 transition-all"
            >
              Lock Vault Now
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs active:scale-98 transition-all"
          >
            Enable PIN Lock
          </button>
        )}
      </div>

      {/* Groq AI Key */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
        <div className="flex items-center gap-2 text-text-primary">
          <Key size={16} className="text-accent" />
          <h2 className="text-sm font-semibold">Groq AI Provider</h2>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          StudyVault uses Groq free-tier fast inference for the Blunt AI Coach. Your key is stored securely on-device.
        </p>
        
        <div className="space-y-2">
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-xs text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleSaveApiKey}
            className="w-full py-2 rounded-lg bg-accent text-white text-xs font-medium flex items-center justify-center gap-1.5 active:scale-98 transition-all"
          >
            {isSaved ? <Check size={14} /> : null}
            <span>{isSaved ? 'Saved Securely' : 'Save Groq Key'}</span>
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-text-muted mb-1">Model Selection</label>
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
            <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
            <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
          </select>
        </div>
      </div>

      {/* Performance Mode */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-primary">
            <Zap size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold">Performance Mode</h2>
          </div>
          <button
            onClick={() => setPerformanceMode(!performanceMode)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              performanceMode ? 'bg-accent' : 'bg-bg-tertiary border border-border-subtle'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                performanceMode ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Disables blurs, shadows, and non-essential transitions to guarantee steady 60fps on low-end Android devices.
        </p>
      </div>

      {/* Privacy Notice Card */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
          <Shield size={16} className="text-emerald-400" />
          <span>Privacy & Local-First Architecture</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          All study materials, flashcards, notes, and mastery metrics stay strictly on your device. Extracted text leaves the device only when you explicitly request an AI Coach analysis from Groq. Excluded from cloud OS auto-backup.
        </p>
      </div>

      {/* Developer Benchmark & Seed */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
        <div className="flex items-center gap-2 text-text-primary">
          <Database size={16} className="text-blue-400" />
          <h2 className="text-sm font-semibold">Performance Benchmark</h2>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Seed 500 items to verify 60fps TanStack Virtual scrolling and instantaneous search responsiveness.
        </p>

        <button
          onClick={handleSeedData}
          disabled={isSeeding}
          className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-border-subtle text-xs font-medium text-text-primary flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          <Sparkles size={14} className="text-accent" />
          <span>{isSeeding ? 'Seeding 500 items...' : 'Seed 500 Items into Library'}</span>
        </button>
      </div>

      {/* Backup & Restore */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Local Backup & Migration</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-text-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Export Backup</span>
          </button>

          <label className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-text-primary flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-center">
            <Upload size={14} />
            <span>Import Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Danger Zone: Cache & Reset */}
      <div className="p-4 rounded-2xl bg-bg-card border border-rose-500/20 space-y-3">
        <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Vault Maintenance</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleClearCache}
            className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Clear AI Cache
          </button>
          <button
            onClick={() => setConfirmWipeOpen(true)}
            className="py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 size={13} />
            <span>Wipe Vault Data</span>
          </button>
        </div>
      </div>

      {/* Set PIN Modal */}
      <SheetCard
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        title="Set Security PIN"
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">New PIN (4-6 digits)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-center text-base tracking-widest text-text-primary focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm PIN"
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-center text-base tracking-widest text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {pinError && <p className="text-xs text-rose-400 text-center">{pinError}</p>}

          <button
            onClick={handleSetNewPin}
            className="w-full py-2.5 rounded-lg bg-accent text-white font-semibold text-sm active:scale-98 transition-all"
          >
            Save PIN Lock
          </button>
        </div>
      </SheetCard>

      {/* Wipe Confirmation Modal */}
      <SheetCard
        isOpen={confirmWipeOpen}
        onClose={() => setConfirmWipeOpen(false)}
        title="Wipe Entire Vault?"
      >
        <div className="space-y-3.5 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            This will permanently delete all semesters, subjects, uploaded documents, typed notes, and Leitner flashcards stored on this device.
          </p>
          <button
            onClick={handleWipeDatabase}
            className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs active:scale-98 transition-all"
          >
            Confirm & Wipe All Data
          </button>
        </div>
      </SheetCard>
    </div>
  );
};
