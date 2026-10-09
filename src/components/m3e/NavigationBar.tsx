import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, BookOpen, Layers, Brain, Settings, LucideIcon } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';
import { db } from '../../db';

export interface NavTabItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
}

export const NavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const motionPreset = useMotionPreset();
  const [dueCardsCount, setDueCardsCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const loadDueCount = async () => {
      try {
        const count = await db.flashcards.where('dueAt').belowOrEqual(Date.now()).count();
        if (isMounted) setDueCardsCount(count);
      } catch {
        // Fallback silently if table not yet populated
      }
    };
    loadDueCount();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (location.pathname.startsWith('/reader/') || location.pathname.startsWith('/dev/')) {
    return null;
  }

  const tabs: NavTabItem[] = [
    { id: 'home', path: '/', label: 'Home', icon: Home },
    { id: 'shelf', path: '/shelf', label: 'Shelf', icon: Compass },
    { id: 'library', path: '/library', label: 'Library', icon: BookOpen },
    {
      id: 'quiz',
      path: '/quiz',
      label: 'Quiz',
      icon: Layers,
      badge: dueCardsCount > 0 ? dueCardsCount : undefined,
    },
    { id: 'coach', path: '/coach', label: 'Coach', icon: Brain },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-4 inset-x-0 z-30 flex justify-center px-4 pointer-events-none select-none"
      aria-label="Bottom Navigation"
    >
      {/* Floating Rounded Dock Container with distinct border & shadow */}
      <div className="pointer-events-auto flex items-center justify-between gap-1 px-3 py-2 rounded-full bg-surface-container-high/95 dark:bg-[#1a121e]/95 backdrop-blur-2xl border border-outline-variant/30 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.55)] ring-1 ring-black/10 max-w-md w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="relative flex-1 py-1 px-1 rounded-full flex flex-col items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer group"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active Pill Capsule (Comfortably bounds the icon inside the dock) */}
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="m3e-active-nav-pill"
                    transition={motionPreset.spatialDefault}
                    className="absolute -inset-x-3 -inset-y-1 rounded-full bg-primary/20 dark:bg-primary/25 border border-primary/30 shadow-sm"
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive
                        ? 'text-primary scale-110 stroke-[2.4px]'
                        : 'text-on-surface-variant group-hover:text-on-surface stroke-[1.8px]'
                    }`}
                  />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full bg-error text-on-error text-[9px] font-mono font-bold leading-tight shadow-sm">
                      {tab.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Tab Label */}
              <span
                className={`relative z-10 text-[10px] font-bold mt-1 tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'text-primary font-extrabold opacity-100'
                    : 'text-on-surface-variant group-hover:text-on-surface opacity-75'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
