import React from 'react';
import { motion } from 'framer-motion';
import { useMotionPreset } from '../../theme/motion';

export interface ButtonGroupOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  activeColor?: string;
}

export interface ButtonGroupProps<T extends string | number> {
  options: ButtonGroupOption<T>[];
  value: T;
  onChange: (val: T) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export function ButtonGroup<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  fullWidth = false,
}: ButtonGroupProps<T>) {
  const motionPreset = useMotionPreset();

  const heightClasses = {
    sm: 'h-9 text-xs',
    md: 'h-11 text-sm',
    lg: 'h-13 text-base',
  };

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-surface-container-low border border-outline-variant/40 ${
        fullWidth ? 'w-full flex' : ''
      } ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;

        return (
          <motion.button
            key={String(opt.value)}
            type="button"
            whileTap={motionPreset.tapFeedback.whileTap}
            transition={motionPreset.tapFeedback.transition}
            onClick={() => onChange(opt.value)}
            className={`relative px-3.5 ${heightClasses[size]} font-bold rounded-full flex items-center justify-center gap-1.5 transition-all select-none ${
              fullWidth ? 'flex-1' : ''
            } ${
              isSelected
                ? 'bg-secondary-container text-on-secondary-container shadow-sm z-10'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
