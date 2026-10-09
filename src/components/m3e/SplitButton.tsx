import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';

export interface SplitButtonAction {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SplitButtonProps {
  primaryAction: SplitButtonAction;
  menuActions: SplitButtonAction[];
  onSelectAction: (actionId: string) => void;
  variant?: 'filled' | 'tonal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SplitButton: React.FC<SplitButtonProps> = ({
  primaryAction,
  menuActions,
  onSelectAction,
  variant = 'filled',
  size = 'md',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const motionPreset = useMotionPreset();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const heightClasses = {
    sm: 'h-9 text-xs',
    md: 'h-11 text-sm',
    lg: 'h-13 text-base',
  };

  const bgClasses =
    variant === 'filled'
      ? 'bg-primary text-on-primary'
      : 'bg-secondary-container text-on-secondary-container';

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      <div className={`inline-flex rounded-full overflow-hidden ${bgClasses} shadow-sm`}>
        {/* Main Action Button */}
        <motion.button
          type="button"
          whileTap={motionPreset.tapFeedback.whileTap}
          transition={motionPreset.tapFeedback.transition}
          onClick={() => onSelectAction(primaryAction.id)}
          className={`px-4 ${heightClasses[size]} font-bold flex items-center gap-2 hover:bg-black/10 transition-colors select-none`}
        >
          {primaryAction.icon}
          <span>{primaryAction.label}</span>
        </motion.button>

        {/* Divider hairline */}
        <div className="w-[1px] bg-white/20 my-2" />

        {/* Dropdown Toggle Button */}
        <motion.button
          type="button"
          whileTap={motionPreset.tapFeedback.whileTap}
          transition={motionPreset.tapFeedback.transition}
          onClick={() => setIsOpen(!isOpen)}
          className={`px-2.5 ${heightClasses[size]} flex items-center justify-center hover:bg-black/10 transition-colors select-none`}
          aria-label="More options"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </motion.button>
      </div>

      {/* Floating Menu Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={motionPreset.effectsFast}
            className="absolute right-0 top-full mt-2 z-50 min-w-[200px] p-2 rounded-2xl bg-surface-container-high text-on-surface border border-outline-variant/40 shadow-xl space-y-1"
          >
            {menuActions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  onSelectAction(action.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-highest transition-colors flex items-center gap-2.5"
              >
                {action.icon}
                <div>
                  <div className="m3-label-large text-on-surface font-bold">{action.label}</div>
                  {action.description && (
                    <div className="m3-label-medium text-on-surface-variant text-[11px]">
                      {action.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
