import {
  argbFromHex,
  hexFromArgb,
  Hct,
  SchemeExpressive,
  MaterialDynamicColors,
  Blend,
} from '@material/material-color-utilities';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface SeedPreset {
  id: string;
  name: string;
  hex: string;
  shapeName: string;
}

export const SEED_PRESETS: SeedPreset[] = [
  { id: 'violet', name: 'Violet', hex: '#6750a4', shapeName: 'flower' },
  { id: 'teal', name: 'Teal', hex: '#006a6a', shapeName: 'clover4' },
  { id: 'coral', name: 'Coral', hex: '#b83e58', shapeName: 'heart' },
  { id: 'lime', name: 'Lime', hex: '#5c6a00', shapeName: 'burst' },
  { id: 'sky', name: 'Sky Blue', hex: '#00639b', shapeName: 'cookie9' },
  { id: 'rose', name: 'Rose', hex: '#984061', shapeName: 'softBurst' },
  { id: 'amber', name: 'Amber', hex: '#825500', shapeName: 'squircle' },
  { id: 'graphite', name: 'Graphite', hex: '#5a5f62', shapeName: 'gem' },
];

export const SUBJECT_SWATCH_SHAPES = [
  { hue: 210, shape: 'squircle', name: 'Blue' },
  { hue: 280, shape: 'flower', name: 'Purple' },
  { hue: 35,  shape: 'cookie6', name: 'Amber' },
  { hue: 150, shape: 'clover4', name: 'Emerald' },
  { hue: 345, shape: 'heart', name: 'Rose' },
  { hue: 185, shape: 'cookie9', name: 'Cyan' },
  { hue: 250, shape: 'diamond', name: 'Indigo' },
  { hue: 165, shape: 'pill', name: 'Teal' },
  { hue: 85,  shape: 'burst', name: 'Lime' },
  { hue: 15,  shape: 'arch', name: 'Coral' },
  { hue: 310, shape: 'softBurst', name: 'Magenta' },
  { hue: 50,  shape: 'gem', name: 'Gold' },
];

export interface SchemeRoles {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
}

/**
 * Generate full M3 Expressive Scheme for given seed and dark mode flag
 */
export function generateExpressiveScheme(seedHex: string, isDark: boolean): SchemeRoles {
  const argb = argbFromHex(seedHex);
  const hct = Hct.fromInt(argb);
  // SchemeExpressive generates expressive palette variant with shifted hues for secondary/tertiary
  const scheme = new SchemeExpressive(hct, isDark, 0.0);

  const getHex = (dynamicColor: typeof MaterialDynamicColors.primary) => {
    try {
      return hexFromArgb(dynamicColor.getArgb(scheme));
    } catch {
      return '#888888';
    }
  };

  return {
    primary: getHex(MaterialDynamicColors.primary),
    onPrimary: getHex(MaterialDynamicColors.onPrimary),
    primaryContainer: getHex(MaterialDynamicColors.primaryContainer),
    onPrimaryContainer: getHex(MaterialDynamicColors.onPrimaryContainer),
    secondary: getHex(MaterialDynamicColors.secondary),
    onSecondary: getHex(MaterialDynamicColors.onSecondary),
    secondaryContainer: getHex(MaterialDynamicColors.secondaryContainer),
    onSecondaryContainer: getHex(MaterialDynamicColors.onSecondaryContainer),
    tertiary: getHex(MaterialDynamicColors.tertiary),
    onTertiary: getHex(MaterialDynamicColors.onTertiary),
    tertiaryContainer: getHex(MaterialDynamicColors.tertiaryContainer),
    onTertiaryContainer: getHex(MaterialDynamicColors.onTertiaryContainer),
    error: getHex(MaterialDynamicColors.error),
    onError: getHex(MaterialDynamicColors.onError),
    errorContainer: getHex(MaterialDynamicColors.errorContainer),
    onErrorContainer: getHex(MaterialDynamicColors.onErrorContainer),
    background: getHex(MaterialDynamicColors.background),
    onBackground: getHex(MaterialDynamicColors.onBackground),
    surface: getHex(MaterialDynamicColors.surface),
    onSurface: getHex(MaterialDynamicColors.onSurface),
    onSurfaceVariant: getHex(MaterialDynamicColors.onSurfaceVariant),
    surfaceDim: getHex(MaterialDynamicColors.surfaceDim),
    surfaceBright: getHex(MaterialDynamicColors.surfaceBright),
    surfaceContainerLowest: getHex(MaterialDynamicColors.surfaceContainerLowest),
    surfaceContainerLow: getHex(MaterialDynamicColors.surfaceContainerLow),
    surfaceContainer: getHex(MaterialDynamicColors.surfaceContainer),
    surfaceContainerHigh: getHex(MaterialDynamicColors.surfaceContainerHigh),
    surfaceContainerHighest: getHex(MaterialDynamicColors.surfaceContainerHighest),
    outline: getHex(MaterialDynamicColors.outline),
    outlineVariant: getHex(MaterialDynamicColors.outlineVariant),
    inverseSurface: getHex(MaterialDynamicColors.inverseSurface),
    inverseOnSurface: getHex(MaterialDynamicColors.inverseOnSurface),
    inversePrimary: getHex(MaterialDynamicColors.inversePrimary),
  };
}

/**
 * Apply CSS variables to document root without re-rendering the React tree
 */
export function applyTheme(seedHex: string, mode: ThemeMode): SchemeRoles {
  if (typeof document === 'undefined') {
    return generateExpressiveScheme(seedHex, true);
  }

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const scheme = generateExpressiveScheme(seedHex, isDark);
  const root = document.documentElement;

  // Toggle class for Tailwind dark variant
  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }

  // Update theme meta color for mobile address bar
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', scheme.surface);
  }

  // Set all CSS variables
  root.style.setProperty('--md-sys-color-primary', scheme.primary);
  root.style.setProperty('--md-sys-color-on-primary', scheme.onPrimary);
  root.style.setProperty('--md-sys-color-primary-container', scheme.primaryContainer);
  root.style.setProperty('--md-sys-color-on-primary-container', scheme.onPrimaryContainer);

  root.style.setProperty('--md-sys-color-secondary', scheme.secondary);
  root.style.setProperty('--md-sys-color-on-secondary', scheme.onSecondary);
  root.style.setProperty('--md-sys-color-secondary-container', scheme.secondaryContainer);
  root.style.setProperty('--md-sys-color-on-secondary-container', scheme.onSecondaryContainer);

  root.style.setProperty('--md-sys-color-tertiary', scheme.tertiary);
  root.style.setProperty('--md-sys-color-on-tertiary', scheme.onTertiary);
  root.style.setProperty('--md-sys-color-tertiary-container', scheme.tertiaryContainer);
  root.style.setProperty('--md-sys-color-on-tertiary-container', scheme.onTertiaryContainer);

  root.style.setProperty('--md-sys-color-error', scheme.error);
  root.style.setProperty('--md-sys-color-on-error', scheme.onError);
  root.style.setProperty('--md-sys-color-error-container', scheme.errorContainer);
  root.style.setProperty('--md-sys-color-on-error-container', scheme.onErrorContainer);

  root.style.setProperty('--md-sys-color-background', scheme.background);
  root.style.setProperty('--md-sys-color-on-background', scheme.onBackground);
  root.style.setProperty('--md-sys-color-surface', scheme.surface);
  root.style.setProperty('--md-sys-color-on-surface', scheme.onSurface);
  root.style.setProperty('--md-sys-color-on-surface-variant', scheme.onSurfaceVariant);

  root.style.setProperty('--md-sys-color-surface-dim', scheme.surfaceDim);
  root.style.setProperty('--md-sys-color-surface-bright', scheme.surfaceBright);
  root.style.setProperty('--md-sys-color-surface-container-lowest', scheme.surfaceContainerLowest);
  root.style.setProperty('--md-sys-color-surface-container-low', scheme.surfaceContainerLow);
  root.style.setProperty('--md-sys-color-surface-container', scheme.surfaceContainer);
  root.style.setProperty('--md-sys-color-surface-container-high', scheme.surfaceContainerHigh);
  root.style.setProperty('--md-sys-color-surface-container-highest', scheme.surfaceContainerHighest);

  root.style.setProperty('--md-sys-color-outline', scheme.outline);
  root.style.setProperty('--md-sys-color-outline-variant', scheme.outlineVariant);
  root.style.setProperty('--md-sys-color-inverse-surface', scheme.inverseSurface);
  root.style.setProperty('--md-sys-color-inverse-on-surface', scheme.inverseOnSurface);
  root.style.setProperty('--md-sys-color-inverse-primary', scheme.inversePrimary);

  return scheme;
}

/**
 * Harmonize subject colors with the app's seed color and cache derived sets
 */
export interface SubjectAccentSet {
  accent: string;
  accentContainer: string;
  onAccentContainer: string;
}

const subjectAccentCache = new Map<string, SubjectAccentSet>();

export function getHarmonizedSubjectColors(
  subjectHue: number,
  seedHex: string,
  isDark: boolean
): SubjectAccentSet {
  const cacheKey = `${subjectHue}_${seedHex}_${isDark ? 'dark' : 'light'}`;
  const cached = subjectAccentCache.get(cacheKey);
  if (cached) return cached;

  const sourceHct = Hct.from(subjectHue, 48, 50);
  const sourceArgb = sourceHct.toInt();
  const seedArgb = argbFromHex(seedHex);

  const harmonizedArgb = Blend.harmonize(sourceArgb, seedArgb);
  const harmonizedHct = Hct.fromInt(harmonizedArgb);

  const accentHct = Hct.from(
    harmonizedHct.hue,
    harmonizedHct.chroma,
    isDark ? 80 : 40
  );
  const containerHct = Hct.from(
    harmonizedHct.hue,
    Math.min(harmonizedHct.chroma, 32),
    isDark ? 30 : 90
  );
  const onContainerHct = Hct.from(
    harmonizedHct.hue,
    harmonizedHct.chroma,
    isDark ? 90 : 10
  );

  const result: SubjectAccentSet = {
    accent: hexFromArgb(accentHct.toInt()),
    accentContainer: hexFromArgb(containerHct.toInt()),
    onAccentContainer: hexFromArgb(onContainerHct.toInt()),
  };

  subjectAccentCache.set(cacheKey, result);
  return result;
}

/**
 * WCAG AA Contrast Utility
 */
function getRelativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getContrastRatio(fgHex: string, bgHex: string): number {
  const l1 = getRelativeLuminance(fgHex);
  const l2 = getRelativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isWcagAa(fgHex: string, bgHex: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(fgHex, bgHex);
  return ratio >= (isLargeText ? 3.0 : 4.5);
}
