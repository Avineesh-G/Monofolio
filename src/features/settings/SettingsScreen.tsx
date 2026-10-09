import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useLockStore } from '../../store/useLockStore';
import { exportBackup, importBackup } from '../../db/backup';
import { db } from '../../db/schema';
import { SheetCard } from '../../components/SheetCard';
import { SEED_PRESETS, ThemeMode } from '../../theme/colors';
import { Shape, ShapeName } from '../../theme/shapes';
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
  AlertTriangle,
  Palette,
  Sun,
  Moon,
  Laptop,
  ArrowUpRight
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();

  const {
    groqApiKey,
    aiModel,
    performanceMode,
    seedColor,
    themeMode,
    setGroqApiKey,
    setAiModel,
    setPerformanceMode,
    setSeedColor,
    setThemeMode,
  } = useSettingsStore();

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
    <div className="h-full flex flex-col px-5 pt-6 pb-28 overflow-y-auto scroll-container space-y-5 select-none bg-surface text-on-surface">
      <div>
        <h1 className="m3-headline-medium-emp text-on-surface tracking-tight">Settings & Security</h1>
        <p className="m3-body-medium text-on-surface-variant">Appearance, AI keys, performance mode & vault backup</p>
      </div>

      {backupMsg && (
        <div className="p-3 rounded-2xl bg-primary-container text-on-primary-container m3-label-large text-center border border-outline-variant/30">
          {backupMsg}
        </div>
      )}

      {/* M3 Expressive Appearance Section */}
      <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-on-surface">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="m3-title-medium-emp">Appearance & Theme</h2>
          </div>
          <button
            onClick={() => navigate('/dev/gallery')}
            className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container m3-label-medium flex items-center gap-1 hover:opacity-90"
          >
            <span>Design Gallery</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Theme Mode Segmented Buttons */}
        <div className="flex items-center bg-surface-container-lowest p-1 rounded-full border border-outline-variant/40">
          {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              className={`flex-1 py-1.5 rounded-full m3-label-medium capitalize flex items-center justify-center gap-1.5 transition-all ${
                themeMode === mode
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {mode === 'dark' && <Moon className="w-3.5 h-3.5" />}
              {mode === 'light' && <Sun className="w-3.5 h-3.5" />}
              {mode === 'system' && <Laptop className="w-3.5 h-3.5" />}
              {mode}
            </button>
          ))}
        </div>

        {/* Seed Swatches */}
        <div>
          <label className="block m3-label-medium text-on-surface-variant mb-2">
            Dynamic Seed Color (M3 Expressive Tonal Generation)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SEED_PRESETS.map((preset) => {
              const isSelected = seedColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.id}
                  onClick={() => setSeedColor(preset.hex)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-surface-container-highest ring-2 ring-primary'
                      : 'hover:bg-surface-container-high bg-surface-container-low'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <Shape
                      name={preset.shapeName as ShapeName}
                      size={36}
                      fill={preset.hex}
                    />
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white absolute drop-shadow" />
                    )}
                  </div>
                  <span className="m3-label-medium text-[11px] text-center truncate w-full text-on-surface">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Mode */}
      <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-on-surface">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="m3-title-medium-emp">Performance Mode</h2>
          </div>
          <button
            onClick={() => setPerformanceMode(!performanceMode)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              performanceMode ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant/50'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                performanceMode ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
        <p className="m3-body-medium text-on-surface-variant leading-relaxed">
          Disables blurs, shape morph loops, and spring flips to guarantee steady 60fps on mid-range and low-end Android devices.
        </p>
      </div>

      {/* App Lock & Security */}
      <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-on-surface">
            <Lock className="w-5 h-5 text-purple-400" />
            <h2 className="m3-title-medium-emp">Vault App Lock</h2>
          </div>
          {pin ? (
            <span className="m3-label-medium text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              PIN Protected
            </span>
          ) : (
            <span className="m3-label-medium text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
              Disabled
            </span>
          )}
        </div>
        <p className="m3-body-medium text-on-surface-variant leading-relaxed">
          Lock StudyVault with a PIN on cold start and automatically when backgrounded.
        </p>

        {pin ? (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface m3-label-large font-medium"
              >
                Change PIN
              </button>
              <button
                onClick={removePin}
                className="py-2.5 px-3 rounded-xl bg-error-container text-on-error-container m3-label-large font-medium"
              >
                Disable Lock
              </button>
            </div>

            <div>
              <label className="block m3-label-medium text-on-surface-variant mb-1">Auto-Lock When Backgrounded</label>
              <select
                value={lockTimeoutMs}
                onChange={(e) => setLockTimeout(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-highest text-on-surface border border-outline-variant/40 m3-body-medium focus:outline-none focus:border-primary"
              >
                <option value="0">Immediately upon backgrounding</option>
                <option value="60000">After 1 minute</option>
                <option value="300000">After 5 minutes</option>
                <option value="900000">After 15 minutes</option>
              </select>
            </div>

            <button
              onClick={lock}
              className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary-container m3-label-large font-bold active:scale-98 transition-all"
            >
              Lock Vault Now
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary m3-label-large font-bold active:scale-98 transition-all"
          >
            Enable PIN Lock
          </button>
        )}
      </div>

      {/* Groq AI Key */}
      <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-3">
        <div className="flex items-center gap-2 text-on-surface">
          <Key className="w-5 h-5 text-primary" />
          <h2 className="m3-title-medium-emp">Groq AI Provider</h2>
        </div>
        <p className="m3-body-medium text-on-surface-variant leading-relaxed">
          StudyVault uses Groq fast inference for the Blunt AI Coach. Your key is stored securely on-device.
        </p>
        
        <div className="space-y-2">
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/40 text-on-surface font-mono m3-body-medium placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSaveApiKey}
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary m3-label-large font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all"
          >
            {isSaved ? <Check className="w-4 h-4" /> : null}
            <span>{isSaved ? 'Saved Securely' : 'Save Groq Key'}</span>
          </button>
        </div>

        <div>
          <label className="block m3-label-medium text-on-surface-variant mb-1">Model Selection</label>
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-container-highest text-on-surface border border-outline-variant/40 m3-body-medium focus:outline-none focus:border-primary"
          >
            <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
            <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
            <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
          </select>
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-2">
        <div className="flex items-center gap-2 m3-title-medium-emp text-on-surface">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Privacy & Local-First Architecture</span>
        </div>
        <p className="m3-body-medium text-on-surface-variant leading-relaxed">
          All study materials, flashcards, notes, and mastery metrics stay strictly on your device. Extracted text leaves the device only when you explicitly request an AI Coach analysis from Groq. Excluded from cloud OS auto-backup.
        </p>
      </div>

      {/* Developer Benchmark & Seed */}
      <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-3">
        <div className="flex items-center gap-2 text-on-surface">
          <Database className="w-5 h-5 text-blue-400" />
          <h2 className="m3-title-medium-emp">Performance Benchmark</h2>
        </div>
        <p className="m3-body-medium text-on-surface-variant leading-relaxed">
          Seed 500 items to verify 60fps TanStack Virtual scrolling and instantaneous search responsiveness.
        </p>

        <button
          onClick={handleSeedData}
          disabled={isSeeding}
          className="w-full py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface m3-label-large font-medium flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>{isSeeding ? 'Seeding 500 items...' : 'Seed 500 Items into Library'}</span>
        </button>
      </div>

      {/* Backup & Restore */}
      <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-3">
        <h2 className="m3-title-medium-emp text-on-surface">Local Backup & Migration</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface m3-label-large font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup</span>
          </button>

          <label className="py-2.5 px-3 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface m3-label-large font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-center">
            <Upload className="w-4 h-4" />
            <span>Import Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Danger Zone: Cache & Reset */}
      <div className="p-4 rounded-3xl bg-surface-container border border-rose-500/30 space-y-3">
        <h2 className="m3-label-large font-bold text-rose-400 uppercase tracking-wider">Vault Maintenance</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleClearCache}
            className="py-2 px-3 rounded-xl bg-surface-container-highest text-on-surface-variant hover:text-on-surface m3-label-medium transition-colors"
          >
            Clear AI Cache
          </button>
          <button
            onClick={() => setConfirmWipeOpen(true)}
            className="py-2 px-3 rounded-xl bg-error-container text-on-error-container m3-label-medium font-bold transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
            <label className="block m3-label-medium text-on-surface-variant mb-1">New PIN (4-6 digits)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/40 text-center text-lg tracking-widest text-on-surface focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div>
            <label className="block m3-label-medium text-on-surface-variant mb-1">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm PIN"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/40 text-center text-lg tracking-widest text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {pinError && <p className="m3-body-medium text-error text-center">{pinError}</p>}

          <button
            onClick={handleSetNewPin}
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary m3-label-large font-bold active:scale-98 transition-all"
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
          <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="m3-body-medium text-on-surface-variant leading-relaxed">
            This will permanently delete all semesters, subjects, uploaded documents, typed notes, and Leitner flashcards stored on this device.
          </p>
          <button
            onClick={handleWipeDatabase}
            className="w-full py-2.5 rounded-xl bg-error text-on-error m3-label-large font-bold active:scale-98 transition-all"
          >
            Confirm & Wipe All Data
          </button>
        </div>
      </SheetCard>
    </div>
  );
};
