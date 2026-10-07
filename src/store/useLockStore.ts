import { create } from 'zustand';

interface LockState {
  isLocked: boolean;
  pin: string | null;
  lockTimeoutMs: number;
  lastActiveTimestamp: number;

  setPin: (pin: string | null) => void;
  removePin: () => void;
  setLockTimeout: (ms: number) => void;
  verifyPin: (enteredPin: string) => boolean;
  unlock: () => void;
  lock: () => void;
  updateActiveTimestamp: () => void;
  checkLockTimeout: () => void;
  initLock: () => void;
}

const PIN_KEY = 'studyvault_pin_hash';
const TIMEOUT_KEY = 'studyvault_lock_timeout';

export const useLockStore = create<LockState>((set, get) => ({
  isLocked: false,
  pin: null,
  lockTimeoutMs: 60000, // 1 minute default
  lastActiveTimestamp: Date.now(),

  setPin: (pin) => {
    set({ pin });
    if (pin) {
      localStorage.setItem(PIN_KEY, btoa(pin));
    } else {
      localStorage.removeItem(PIN_KEY);
    }
  },

  removePin: () => {
    set({ pin: null, isLocked: false });
    localStorage.removeItem(PIN_KEY);
  },

  setLockTimeout: (ms) => {
    set({ lockTimeoutMs: ms });
    localStorage.setItem(TIMEOUT_KEY, ms.toString());
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

  checkLockTimeout: () => {
    const { pin, isLocked, lastActiveTimestamp, lockTimeoutMs } = get();
    if (pin && !isLocked) {
      const elapsed = Date.now() - lastActiveTimestamp;
      if (elapsed > lockTimeoutMs) {
        set({ isLocked: true });
      }
    }
  },

  initLock: () => {
    try {
      const storedPin = localStorage.getItem(PIN_KEY);
      const storedTimeout = localStorage.getItem(TIMEOUT_KEY);

      const pin = storedPin ? atob(storedPin) : null;
      const timeout = storedTimeout ? parseInt(storedTimeout, 10) : 60000;

      set({
        pin,
        lockTimeoutMs: isNaN(timeout) ? 60000 : timeout,
        isLocked: Boolean(pin),
        lastActiveTimestamp: Date.now(),
      });
    } catch {
      // Ignore
    }
  }
}));
