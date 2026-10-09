import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  FolderOpen,
  Brain,
  Layers,
  LucideIcon,
} from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';
import { quizzesRepo } from '../../db/repos';

interface NavDestination {
  path: string;
  label: string;
  icon: LucideIcon;
  badgeCount?: number;
}

export const NavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const motionPreset = useMotionPreset();
  const [dueCount, setDueCount] = useState<number>(0);

  useEffect(() => {
    quizzesRepo.getDueCards().then((cards) => {
      setDueCount(cards.length);
    }).catch(() => {});
  }, [location.pathname]);

  const destinations: NavDestination[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/shelf', label: 'Shelf', icon: BookOpen },
    { path: '/library', label: 'Library', icon: FolderOpen },
    { path: '/coach', label: 'Coach', icon: Brain },
    { path: '/quiz', label: 'Quiz', icon: Layers, badgeCount: dueCount },
  ];

  if (location.pathname.startsWith('/reader/') || location.pathname.startsWith('/dev/')) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe-bottom select-none pointer-events-none"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-md mx-auto mb-2 p-1.5 rounded-full m3-glass-elevated border border-white/10 shadow-2xl pointer-events-auto flex items-center justify-around">
        {destinations.map((dest) => {
          const isActive =
            dest.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(dest.path);
          const Icon = dest.icon;

          return (
            <button
              key={dest.path}
              onClick={() => navigate(dest.path)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all group focus:outline-none"
              aria-label={dest.label}
            >
              {isActive && (
                <motion.div
                  layoutId="m3e-nav-pill-active"
                  className="absolute inset-0 bg-primary/15 border border-primary/30 rounded-full shadow-sm"
                  transition={motionPreset.spatialDefault}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={'w-5 h-5 transition-transform duration-200 group-active:scale-90 ' + (
                      isActive
                        ? 'text-primary stroke-[2.4px]'
                        : 'text-on-surface-variant group-hover:text-on-surface stroke-[1.8px]'
                    )}
                  />
                  {dest.badgeCount && dest.badgeCount > 0 ? (
                    <span className="absolute -top-1 -right-2.5 px-1 min-w-[15px] h-3.5 rounded-full bg-error text-on-error text-[9px] font-bold font-mono flex items-center justify-center shadow-md animate-pulse">
                      {dest.badgeCount > 99 ? '99+' : dest.badgeCount}
                    </span>
                  ) : null}
                </div>

                <span
                  className={'text-[10px] font-bold tracking-tight transition-colors truncate max-w-[56px] ' + (
                    isActive
                      ? 'text-primary'
                      : 'text-on-surface-variant/80 group-hover:text-on-surface'
                  )}
                >
                  {dest.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
