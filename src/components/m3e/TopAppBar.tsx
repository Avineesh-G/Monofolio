import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface TopAppBarProps {
  title: string;
  subtitle?: string;
  leadingAction?: React.ReactNode;
  trailingAction?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  leadingAction,
  trailingAction,
  onBack,
  className = '',
}) => {
  return (
    <header
      className={`sticky top-0 z-30 w-full px-4 py-3 bg-[var(--md-sys-color-surface)] shadow-sm shadow-black/10 dark:shadow-black/30 flex items-center justify-between gap-3 select-none transition-shadow ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/10 text-on-surface active:scale-90 transition-transform focus:outline-none cursor-pointer"
            aria-label="Navigate back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2px]" />
          </button>
        ) : leadingAction ? (
          <div className="shrink-0">{leadingAction}</div>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)] truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-medium truncate pt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {trailingAction && <div className="shrink-0 flex items-center gap-2">{trailingAction}</div>}
    </header>
  );
};
