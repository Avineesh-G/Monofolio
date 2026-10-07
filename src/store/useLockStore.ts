import { create } from 'zustand';

interface LockState {
  isLocked: boolean;
  pin: string | null;
  lastActiveTimestamp: number;

  setPin: (pin: string | null) => void;
  verifyPin: (enteredPin: string) => boolean;
  unlock: () => void;
  lock: () => void;
  updateActiveTimestamp: () => void;
  checkLockTimeout: (timeoutMs: number) => void;
  initLock: () => void;
}

const PIN_KEY = 'studyvault_pin_hash';

export const useLockStore = create<LockState>((set, get) => ({
  isLocked: false,
  pin: null,
  lastActiveTimestamp: Date.now(),

  setPin: (pin) => {
    set({ pin });
    if (pin) {
      localStorage.setItem(PIN_KEY, btoa(pin));
    } else {
      localStorage.removeItem(PIN_KEY);
    }
  },

  verifyPin: (enteredPin) => {
    const { pin } = get();
    if (!pin) return true;
    return pin === enteredPin;
  },

  unlock: () => {
    set({ isLocked: false, lastActiveTimestamp: Date.now() });
  },

  lock: () => {
    if (get().pin) {
      set({ isLocked: true });
    }
  },

  updateActiveTimestamp: () => {
    set({ lastActiveTimestamp: Date.now() });
  },

  checkLockTimeout: (timeoutMs) => {
    const { pin, isLocked, lastActiveTimestamp } = get();
    if (pin && !isLocked) {
      if (Date.now() - lastActiveTimestamp > timeoutMs) {
        set({ isLocked: true });
      }
    }
  },

  initLock: () => {
    try {
      const stored = localStorage.getItem(PIN_KEY);
      if (stored) {
        const decodedPin = atob(stored);
        set({ pin: decodedPin, isLocked: true });
      }
    } catch {
      // Ignore
    }
  }
}));
