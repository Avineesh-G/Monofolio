import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sun,
  Moon,
  Laptop,
  Check,
  Zap,
  Palette,
  Shapes,
  Type,
  Activity,
  Copy,
  Sparkles,
} from 'lucide-react';
import {
  SEED_PRESETS,
  SUBJECT_SWATCH_SHAPES,
  generateExpressiveScheme,
  getHarmonizedSubjectColors,
  getContrastRatio,
  isWcagAa,
  ThemeMode,
} from '../../theme/colors';
import {
  SHAPE_NAMES,
  Shape,
  ShapeName,
  getShapePoints,
  interpolatePoints,
  pointsToSvgPath,
} from '../../theme/shapes';
import { useSettingsStore } from '../../store/useSettingsStore';
import { spring } from '../../theme/motion';
import { motion } from 'framer-motion';

type Tab = 'colors' | 'shapes' | 'typography' | 'motion';

export const DevGalleryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('colors');

  const {
    seedColor,
    themeMode,
    performanceMode,
    setSeedColor,
    setThemeMode,
    setPerformanceMode,
  } = useSettingsStore();

  // Morphing state for shapes tab
  const [morphFrom, setMorphFrom] = useState<ShapeName>('flower');
  const [morphTo, setMorphTo] = useState<ShapeName>('cookie9');
  const [morphProgress, setMorphProgress] = useState(0);
  const [isAutoMorphing, setIsAutoMorphing] = useState(true);
  const [shapeSize, setShapeSize] = useState(48);
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  // Motion test states
  const [motionBoxKey, setMotionBoxKey] = useState(0);
  const [activeMotionType, setActiveMotionType] = useState<keyof typeof spring>('spatialDefault');

  // Compute current scheme for color grid inspection
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const scheme = generateExpressiveScheme(seedColor, isDark);

  // Auto morph loop
  useEffect(() => {
    if (!isAutoMorphing || activeTab !== 'shapes') return;
    let animId: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const p = (Math.sin(elapsed * 2) + 1) / 2;
      setMorphProgress(p);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isAutoMorphing, activeTab, morphFrom, morphTo]);

  // Interpolated morph path
  const interpolatedPath = React.useMemo(() => {
    const ptsA = getShapePoints(morphFrom);
    const ptsB = getShapePoints(morphTo);
    const mixed = interpolatePoints(ptsA, ptsB, morphProgress);
    return pointsToSvgPath(mixed);
  }, [morphFrom, morphTo, morphProgress]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRole(label);
    setTimeout(() => setCopiedRole(null), 1500);
  };

  const COLOR_ROLES = [
    { label: 'Primary', value: scheme.primary, onValue: scheme.onPrimary, group: 'Primary' },
    { label: 'Primary Container', value: scheme.primaryContainer, onValue: scheme.onPrimaryContainer, group: 'Primary' },
    { label: 'Secondary', value: scheme.secondary, onValue: scheme.onSecondary, group: 'Secondary' },
    { label: 'Secondary Container', value: scheme.secondaryContainer, onValue: scheme.onSecondaryContainer, group: 'Secondary' },
    { label: 'Tertiary', value: scheme.tertiary, onValue: scheme.onTertiary, group: 'Tertiary' },
    { label: 'Tertiary Container', value: scheme.tertiaryContainer, onValue: scheme.onTertiaryContainer, group: 'Tertiary' },
    { label: 'Error', value: scheme.error, onValue: scheme.onError, group: 'Error' },
    { label: 'Error Container', value: scheme.errorContainer, onValue: scheme.onErrorContainer, group: 'Error' },
    { label: 'Surface', value: scheme.surface, onValue: scheme.onSurface, group: 'Surfaces' },
    { label: 'Surface Dim', value: scheme.surfaceDim, onValue: scheme.onSurface, group: 'Surfaces' },
    { label: 'Surface Bright', value: scheme.surfaceBright, onValue: scheme.onSurface, group: 'Surfaces' },
    { label: 'Container Lowest', value: scheme.surfaceContainerLowest, onValue: scheme.onSurface, group: 'Surfaces' },
    { label: 'Container Low', value: scheme.surfaceContainerLow, onValue: scheme.onSurface, group: 'Surfaces' },
    { label: 'Container', value: scheme.surfaceContainer, onValue: scheme.onSurface, group: 'Surfaces' },
    { label: 'Container High', value: scheme.surfaceContainerHigh, onValue: scheme.onSurface, group: 'Surfaces' },
    { label: 'Container Highest', value: scheme.surfaceContainerHighest, onValue: scheme.onSurface, group: 'Surfaces' },
    { label: 'Outline', value: scheme.outline, onValue: scheme.surface, group: 'Outline' },
    { label: 'Outline Variant', value: scheme.outlineVariant, onValue: scheme.surface, group: 'Outline' },
    { label: 'Inverse Surface', value: scheme.inverseSurface, onValue: scheme.inverseOnSurface, group: 'Inverse' },
    { label: 'Inverse Primary', value: scheme.inversePrimary, onValue: scheme.inverseSurface, group: 'Inverse' },
  ];

  return (
    <div className="min-h-full h-full bg-surface text-on-surface flex flex-col font-sans select-none overflow-y-auto pb-24 scroll-container">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="m3-title-large-emp text-on-surface flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              M3 Expressive Gallery
            </h1>
            <p className="m3-label-medium text-on-surface-variant">Design System & Token Inspector</p>
          </div>
        </div>

        <button
          onClick={() => setPerformanceMode(!performanceMode)}
          className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 m3-label-medium transition-colors ${
            performanceMode
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          {performanceMode ? 'Perf: ON' : 'Perf: OFF'}
        </button>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-3 border-b border-outline-variant/30 flex gap-2 overflow-x-auto scrollbar-none shrink-0 bg-surface">
        {[
          { id: 'colors', label: 'Color System', icon: Palette },
          { id: 'shapes', label: 'Shape Library (21)', icon: Shapes },
          { id: 'typography', label: 'Typography Scale', icon: Type },
          { id: 'motion', label: 'Spring Motion', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-2.5 rounded-xl m3-label-large flex items-center gap-2 transition-all shrink-0 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <main className="p-4 max-w-5xl mx-auto w-full flex-1">
        {/* TAB 1: COLORS */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            {/* Seed & Theme Controls */}
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="m3-title-medium-emp text-on-surface">Seed Color & Theme Mode</h2>
                  <p className="m3-body-medium text-on-surface-variant">
                    Expressive palette auto-shifts secondary and tertiary hues for high personality.
                  </p>
                </div>

                {/* Theme Switcher */}
                <div className="flex items-center bg-surface-container-lowest p-1 rounded-full border border-outline-variant/40">
                  {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setThemeMode(mode)}
                      className={`px-3 py-1.5 rounded-full m3-label-medium capitalize flex items-center gap-1.5 transition-all ${
                        themeMode === mode
                          ? 'bg-primary text-on-primary font-bold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {mode === 'light' && <Sun className="w-3.5 h-3.5" />}
                      {mode === 'dark' && <Moon className="w-3.5 h-3.5" />}
                      {mode === 'system' && <Laptop className="w-3.5 h-3.5" />}
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seed Swatches */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 pt-2">
                {SEED_PRESETS.map((preset) => {
                  const isSelected = seedColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSeedColor(preset.hex)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-transform active:scale-95 ${
                        isSelected
                          ? 'bg-surface-container-highest ring-2 ring-primary'
                          : 'hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                        <Shape
                          name={preset.shapeName as ShapeName}
                          size={40}
                          fill={preset.hex}
                        />
                        {isSelected && (
                          <Check className="w-4 h-4 text-white absolute drop-shadow" />
                        )}
                      </div>
                      <span className="m3-label-medium text-center truncate w-full text-on-surface">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Picker */}
              <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/20">
                <label className="m3-label-large text-on-surface">Custom Seed Hex:</label>
                <input
                  type="color"
                  value={seedColor}
                  onChange={(e) => setSeedColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <code className="px-2 py-1 bg-surface-container-high rounded-md text-primary font-mono text-sm">
                  {seedColor}
                </code>
              </div>
            </div>

            {/* Generated Roles Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="m3-title-medium-emp text-on-surface">M3 Expressive Color Roles (Active Theme)</h3>
                <span className="m3-label-medium text-on-surface-variant">
                  Tap to copy HEX &bull; WCAG AA verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {COLOR_ROLES.map((role) => {
                  const ratio = getContrastRatio(role.onValue, role.value);
                  const passesAa = isWcagAa(role.onValue, role.value);

                  return (
                    <div
                      key={role.label}
                      onClick={() => copyToClipboard(role.value, role.label)}
                      className="p-3.5 rounded-2xl cursor-pointer transition-transform hover:scale-[1.02] border border-outline-variant/40 flex flex-col justify-between min-h-[105px]"
                      style={{ backgroundColor: role.value, color: role.onValue }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="m3-title-medium-emp text-xs uppercase tracking-wider opacity-90">
                          {role.label}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            passesAa ? 'bg-black/20 text-white' : 'bg-red-500 text-white'
                          }`}
                        >
                          {ratio.toFixed(1)}:1 AA
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="font-mono text-xs font-bold tracking-tight">
                          {role.value.toUpperCase()}
                        </span>
                        {copiedRole === role.label ? (
                          <span className="text-[10px] font-bold bg-white/30 px-1.5 py-0.5 rounded">
                            Copied!
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5 opacity-60" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Harmonized Subject Swatches */}
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3">
              <h3 className="m3-title-medium-emp text-on-surface">Harmonized Subject Palette (12 Swatches)</h3>
              <p className="m3-body-medium text-on-surface-variant">
                Subject colors are harmonized towards the current seed color ({seedColor}) to maintain cohesive temperature and contrast.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                {SUBJECT_SWATCH_SHAPES.map((item) => {
                  const colors = getHarmonizedSubjectColors(item.hue, seedColor, isDark);
                  return (
                    <div
                      key={item.name}
                      className="p-3 rounded-2xl flex flex-col items-center gap-2 border border-outline-variant/30"
                      style={{ backgroundColor: colors.accentContainer, color: colors.onAccentContainer }}
                    >
                      <Shape name={item.shape as ShapeName} size={36} fill={colors.accent} />
                      <span className="m3-label-large font-bold text-xs">{item.name}</span>
                      <span className="font-mono text-[10px] opacity-80">{colors.accent}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHAPES */}
        {activeTab === 'shapes' && (
          <div className="space-y-6">
            {/* Morphing Lab */}
            <div className="p-5 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="m3-title-medium-emp text-on-surface">60fps Point-Interpolation Shape Morpher</h2>
                  <p className="m3-body-medium text-on-surface-variant">
                    All 21 shapes are parameterized to exactly 96 points. Any two shapes morph smoothly via single-path interpolation.
                  </p>
                </div>
                <button
                  onClick={() => setIsAutoMorphing(!isAutoMorphing)}
                  className={`px-3 py-1.5 rounded-full m3-label-medium transition-colors ${
                    isAutoMorphing
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {isAutoMorphing ? 'Auto Morph: ON' : 'Auto Morph: PAUSED'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
                {/* Source Shape */}
                <div className="flex flex-col items-center gap-2">
                  <span className="m3-label-medium text-on-surface-variant">From</span>
                  <select
                    value={morphFrom}
                    onChange={(e) => setMorphFrom(e.target.value as ShapeName)}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-highest text-on-surface border border-outline-variant/40 m3-label-medium"
                  >
                    {SHAPE_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <Shape name={morphFrom} size={64} fill="var(--md-sys-color-secondary)" />
                </div>

                {/* Animated Morph Stage */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-28 h-28 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/40 shadow-inner">
                    <svg viewBox="0 0 100 100" width={80} height={80}>
                      <path d={interpolatedPath} fill="var(--md-sys-color-primary)" />
                    </svg>
                  </div>
                  <span className="font-mono text-xs text-primary font-bold">
                    t = {(morphProgress * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Target Shape */}
                <div className="flex flex-col items-center gap-2">
                  <span className="m3-label-medium text-on-surface-variant">To</span>
                  <select
                    value={morphTo}
                    onChange={(e) => setMorphTo(e.target.value as ShapeName)}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-highest text-on-surface border border-outline-variant/40 m3-label-medium"
                  >
                    {SHAPE_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <Shape name={morphTo} size={64} fill="var(--md-sys-color-tertiary)" />
                </div>
              </div>
            </div>

            {/* Shape Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="m3-title-medium-emp text-on-surface">Programmatic Shape Library ({SHAPE_NAMES.length} Shapes)</h3>
                <div className="flex items-center gap-2">
                  <span className="m3-label-medium text-on-surface-variant">Size: {shapeSize}px</span>
                  <input
                    type="range"
                    min={24}
                    max={80}
                    value={shapeSize}
                    onChange={(e) => setShapeSize(Number(e.target.value))}
                    className="w-24 accent-primary cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {SHAPE_NAMES.map((name) => (
                  <div
                    key={name}
                    className="p-3 rounded-2xl bg-surface-container border border-outline-variant/30 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                  >
                    <Shape name={name} size={shapeSize} fill="var(--md-sys-color-primary)" />
                    <span className="m3-label-medium text-center font-medium text-on-surface capitalize truncate w-full">
                      {name}
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant">96 pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
              <h2 className="m3-title-medium-emp text-on-surface">Roboto Flex M3 Scale & Emphasized Variants</h2>
              <p className="m3-body-medium text-on-surface-variant">
                Optimized with offline fallbacks. Displays use Emphasized weights (600–700) for hero numbers and screen headers.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  role: 'Display Large',
                  spec: '57px / 64px line',
                  normalClass: 'm3-display-large',
                  empClass: 'm3-display-large-emp',
                  sample: '94% Mastered',
                },
                {
                  role: 'Display Medium',
                  spec: '45px / 52px line',
                  normalClass: 'm3-display-medium',
                  empClass: 'm3-display-medium-emp',
                  sample: '14 Cards Due',
                },
                {
                  role: 'Headline Large',
                  spec: '32px / 40px line',
                  normalClass: 'm3-headline-large',
                  empClass: 'm3-headline-large-emp',
                  sample: 'Blunt AI Study Vault',
                },
                {
                  role: 'Headline Medium',
                  spec: '28px / 36px line',
                  normalClass: 'm3-headline-medium',
                  empClass: 'm3-headline-medium-emp',
                  sample: 'Operating Systems & Networks',
                },
                {
                  role: 'Title Large',
                  spec: '22px / 28px line',
                  normalClass: 'm3-title-large',
                  empClass: 'm3-title-large-emp',
                  sample: 'Virtual Memory & Paging Algorithms',
                },
                {
                  role: 'Title Medium',
                  spec: '16px / 24px line',
                  normalClass: 'm3-title-medium',
                  empClass: 'm3-title-medium-emp',
                  sample: 'Leitner Box 3 • 4 Days Interval',
                },
                {
                  role: 'Body Large',
                  spec: '16px / 24px line',
                  normalClass: 'm3-body-large',
                  empClass: 'm3-body-large-emp',
                  sample: 'You consistently confuse translation lookaside buffers with page tables under heavy thrashing.',
                },
                {
                  role: 'Body Medium',
                  spec: '14px / 20px line',
                  normalClass: 'm3-body-medium',
                  empClass: 'm3-body-medium-emp',
                  sample: 'Last reviewed 2 hours ago. Target mastery: 85% before finals.',
                },
                {
                  role: 'Label Large',
                  spec: '14px / 20px line',
                  normalClass: 'm3-label-large',
                  empClass: 'm3-label-large-emp',
                  sample: 'START RAPID QUIZ',
                },
                {
                  role: 'Label Medium',
                  spec: '12px / 16px line',
                  normalClass: 'm3-label-medium',
                  empClass: 'm3-label-medium-emp',
                  sample: 'ESTIMATED TIME: 12 MIN',
                },
              ].map((item) => (
                <div
                  key={item.role}
                  className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                    <span className="m3-label-large text-primary font-bold">{item.role}</span>
                    <span className="font-mono text-xs text-on-surface-variant">{item.spec}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block mb-1">
                        Normal Weight
                      </span>
                      <p className={`${item.normalClass} text-on-surface`}>{item.sample}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-primary uppercase font-bold tracking-wider block mb-1">
                        Emphasized Weight
                      </span>
                      <p className={`${item.empClass} text-on-surface`}>{item.sample}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MOTION */}
        {activeTab === 'motion' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
              <h2 className="m3-title-medium-emp text-on-surface">M3 Expressive Physical Spring Tokens</h2>
              <p className="m3-body-medium text-on-surface-variant">
                Spatial springs animate physical movement & translation (with slight natural overshoot). Effects springs animate color & opacity with zero overshoot.
              </p>
            </div>

            {/* Interactive Spring Test Bench */}
            <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center min-h-[260px] gap-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {(Object.keys(spring) as (keyof typeof spring)[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveMotionType(key);
                      setMotionBoxKey((k) => k + 1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full m3-label-medium transition-all ${
                      activeMotionType === key
                        ? 'bg-primary text-on-primary font-bold shadow-md'
                        : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Animated Box Target */}
              <div className="w-full max-w-sm h-32 flex items-center justify-center">
                <motion.div
                  key={motionBoxKey}
                  initial={{ scale: 0.7, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={
                    performanceMode
                      ? { duration: 0.01 }
                      : spring[activeMotionType]
                  }
                  className="px-6 py-4 rounded-2xl bg-primary-container text-on-primary-container font-bold text-center border border-outline-variant/30 shadow-lg flex items-center gap-3"
                >
                  <Shape name="flower" size={32} fill="var(--md-sys-color-primary)" />
                  <div>
                    <div className="m3-title-medium-emp">{activeMotionType}</div>
                    <div className="font-mono text-xs opacity-80">
                      stiffness: {spring[activeMotionType].stiffness}, damping: {spring[activeMotionType].damping}
                    </div>
                  </div>
                </motion.div>
              </div>

              <button
                onClick={() => setMotionBoxKey((k) => k + 1)}
                className="px-5 py-2.5 rounded-full bg-primary text-on-primary m3-label-large font-bold active:scale-95 transition-transform"
              >
                Re-Trigger Animation
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
