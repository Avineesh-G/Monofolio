import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';

export type ChipVariant = 'filter' | 'assist' | 'input' | 'suggestion';

export interface ChipProps {
  label: React.ReactNode;
  variant?: ChipVariant;
  selected?: boolean;
  leadingIcon?: React.ReactNode;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  leadingIcon,
  onRemove,
  onClick,
  className = '',
  disabled = false,
}) => {
  const motionPreset = useMotionPreset();

  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-xl m3-label-large font-medium select-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        selected
          ? 'bg-secondary-container text-on-secondary-container font-semibold ring-1 ring-outline-variant/50'
          : 'bg-surface-container-low text-on-surface border border-outline-variant/40 hover:bg-surface-container'
      } ${className}`}
    >
      {selected ? (
        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
      ) : (
        leadingIcon && <span className="shrink-0 flex items-center">{leadingIcon}</span>
      )}
      <span className="truncate">{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-0.5 rounded-full hover:bg-black/10 text-on-surface-variant ml-0.5"
          aria-label="Remove"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.button>
  );
};
