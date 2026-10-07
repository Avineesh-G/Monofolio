import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
          card: 'var(--color-bg-card)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          muted: 'var(--color-accent-muted)',
          glow: 'var(--color-accent-glow)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          medium: 'var(--color-border-medium)',
          accent: 'var(--color-border-accent)',
        },
        status: {
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          error: 'var(--color-error)',
          info: 'var(--color-info)',
        },
        subject: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
          cyan: '#06b6d4',
          indigo: '#6366f1',
          teal: '#14b8a6',
        }
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'var(--safe-area-top, 0px)',
        'safe-bottom': 'var(--safe-area-bottom, 0px)',
      }
    },
  },
  plugins: [],
} satisfies Config;
