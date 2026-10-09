import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { syncVaultWithSupabase } from '../../db/sync';
import { useAuthStore } from '../../store/useAuthStore';
import { TopAppBar, Switch, Button, MonofolioLogo } from '../../components/m3e';
import { SettingsGroupCard } from '../../components/m3e/cards';
import { useSettingsStore } from '../../store/useSettingsStore';
import { 
  Moon, 
  Palette, 
  Zap, 
  Key, 
  Database, 
  ShieldCheck, 
  Sun, 
  Check, 
  Cloud, 
  User, 
  LogOut, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface SettingsScreenProps {
  onClearData?: () => void;
}

const PALETTES = [
  { id: 'violet', name: 'Violet (Default)', color: '#6750a4' },
  { id: 'teal', name: 'Teal', color: '#006a6a' },
  { id: 'coral', name: 'Coral', color: '#b83e58' },
  { id: 'lime', name: 'Lime', color: '#5c6a00' },
  { id: 'sky', name: 'Sky Blue', color: '#00639b' },
  { id: 'amber', name: 'Amber', color: '#825500' }
];

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const themeMode = useSettingsStore(state => state.themeMode);
  const setThemeMode = useSettingsStore(state => state.setThemeMode);
  const seedColor = useSettingsStore(state => state.seedColor);
  const setSeedColor = useSettingsStore(state => state.setSeedColor);
  const performanceMode = useSettingsStore(state => state.performanceMode);
  const setPerformanceMode = useSettingsStore(state => state.setPerformanceMode);
  const groqApiKey = useSettingsStore(state => state.groqApiKey);
  const setGroqApiKey = useSettingsStore(state => state.setGroqApiKey);

  const { user, signInWithEmail, signUpWithEmail, signOut, initializeAuth } = useAuthStore();

  const [inputKey, setInputKey] = useState('');
  const [stats, setStats] = useState({ docs: 0, cards: 0, links: 0 });

  // Auth form state
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('');

  useEffect(() => {
    initializeAuth();
    setInputKey(groqApiKey);
    const loadStats = async () => {
      try {
        const [docs, cards, links] = await Promise.all([
          db.documents.count(),
          db.flashcards.count(),
          db.savedLinks.count()
        ]);
        setStats({ docs, cards, links });
      } catch (err) {
        console.error('Failed to count DB stats:', err);
      }
    };
    loadStats();
  }, [groqApiKey, initializeAuth]);

  const handleToggleTheme = (isDark: boolean) => {
    const nextMode = isDark ? 'dark' : 'light';
    setThemeMode(nextMode);
  };

  const handleSelectPalette = (hex: string) => {
    setSeedColor(hex);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPass.trim()) return;
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = authMode === 'signin'
        ? await signInWithEmail(authEmail.trim(), authPass)
        : await signUpWithEmail(authEmail.trim(), authPass);

      if (res.error) {
        setAuthError(res.error.message);
      } else {
        setAuthEmail('');
        setAuthPass('');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSyncNow = async () => {
    if (!user) {
      setSyncStatusText('Sign in below to enable PostgreSQL cloud sync.');
      return;
    }
    setIsSyncing(true);
    setSyncStatusText('Syncing local vault with Supabase PostgreSQL...');

    const res = await syncVaultWithSupabase(user.id);
    setIsSyncing(false);
    if (res.success) {
      setSyncStatusText('Vault in sync with Supabase PostgreSQL!');
    } else {
      setSyncStatusText(`Sync issue: ${res.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-28">
      <TopAppBar
        title="Settings"
        subtitle="Preferences, Supabase Auth & Cloud Sync"
      />

      <main className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
        {/* Supabase Account & PostgreSQL Sync */}
        <div className="p-5 rounded-[24px] bg-surface-container space-y-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface font-extrabold text-xs uppercase font-mono tracking-wider">
              <Cloud className="w-4 h-4 text-primary" />
              <span>Supabase & PostgreSQL Cloud Sync</span>
            </div>
            {user && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold">
                Connected
              </span>
            )}
          </div>

          {user ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">{user.email}</p>
                    <p className="text-[10px] text-on-surface-variant font-mono">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </div>

                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 rounded-xl bg-surface-container-highest hover:bg-rose-500/15 text-on-surface hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="filled"
                  size="sm"
                  fullWidth
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  leadingIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
                >
                  {isSyncing ? 'Syncing...' : 'Sync Vault Now'}
                </Button>
              </div>
              {syncStatusText && (
                <p className="text-[11px] text-primary text-center font-mono">{syncStatusText}</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-2.5">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Connect your account to synchronize your courses, notes, and Leitner flashcards to Supabase PostgreSQL.
              </p>

              <div className="flex p-1 rounded-full bg-surface-container-highest">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-1 rounded-full text-xs font-bold transition-all ${
                    authMode === 'signin' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-1 rounded-full text-xs font-bold transition-all ${
                    authMode === 'signup' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-surface-container-high text-on-surface rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />

              <input
                type="password"
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="w-full bg-surface-container-high text-on-surface rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />

              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="filled"
                size="sm"
                fullWidth
                disabled={authLoading || !authEmail.trim() || !authPass.trim()}
              >
                {authLoading ? 'Connecting...' : authMode === 'signin' ? 'Sign In to Monofolio' : 'Create Free Account'}
              </Button>
            </form>
          )}
        </div>

        {/* Appearance & Theme */}
        <SettingsGroupCard
          title="Appearance & Theme"
          items={[
            {
              id: 'theme',
              label: themeMode === 'dark' ? 'Dark Theme' : 'Light Theme',
              subtitle: themeMode === 'dark' ? 'Material 3 Expressive Dark Palette' : 'Material 3 Expressive Light Palette',
              icon: themeMode === 'dark' ? Moon : Sun,
              trailing: (
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={handleToggleTheme}
                />
              )
            },
            {
              id: 'perf',
              label: '60 FPS Performance Mode',
              subtitle: 'Optimized GPU transform animations',
              icon: Zap,
              trailing: (
                <Switch
                  checked={performanceMode}
                  onChange={setPerformanceMode}
                />
              )
            }
          ]}
        />

        {/* Dynamic Color Palette Selector */}
        <div className="p-5 rounded-[24px] bg-surface-container space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-on-surface font-extrabold text-xs uppercase font-mono tracking-wider">
            <Palette className="w-4 h-4 text-primary" />
            <span>Expressive Dynamic Palette</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {PALETTES.map((p) => {
              const isSelected = seedColor.toLowerCase() === p.color.toLowerCase();
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPalette(p.color)}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-2 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container shadow-md'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate">{p.name.split(' ')[0]}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Key Config */}
        <div className="p-5 rounded-[24px] bg-surface-container space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-on-surface font-extrabold text-xs uppercase font-mono tracking-wider">
            <Key className="w-4 h-4 text-primary" />
            <span>Groq AI API Key</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            Used exclusively for local offline-first AI coaching, flashcard generation, and study plan synthesis.
          </p>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => {
              setInputKey(e.target.value);
              setGroqApiKey(e.target.value);
            }}
            placeholder="gsk_..."
            className="w-full bg-surface-container-high text-on-surface rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>

        {/* Vault Status */}
        <SettingsGroupCard
          title="Security & Vault Status"
          items={[
            {
              id: 'storage',
              label: 'IndexedDB Vault Status',
              subtitle: `${stats.docs} documents, ${stats.cards} cards, ${stats.links} links stored locally`,
              icon: Database
            },
            {
              id: 'privacy',
              label: '100% Private & Single-User',
              subtitle: 'All documents and neural index stay on your device',
              icon: ShieldCheck
            }
          ]}
        />

        <div className="p-4 rounded-[22px] bg-surface-container-low flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/80 flex items-center justify-center p-2.5 shrink-0 shadow-sm">
            <MonofolioLogo size={28} className="text-primary" />
          </div>
          <div className="text-xs text-on-surface-variant leading-relaxed min-w-0 flex-1">
            <p className="font-bold text-on-surface text-sm">Monofolio v2.0</p>
            <p>Material 3 Expressive Mobile Architecture & Blunt AI Coach</p>
          </div>
        </div>
      </main>
    </div>
  );
};
