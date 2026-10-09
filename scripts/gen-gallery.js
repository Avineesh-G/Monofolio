import fs from 'fs';

const code = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, Zap, Palette, Shapes, Type, Activity,
  Sparkles, LayoutGrid, Trash2, FileText, Bookmark, Brain
} from 'lucide-react';
import {
  SEED_PRESETS, generateExpressiveScheme, ThemeMode
} from '../../theme/colors';
import {
  SHAPE_NAMES, Shape, ShapeName, getShapePoints, interpolatePoints, pointsToSvgPath
} from '../../theme/shapes';
import { useSettingsStore } from '../../store/useSettingsStore';
import { spring } from '../../theme/motion';
import { motion } from 'framer-motion';
import {
  Button, ToggleButton, ButtonGroup, SplitButton, Chip, ShapeBadge,
  SearchBar, Switch, Slider, SheetCard, Dialog, Snackbar,
  LoadingIndicator, WavyProgress, ScallopRing
} from '../../components/m3e';

type Tab = 'components' | 'colors' | 'shapes' | 'typography' | 'motion';

export const DevGalleryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('components');
  const { seedColor, themeMode, performanceMode, setSeedColor, setThemeMode, setPerformanceMode } = useSettingsStore();

  const [btnGroupVal, setBtnGroupVal] = useState<'all' | 'pdf' | 'notes' | 'links'>('all');
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [chipSelected, setChipSelected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('Operating Systems');
  const [switchVal, setSwitchVal] = useState(true);
  const [sliderVal, setSliderVal] = useState(15);
  const [wavyVal] = useState(65);
  const [ringVal] = useState(82);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const [morphFrom] = useState<ShapeName>('flower');
  const [morphTo] = useState<ShapeName>('cookie9');
  const [morphProgress, setMorphProgress] = useState(0);

  const [motionBoxKey, setMotionBoxKey] = useState(0);
  const [activeMotionType, setActiveMotionType] = useState<keyof typeof spring>('spatialDefault');

  const isDark = themeMode === 'dark' || (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const scheme = generateExpressiveScheme(seedColor, isDark);

  useEffect(() => {
    if (activeTab !== 'shapes') return;
    let animId: number;
    const startTime = performance.now();
    const loop = (now: number) => {
      const p = (Math.sin((now - startTime) / 500) + 1) / 2;
      setMorphProgress(p);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, morphFrom, morphTo]);

  const interpolatedPath = React.useMemo(() => {
    const mixed = interpolatePoints(getShapePoints(morphFrom), getShapePoints(morphTo), morphProgress);
    return pointsToSvgPath(mixed);
  }, [morphFrom, morphTo, morphProgress]);

  const COLOR_ROLES = [
    { label: 'Primary', value: scheme.primary, onValue: scheme.onPrimary },
    { label: 'Primary Container', value: scheme.primaryContainer, onValue: scheme.onPrimaryContainer },
    { label: 'Secondary', value: scheme.secondary, onValue: scheme.onSecondary },
    { label: 'Secondary Container', value: scheme.secondaryContainer, onValue: scheme.onSecondaryContainer },
    { label: 'Tertiary', value: scheme.tertiary, onValue: scheme.onTertiary },
    { label: 'Tertiary Container', value: scheme.tertiaryContainer, onValue: scheme.onTertiaryContainer },
    { label: 'Error', value: scheme.error, onValue: scheme.onError },
    { label: 'Error Container', value: scheme.errorContainer, onValue: scheme.onErrorContainer },
    { label: 'Surface', value: scheme.surface, onValue: scheme.onSurface },
    { label: 'Container', value: scheme.surfaceContainer, onValue: scheme.onSurface },
    { label: 'Container High', value: scheme.surfaceContainerHigh, onValue: scheme.onSurface },
    { label: 'Container Highest', value: scheme.surfaceContainerHighest, onValue: scheme.onSurface },
  ];

  return (
    <div className="min-h-full h-full bg-surface text-on-surface flex flex-col font-sans select-none overflow-y-auto pb-24 scroll-container">
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-on-surface">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="m3-title-large-emp text-on-surface flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> M3E Gallery
            </h1>
            <p className="m3-label-medium text-on-surface-variant">Components & Token Bench</p>
          </div>
        </div>
        <button onClick={() => setPerformanceMode(!performanceMode)} className={\`px-3 py-1.5 rounded-full flex items-center gap-1.5 m3-label-medium \${performanceMode ? 'bg-amber-500/20 text-amber-300' : 'bg-surface-container text-on-surface-variant'}\`}>
          <Zap className="w-3.5 h-3.5" /> {performanceMode ? 'Perf: ON' : 'Perf: OFF'}
        </button>
      </header>

      <div className="px-4 pt-3 border-b border-outline-variant/30 flex gap-2 overflow-x-auto scrollbar-none shrink-0 bg-surface">
        {[
          { id: 'components', label: 'Components', icon: LayoutGrid },
          { id: 'colors', label: 'Colors', icon: Palette },
          { id: 'shapes', label: 'Shapes (21)', icon: Shapes },
          { id: 'typography', label: 'Typography', icon: Type },
          { id: 'motion', label: 'Motion', icon: Activity },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={\`px-4 py-2 rounded-xl m3-label-large flex items-center gap-2 \${activeTab === tab.id ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant'}\`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <main className="p-4 max-w-5xl mx-auto w-full flex-1 space-y-6">
        {activeTab === 'components' && (
          <>
            <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-3">
              <h2 className="m3-title-medium-emp">1. Buttons, Toggles & Split Actions</h2>
              <div className="flex flex-wrap gap-2.5">
                <Button variant="filled">Filled</Button>
                <Button variant="tonal">Tonal</Button>
                <Button variant="outlined">Outlined</Button>
                <Button variant="elevated">Elevated</Button>
                <Button variant="text">Text</Button>
                <Button variant="error" leadingIcon={<Trash2 className="w-4 h-4" />}>Delete</Button>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 border-t border-outline-variant/20">
                <ToggleButton selected={toggle1} onToggle={setToggle1}>Favorited</ToggleButton>
                <ToggleButton selected={toggle2} onToggle={setToggle2} leadingIcon={<Bookmark className="w-4 h-4" />}>Saved Note</ToggleButton>
                <SplitButton
                  primaryAction={{ id: 'quick', label: 'Analyze', icon: <Brain className="w-4 h-4" /> }}
                  menuActions={[
                    { id: 'quick', label: 'Quick Cheat Sheet' },
                    { id: 'deep', label: 'Deep Synthesis' },
                  ]}
                  onSelectAction={(id) => alert('Action: ' + id)}
                />
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-3">
              <h2 className="m3-title-medium-emp">2. Connected Button Groups & Chips</h2>
              <ButtonGroup value={btnGroupVal} onChange={setBtnGroupVal} options={[{ value: 'all', label: 'All' }, { value: 'pdf', label: 'PDFs' }, { value: 'notes', label: 'Notes' }, { value: 'links', label: 'Links' }]} />
              <div className="flex flex-wrap gap-2 pt-2">
                <Chip label="Filter Chip" selected={chipSelected} onClick={() => setChipSelected(!chipSelected)} />
                <Chip label="Operating Systems" selected={true} onRemove={() => alert('Removed')} />
                <Chip label="Assist Chip" leadingIcon={<Sparkles className="w-3.5 h-3.5" />} onClick={() => alert('Assist')} />
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-3">
              <h2 className="m3-title-medium-emp">3. Search Bar, Switches & Sliders</h2>
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-surface-container-low flex items-center justify-between">
                  <span className="m3-label-large font-bold">Expressive Switch</span>
                  <Switch checked={switchVal} onChange={setSwitchVal} />
                </div>
                <div className="p-3 rounded-2xl bg-surface-container-low">
                  <Slider label="Quiz Cards" min={5} max={50} step={5} value={sliderVal} onChange={setSliderVal} valueFormatter={(v) => v + ' Cards'} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-3">
              <h2 className="m3-title-medium-emp">4. Progress & Shape Badges</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="p-3 rounded-2xl bg-surface-container-low flex flex-col items-center">
                  <LoadingIndicator size={44} label="Analyzing..." />
                </div>
                <div className="p-3 rounded-2xl bg-surface-container-low space-y-2">
                  <span className="m3-label-medium">Wavy Progress ({wavyVal}%)</span>
                  <WavyProgress progress={wavyVal} />
                </div>
                <div className="p-3 rounded-2xl bg-surface-container-low flex flex-col items-center">
                  <span className="m3-label-medium mb-1">Scallop Mastery</span>
                  <ScallopRing progress={ringVal} size={52} showScallopBadge />
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-2">
                <ShapeBadge shape="squircle" size={40} shapeFill="var(--md-sys-color-primary-container)" icon={<FileText className="w-4 h-4 text-on-primary-container" />} />
                <ShapeBadge shape="flower" size={40} shapeFill="var(--md-sys-color-secondary-container)" icon={<Brain className="w-4 h-4 text-on-secondary-container" />} />
                <ShapeBadge shape="cookie9" size={40} shapeFill="var(--md-sys-color-tertiary-container)" icon={<Sparkles className="w-4 h-4 text-on-tertiary-container" />} />
                <ShapeBadge shape="clover4" size={40} shapeFill="#10b98133" icon={<Check className="w-4 h-4 text-emerald-400" />} />
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-3">
              <h2 className="m3-title-medium-emp">5. Floating Popups & Feedback</h2>
              <div className="flex flex-wrap gap-2.5">
                <Button variant="tonal" onClick={() => setIsSheetOpen(true)}>Open SheetCard</Button>
                <Button variant="outlined" onClick={() => setIsDialogOpen(true)}>Open Dialog</Button>
                <Button variant="filled" onClick={() => setIsSnackbarOpen(true)}>Trigger Snackbar</Button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-container space-y-3">
              <h2 className="m3-title-medium-emp">Seed Presets & Theme Mode</h2>
              <div className="flex items-center bg-surface-container-lowest p-1 rounded-full w-fit">
                {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => (
                  <button key={mode} onClick={() => setThemeMode(mode)} className={\`px-3 py-1 rounded-full m3-label-medium capitalize \${themeMode === mode ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}\`}>{mode}</button>
                ))}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {SEED_PRESETS.map(preset => (
                  <button key={preset.id} onClick={() => setSeedColor(preset.hex)} className={\`flex flex-col items-center p-2 rounded-xl \${seedColor.toLowerCase() === preset.hex.toLowerCase() ? 'bg-surface-container-highest ring-2 ring-primary' : 'bg-surface-container-low'}\`}>
                    <Shape name={preset.shapeName as ShapeName} size={32} fill={preset.hex} />
                    <span className="m3-label-medium text-[10px] mt-1">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_ROLES.map(role => (
                <div key={role.label} onClick={() => navigator.clipboard.writeText(role.value)} className="p-3 rounded-2xl cursor-pointer border border-outline-variant/30 flex flex-col justify-between h-20" style={{ backgroundColor: role.value, color: role.onValue }}>
                  <span className="m3-label-large text-xs font-bold truncate">{role.label}</span>
                  <span className="font-mono text-[10px]">{role.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-container flex flex-col sm:flex-row items-center justify-around gap-4">
              <div className="flex flex-col items-center">
                <span className="m3-label-medium mb-1">From ({morphFrom})</span>
                <Shape name={morphFrom} size={54} fill="var(--md-sys-color-secondary)" />
              </div>
              <div className="w-24 h-24 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30">
                <svg viewBox="0 0 100 100" width={70} height={70}><path d={interpolatedPath} fill="var(--md-sys-color-primary)" /></svg>
              </div>
              <div className="flex flex-col items-center">
                <span className="m3-label-medium mb-1">To ({morphTo})</span>
                <Shape name={morphTo} size={54} fill="var(--md-sys-color-tertiary)" />
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {SHAPE_NAMES.map(name => (
                <div key={name} className="p-2.5 rounded-2xl bg-surface-container flex flex-col items-center">
                  <Shape name={name} size={36} fill="var(--md-sys-color-primary)" />
                  <span className="m3-label-medium text-[10px] mt-1 capitalize truncate">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="p-4 rounded-2xl bg-surface-container space-y-3">
            <h2 className="m3-title-medium-emp">Roboto Flex Scale</h2>
            <div className="m3-display-large-emp text-primary">Display Large Emp</div>
            <div className="m3-headline-large-emp">Headline Large Emp</div>
            <div className="m3-title-large-emp">Title Large Emp</div>
            <div className="m3-body-large text-on-surface-variant">Body Large Normal text preview</div>
          </div>
        )}

        {activeTab === 'motion' && (
          <div className="p-4 rounded-2xl bg-surface-container space-y-4 text-center">
            <h2 className="m3-title-medium-emp">M3 Spatial Spring Test Bench</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {(Object.keys(spring) as (keyof typeof spring)[]).map(k => (
                <button key={k} onClick={() => { setActiveMotionType(k); setMotionBoxKey(b => b + 1); }} className={\`px-3 py-1 rounded-full m3-label-medium \${activeMotionType === k ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-high'}\`}>{k}</button>
              ))}
            </div>
            <div className="h-28 flex items-center justify-center">
              <motion.div key={motionBoxKey} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={performanceMode ? { duration: 0.01 } : spring[activeMotionType]} className="px-6 py-3 rounded-2xl bg-primary-container text-on-primary-container font-bold">
                {activeMotionType}
              </motion.div>
            </div>
          </div>
        )}
      </main>

      <SheetCard isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="Floating SheetCard">
        <p className="m3-body-medium text-on-surface-variant py-2">Elevated floating sheet card with 32px rounded corners.</p>
        <Button variant="filled" fullWidth onClick={() => setIsSheetOpen(false)}>Close</Button>
      </SheetCard>

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Confirmation Dialog" description="Confirm action?" confirmLabel="Confirm" onConfirm={() => alert('Confirmed')} />
      <Snackbar isOpen={isSnackbarOpen} onClose={() => setIsSnackbarOpen(false)} message="Action saved successfully" actionLabel="Undo" onAction={() => alert('Undo')} />
    </div>
  );
};
`;

fs.writeFileSync('src/features/dev/DevGalleryScreen.tsx', code, 'utf8');
console.log('Successfully updated DevGalleryScreen.tsx');
