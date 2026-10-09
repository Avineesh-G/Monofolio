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

  if (location.pathname.startsWith('/reader/')) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container border-t border-outline-variant/30 px-2 pt-1 pb-safe-bottom"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
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
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1 relative select-none group"
              aria-label={dest.label}
            >
              <div className="relative flex items-center justify-center w-16 h-8 rounded-full">
                {isActive && (
                  <motion.div
                    layoutId="m3e-nav-indicator"
                    className="absolute inset-0 bg-secondary-container rounded-full"
                    transition={motionPreset.spatialDefault}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? 'text-on-secondary-container stroke-[2.4px]'
                        : 'text-on-surface-variant group-hover:text-on-surface stroke-[1.8px]'
                    }`}
                  />
                  {dest.badgeCount && dest.badgeCount > 0 ? (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 min-w-[16px] h-4 rounded-full bg-error text-on-error text-[10px] font-bold font-mono flex items-center justify-center shadow-sm">
                      {dest.badgeCount > 99 ? '99+' : dest.badgeCount}
                    </span>
                  ) : null}
                </div>
              </div>

              <span
                className={`m3-label-medium text-[11px] transition-colors truncate max-w-[64px] ${
                  isActive
                    ? 'font-bold text-on-surface'
                    : 'font-medium text-on-surface-variant group-hover:text-on-surface'
                }`}
              >
                {dest.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
