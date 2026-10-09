import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface TopAppBarAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export interface TopAppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: TopAppBarAction[];
  trailingAction?: React.ReactNode;
  largeTitle?: boolean;
  className?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions = [],
  trailingAction,
  largeTitle = false,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 bg-surface/90 backdrop-blur-md px-4 pt-3 pb-3 border-b border-outline-variant/30 flex flex-col gap-1 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between min-h-[44px]">
        {/* Leading Back / Title */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {!largeTitle && (
            <div className="min-w-0">
              <h1 className="m3-title-large-emp text-on-surface truncate">{title}</h1>
              {subtitle && (
                <p className="m3-label-medium text-on-surface-variant truncate">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Trailing Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {trailingAction ? (
            trailingAction
          ) : (
            actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
                aria-label={action.label}
                title={action.label}
              >
                {action.icon}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Large flexible headline variant */}
      {largeTitle && (
        <div className="pt-2 pb-1">
          <h1 className="m3-headline-medium-emp text-on-surface tracking-tight leading-snug">
            {title}
          </h1>
          {subtitle && (
            <p className="m3-body-medium text-on-surface-variant pt-0.5">{subtitle}</p>
          )}
        </div>
      )}
    </header>
  );
};
