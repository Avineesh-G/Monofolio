import { create } from 'zustand';
import { applyTheme, ThemeMode } from '../theme/colors';

interface SettingsState {
  groqApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
  performanceMode: boolean;
  appLockEnabled: boolean;
  lockTimeoutMs: number;
  hasAcceptedPrivacyNotice: boolean;
  seedColor: string;
  themeMode: ThemeMode;

  // Actions
  setGroqApiKey: (key: string) => void;
  setAiModel: (model: string) => void;
  setPerformanceMode: (enabled: boolean) => void;
  setAppLockEnabled: (enabled: boolean) => void;
  setHasAcceptedPrivacyNotice: (accepted: boolean) => void;
  setSeedColor: (hex: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  loadSettings: () => void;
}

const SETTINGS_KEY = 'studyvault_settings_v1';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  groqApiKey: '',
  aiModel: 'llama-3.3-70b-versatile',
  aiBaseUrl: 'https://api.groq.com/openai/v1',
  performanceMode: false,
  appLockEnabled: false,
  lockTimeoutMs: 60000,
  hasAcceptedPrivacyNotice: false,
  seedColor: '#6750a4', // Default Violet seed
  themeMode: 'dark', // Default Dark mode

  setGroqApiKey: (groqApiKey) => {
    set({ groqApiKey });
    saveToStorage(get());
  },

  setAiModel: (aiModel) => {
    set({ aiModel });
    saveToStorage(get());
  },

  setPerformanceMode: (performanceMode) => {
    set({ performanceMode });
    if (typeof document !== 'undefined') {
      if (performanceMode) {
        document.body.classList.add('perf-mode');
      } else {
        document.body.classList.remove('perf-mode');
      }
    }
    saveToStorage(get());
  },

  setAppLockEnabled: (appLockEnabled) => {
    set({ appLockEnabled });
    saveToStorage(get());
  },

  setHasAcceptedPrivacyNotice: (hasAcceptedPrivacyNotice) => {
    set({ hasAcceptedPrivacyNotice });
    saveToStorage(get());
  },

  setSeedColor: (seedColor) => {
    set({ seedColor });
    applyTheme(seedColor, get().themeMode);
    saveToStorage(get());
  },

  setThemeMode: (themeMode) => {
    set({ themeMode });
    applyTheme(get().seedColor, themeMode);
    saveToStorage(get());
  },

  loadSettings: () => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set(parsed);
        if (parsed.performanceMode && typeof document !== 'undefined') {
          document.body.classList.add('perf-mode');
        }
        applyTheme(parsed.seedColor || '#6750a4', parsed.themeMode || 'dark');
      } else {
        applyTheme('#6750a4', 'dark');
      }
    } catch (e) {
      console.warn('Could not load settings from storage', e);
      applyTheme('#6750a4', 'dark');
    }
  },
}));

function saveToStorage(state: SettingsState) {
  try {
    const toSave = {
      groqApiKey: state.groqApiKey,
      aiModel: state.aiModel,
      aiBaseUrl: state.aiBaseUrl,
      performanceMode: state.performanceMode,
      appLockEnabled: state.appLockEnabled,
      lockTimeoutMs: state.lockTimeoutMs,
      hasAcceptedPrivacyNotice: state.hasAcceptedPrivacyNotice,
      seedColor: state.seedColor,
      themeMode: state.themeMode,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Could not save settings to storage', e);
  }
}
