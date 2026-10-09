import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { TopAppBar, Switch } from '../../components/m3e';
import { SettingsGroupCard } from '../../components/m3e/cards';
import { Moon, Palette, Zap, Key, Database, ShieldCheck, Info } from 'lucide-react';

interface SettingsScreenProps {
  onClearData?: () => void;
}

const PALETTES = [
  { id: 'indigo', name: 'Indigo (Default)', color: '#4285F4' },
  { id: 'emerald', name: 'Emerald', color: '#10B981' },
  { id: 'violet', name: 'Violet', color: '#8B5CF6' },
  { id: 'rose', name: 'Rose', color: '#F43F5E' },
  { id: 'amber', name: 'Amber', color: '#F59E0B' },
  { id: 'cyan', name: 'Cyan', color: '#06B6D4' }
];

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('dark');
  const [selectedPalette, setSelectedPalette] = useState('indigo');
  const [perfMode, setPerfMode] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [stats, setStats] = useState({ docs: 0, cards: 0, links: 0 });

  useEffect(() => {
    const loadSettings = async () => {
      const savedKey = localStorage.getItem('studyvault_groq_key') || '';
      setApiKey(savedKey);
      const savedPalette = localStorage.getItem('studyvault_palette') || 'indigo';
      setSelectedPalette(savedPalette);

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
    loadSettings();
  }, []);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('studyvault_groq_key', key);
  };

  const handleSelectPalette = (id: string) => {
    setSelectedPalette(id);
    localStorage.setItem('studyvault_palette', id);
    document.documentElement.setAttribute('data-theme-palette', id);
  };

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] pb-24">
      <TopAppBar
        title="Settings"
        subtitle="Preferences & Local Storage"
      />

      <main className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
        <SettingsGroupCard
          title="Appearance & Theme"
          items={[
            {
              id: 'theme',
              label: 'Dark Mode',
              subtitle: 'Material 3 Expressive Dark Theme',
              icon: Moon,
              trailing: (
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={(c) => setThemeMode(c ? 'dark' : 'light')}
                />
              )
            },
            {
              id: 'perf',
              label: '60 FPS Performance Mode',
              subtitle: 'Smooth CSS transform & GPU animations',
              icon: Zap,
              trailing: (
                <Switch
                  checked={perfMode}
                  onChange={setPerfMode}
                />
              )
            }
          ]}
        />

        <div className="p-4 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            <span className="font-semibold text-sm">Material Color Palette</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPalette(p.id)}
                className={`p-2.5 rounded-2xl flex items-center gap-2 text-xs font-semibold border transition-all ${
                  selectedPalette === p.id
                    ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                  : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="truncate">{p.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            <div>
              <p className="font-semibold text-sm">Groq AI API Key</p>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Used for instant offline-first AI study coach guidance
              </p>
            </div>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => handleSaveKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--md-sys-color-on-surface)] font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)]"
          />
        </div>

        <SettingsGroupCard
          title="Data & Storage"
          items={[
            {
              id: 'storage',
              label: 'IndexedDB Vault Status',
              subtitle: `${stats.docs} documents, ${stats.cards} cards, ${stats.links} links stored`,
              icon: Database
            },
            {
              id: 'privacy',
              label: '100% Private & Single-User',
              subtitle: 'All study documents remain on this device only',
              icon: ShieldCheck
            }
          ]}
        />

        <div className="p-4 rounded-3xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] flex items-center gap-3">
          <Info className="w-5 h-5 text-[var(--md-sys-color-outline)] flex-shrink-0" />
          <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <p className="font-semibold text-[var(--md-sys-color-on-surface)]">StudyVault v2.0</p>
            <p>Material 3 Expressive Design System with Spaced Leitner Engine.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
