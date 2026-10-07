import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from './app/routes';
import { BottomNav } from './components/BottomNav';
import { FloatingAddButton } from './components/FloatingAddButton';
import { Skeleton } from './components/Skeleton';
import { useLibraryStore } from './store/useLibraryStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useLockStore } from './store/useLockStore';
import { startFpsMeter, stopFpsMeter } from './lib/perf';
import { Lock, Zap } from 'lucide-react';

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
  const performanceMode = useSettingsStore(state => state.performanceMode);
  
  const isLocked = useLockStore(state => state.isLocked);
  const verifyPin = useLockStore(state => state.verifyPin);
  const unlock = useLockStore(state => state.unlock);
  const initLock = useLockStore(state => state.initLock);
  const checkLockTimeout = useLockStore(state => state.checkLockTimeout);
  const updateActiveTimestamp = useLockStore(state => state.updateActiveTimestamp);

  const [fps, setFps] = useState(60);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    loadSettings();
    initLock();
    loadInitialData();

    // Start FPS monitor in development
    startFpsMeter((currentFps) => {
      setFps(currentFps);
    });

    // App backgrounding & lock gate listeners
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
      stopFpsMeter();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [loadInitialData, loadSettings, initLock, checkLockTimeout, updateActiveTimestamp]);

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

  // Lock Gate Screen if locked
  if (isLocked) {
    return (
      <div className="h-full w-full bg-bg flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-accent-muted text-accent flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-lg font-bold text-text-primary mb-1">StudyVault is Locked</h1>
        <p className="text-xs text-text-secondary mb-6">Enter your security PIN to access your study materials.</p>

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
            className="w-full text-center tracking-widest text-lg px-4 py-3 rounded-xl bg-bg-tertiary border border-border-subtle text-text-primary focus:outline-none focus:border-accent"
            autoFocus
          />
          {pinError && <p className="text-xs text-rose-400">Incorrect PIN. Try again.</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm active:scale-98 transition-all"
          >
            Unlock Vault
          </button>
        </form>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="h-full w-full flex flex-col bg-bg overflow-hidden relative select-none">
        {/* Dev FPS Meter & Perf Indicator */}
        <div className="fixed top-2 right-3 z-50 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 border border-white/10 text-[10px] font-mono text-emerald-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{fps} FPS</span>
          {performanceMode && (
            <span className="text-amber-400 font-semibold flex items-center gap-0.5">
              <Zap size={10} /> PERF
            </span>
          )}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          <RouteRenderer />
        </main>

        {/* Floating Add Item Button */}
        <FloatingAddButton />

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
};
