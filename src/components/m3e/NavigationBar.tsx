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
      className="fixed bottom-3 inset-x-0 z-30 flex justify-center px-4 pointer-events-none select-none"
      aria-label="Bottom Navigation"
    >
      <div className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-surface-container-high/95 backdrop-blur-2xl shadow-2xl">
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
              className={`relative px-3.5 py-2 rounded-full flex flex-col items-center justify-center transition-colors focus:outline-none cursor-pointer ${
                isActive ? 'text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="m3e-active-nav-indicator"
                  transition={motionPreset.spatialDefault}
                  className="absolute inset-0 rounded-full bg-primary-container shadow-sm"
                />
              )}

              <div className="relative z-10 flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-error text-on-error text-[10px] font-mono font-bold leading-tight shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`relative z-10 text-[10px] font-bold mt-0.5 tracking-tight transition-all duration-200 ${
                isActive ? 'opacity-100 font-extrabold text-on-primary-container' : 'opacity-70 text-on-surface-variant'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
