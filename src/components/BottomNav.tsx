import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FolderKanban, Library, Bot, MoreHorizontal, type LucideIcon } from 'lucide-react';
import { m } from 'framer-motion';
import { cn } from '../lib/utils';
import { useSettingsStore } from '../store/useSettingsStore';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Today', icon: Home },
  { to: '/shelf', label: 'Shelf', icon: FolderKanban },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/coach', label: 'Coach', icon: Bot },
  { to: '/more', label: 'More', icon: MoreHorizontal },
];

export const BottomNav: React.FC = () => {
  const performanceMode = useSettingsStore(state => state.performanceMode);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-border-subtle bg-bg-secondary/95 px-2 safe-bottom',
        !performanceMode && 'backdrop-blur-md'
      )}
      style={{
        transform: 'translateZ(0)', // Promote to its own composited layer
        willChange: 'transform',
      }}
    >
      <div className="flex h-full items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[11px] font-medium transition-colors',
                  isActive ? 'text-accent font-semibold' : 'text-text-muted hover:text-text-secondary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <m.div
                      layoutId="navPill"
                      className="absolute inset-0 rounded-xl bg-accent-muted -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <div className="relative">
                    <Icon size={20} className={cn('transition-transform duration-150', isActive && 'scale-110 text-accent')} />
                  </div>
                  <span className="mt-1 leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
