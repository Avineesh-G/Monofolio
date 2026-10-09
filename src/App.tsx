import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from './app/routes';
import { BottomNav } from './components/BottomNav';
import { Skeleton } from './components/Skeleton';
import { useLibraryStore } from './store/useLibraryStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useLockStore } from './store/useLockStore';
import { useAuthStore } from './store/useAuthStore';
import { AuthGateScreen } from './features/auth/AuthGateScreen';
import { Lock, Loader2 } from 'lucide-react';

const RouteRenderer: React.FC = () => {
  const element = useRoutes(routes);
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      }
    >
      {element}
    </Suspense>
  );
};

export const App: React.FC = () => {
  const loadInitialData = useLibraryStore(state => state.loadInitialData);
  const loadSettings = useSettingsStore(state => state.loadSettings);
  
  const { user, initialized, initializeAuth } = useAuthStore();

  const isLocked = useLockStore(state => state.isLocked);
  const verifyPin = useLockStore(state => state.verifyPin);
  const unlock = useLockStore(state => state.unlock);
  const initLock = useLockStore(state => state.initLock);
  const checkLockTimeout = useLockStore(state => state.checkLockTimeout);
  const updateActiveTimestamp = useLockStore(state => state.updateActiveTimestamp);

  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    loadSettings();
    initializeAuth();
    initLock();
    loadInitialData();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateActiveTimestamp();
      } else {
        checkLockTimeout();
      }
    };

    const handleUserActivity = () => {
      updateActiveTimestamp();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [loadInitialData, loadSettings, initializeAuth, initLock, checkLockTimeout, updateActiveTimestamp]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPin(enteredPin)) {
      unlock();
      setEnteredPin('');
      setPinError(false);
    } else {
      setPinError(true);
      setEnteredPin('');
    }
  };

  // 1. Initial Authentication Loading State
  if (!initialized) {
    return (
      <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
        <p className="text-xs font-mono text-on-surface-variant">Connecting to Monofolio Vault...</p>
      </div>
    );
  }

  // 2. Mandatory Authentication Gate - Only Gmail / Email Login permitted
  if (!user) {
    return <AuthGateScreen />;
  }

  // 3. Security PIN Lock Gate
  if (isLocked) {
    return (
      <div className="h-full w-full bg-surface text-on-surface flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-primary/20 text-primary flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-lg font-bold text-on-surface mb-1">Monofolio is Locked</h1>
        <p className="text-xs text-on-surface-variant mb-6">Enter your security PIN to access your study materials.</p>

        <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-3">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={enteredPin}
            onChange={(e) => {
              setEnteredPin(e.target.value);
              setPinError(false);
            }}
            placeholder="Enter PIN"
            className="w-full text-center tracking-widest text-lg px-4 py-3 rounded-xl bg-surface-container-high border-none text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          {pinError && <p className="text-xs text-error">Incorrect PIN. Try again.</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm active:scale-98 transition-all cursor-pointer"
          >
            Unlock Vault
          </button>
        </form>
      </div>
    );
  }

  // 4. Authenticated Application
  return (
    <BrowserRouter>
      <div className="h-full w-full flex flex-col bg-surface text-on-surface overflow-hidden relative">
        {/* Main Content Area - Momentum Scrolling */}
        <main className="flex-1 overflow-y-auto scroll-container relative overscroll-y-contain">
          <RouteRenderer />
        </main>

        {/* Mobile Bottom Dock (3 Tabs + Beside '+' FAB) */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
};
