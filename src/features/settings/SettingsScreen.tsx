import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { TopAppBar, Switch, MonofolioLogo } from '../../components/m3e';
import { SettingsGroupCard } from '../../components/m3e/cards';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Moon, Palette, Zap, Key, Database, ShieldCheck, Sun, Check } from 'lucide-react';

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

  const [inputKey, setInputKey] = useState('');
  const [stats, setStats] = useState({ docs: 0, cards: 0, links: 0 });

  useEffect(() => {
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
  }, [groqApiKey]);

  const handleToggleTheme = (isDark: boolean) => {
    const nextMode = isDark ? 'dark' : 'light';
    setThemeMode(nextMode);
  };

  const handleSelectPalette = (hex: string) => {
    setSeedColor(hex);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-28">
      <TopAppBar
        title="Settings"
        subtitle="Preferences & Vault Configuration"
      />

      <main className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
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
