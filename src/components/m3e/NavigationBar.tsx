import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Brain, LucideIcon } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';

export interface NavTabItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
}

export interface NavigationBarProps {
  trailingAction?: React.ReactNode;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ trailingAction }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const motionPreset = useMotionPreset();

  if (location.pathname.startsWith('/reader/') || location.pathname.startsWith('/dev/')) {
    return null;
  }

  // 3 Core Mobile Destinations
  const tabs: NavTabItem[] = [
    { id: 'home', path: '/', label: 'Home', icon: Home },
    { id: 'shelf', path: '/shelf', label: 'Shelf', icon: Compass },
    { id: 'coach', path: '/coach', label: 'Coach', icon: Brain },
  ];

  return (
    <nav
      className="fixed bottom-4 inset-x-0 z-30 flex items-center justify-center gap-2.5 px-3 pointer-events-none select-none max-w-lg mx-auto"
      aria-label="Mobile Bottom Navigation"
    >
      {/* 3-Tab Floating Pill Dock (Exact Height: 54px) */}
      <div className="pointer-events-auto h-[54px] w-[240px] flex items-center justify-between px-3 rounded-full bg-surface-container-high/95 dark:bg-[#18111c]/95 backdrop-blur-3xl border border-outline-variant/30 dark:border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.65)] ring-1 ring-black/20 shrink-0">
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
              className="relative flex-1 py-0.5 rounded-full flex flex-col items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer group"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Soft Refined M3 Filled Pill Indicator */}
              <div className="relative w-12 h-6.5 flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="m3e-active-tab-pill"
                    transition={motionPreset.spatialDefault}
                    className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/25"
                  />
                )}

                <Icon
                  className={`w-4.5 h-4.5 relative z-10 transition-all duration-200 ${
                    isActive
                      ? 'text-primary scale-105 stroke-[2.4px]'
                      : 'text-on-surface-variant group-hover:text-on-surface stroke-[1.8px]'
                  }`}
                />
              </div>

              {/* Tab Label */}
              <span
                className={`relative z-10 text-[10px] font-bold mt-0.5 tracking-tight transition-all duration-200 leading-none ${
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

      {/* '+' Action Button Sits Perfectly Aligned (Exact Height: 54px) */}
      {trailingAction && (
        <div className="pointer-events-auto shrink-0 flex items-center">
          {trailingAction}
        </div>
      )}
    </nav>
  );
};
