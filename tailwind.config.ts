import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Material 3 Expressive Tonal Roles
        primary: {
          DEFAULT: 'var(--md-sys-color-primary)',
          container: 'var(--md-sys-color-primary-container)',
        },
        'on-primary': {
          DEFAULT: 'var(--md-sys-color-on-primary)',
          container: 'var(--md-sys-color-on-primary-container)',
        },
        secondary: {
          DEFAULT: 'var(--md-sys-color-secondary)',
          container: 'var(--md-sys-color-secondary-container)',
        },
        'on-secondary': {
          DEFAULT: 'var(--md-sys-color-on-secondary)',
          container: 'var(--md-sys-color-on-secondary-container)',
        },
        tertiary: {
          DEFAULT: 'var(--md-sys-color-tertiary)',
          container: 'var(--md-sys-color-tertiary-container)',
        },
        'on-tertiary': {
          DEFAULT: 'var(--md-sys-color-on-tertiary)',
          container: 'var(--md-sys-color-on-tertiary-container)',
        },
        error: {
          DEFAULT: 'var(--md-sys-color-error)',
          container: 'var(--md-sys-color-error-container)',
        },
        'on-error': {
          DEFAULT: 'var(--md-sys-color-on-error)',
          container: 'var(--md-sys-color-on-error-container)',
        },
        surface: {
          DEFAULT: 'var(--md-sys-color-surface)',
          dim: 'var(--md-sys-color-surface-dim)',
          bright: 'var(--md-sys-color-surface-bright)',
          'container-lowest': 'var(--md-sys-color-surface-container-lowest)',
          'container-low': 'var(--md-sys-color-surface-container-low)',
          container: 'var(--md-sys-color-surface-container)',
          'container-high': 'var(--md-sys-color-surface-container-high)',
          'container-highest': 'var(--md-sys-color-surface-container-highest)',
        },
        'on-surface': {
          DEFAULT: 'var(--md-sys-color-on-surface)',
          variant: 'var(--md-sys-color-on-surface-variant)',
        },
        outline: {
          DEFAULT: 'var(--md-sys-color-outline)',
          variant: 'var(--md-sys-color-outline-variant)',
        },
        inverse: {
          surface: 'var(--md-sys-color-inverse-surface)',
          'on-surface': 'var(--md-sys-color-inverse-on-surface)',
          primary: 'var(--md-sys-color-inverse-primary)',
        },

        // Backward-compatible semantic aliases
        bg: {
          DEFAULT: 'var(--md-sys-color-surface)',
          secondary: 'var(--md-sys-color-surface-container)',
          tertiary: 'var(--md-sys-color-surface-container-high)',
          elevated: 'var(--md-sys-color-surface-container-highest)',
          card: 'var(--md-sys-color-surface-container)',
        },
        accent: {
          DEFAULT: 'var(--md-sys-color-primary)',
          hover: 'var(--md-sys-color-primary-container)',
          muted: 'rgba(208, 188, 255, 0.15)',
          glow: 'rgba(208, 188, 255, 0.35)',
        },
        text: {
          primary: 'var(--md-sys-color-on-surface)',
          secondary: 'var(--md-sys-color-on-surface-variant)',
          muted: 'var(--md-sys-color-outline)',
          inverse: 'var(--md-sys-color-inverse-on-surface)',
        },
        border: {
          subtle: 'var(--md-sys-color-outline-variant)',
          medium: 'var(--md-sys-color-outline)',
          accent: 'var(--md-sys-color-primary)',
        },
      },
      borderRadius: {
        none: 'var(--shape-none)',
        xs: 'var(--shape-xs)',
        sm: 'var(--shape-sm)',
        md: 'var(--shape-md)',
        lg: 'var(--shape-lg)',
        'lg-inc': 'var(--shape-lg-inc)',
        xl: 'var(--shape-xl)',
        'xl-inc': 'var(--shape-xl-inc)',
        xxl: 'var(--shape-xxl)',
        full: 'var(--shape-full)',
        DEFAULT: 'var(--shape-md)',
      },
      fontFamily: {
        sans: ['Roboto Flex', 'Roboto', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'var(--safe-area-top, 0px)',
        'safe-bottom': 'var(--safe-area-bottom, 0px)',
      }
    },
  },
  plugins: [],
} satisfies Config;
