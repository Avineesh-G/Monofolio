import React from 'react';
import { motion } from 'framer-motion';
import { useMotionPreset } from '../../theme/motion';
import { Check } from 'lucide-react';

export interface ToggleButtonProps {
  selected: boolean;
  onToggle: (selected: boolean) => void;
  children: React.ReactNode;
  leadingIcon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  selected,
  onToggle,
  children,
  leadingIcon,
  className = '',
  size = 'md',
}) => {
  const motionPreset = useMotionPreset();

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'h-11 px-4 text-sm gap-2',
    lg: 'h-13 px-5 text-base gap-2.5',
  };

  return (
    <motion.button
      type="button"
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={() => onToggle(!selected)}
      className={`inline-flex items-center justify-center font-bold transition-all duration-200 select-none cursor-pointer ${
        sizeClasses[size]
      } ${
        selected
          ? 'rounded-2xl bg-secondary-container text-on-secondary-container ring-1 ring-outline-variant/50'
          : 'rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high'
      } ${className}`}
    >
      {selected ? (
        <Check className="w-4 h-4 shrink-0 text-primary" />
      ) : (
        leadingIcon && <span className="shrink-0">{leadingIcon}</span>
      )}
      <span className="truncate">{children}</span>
    </motion.button>
  );
};
