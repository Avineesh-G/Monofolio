import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: boolean;
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  icon = true,
  className = '',
  id,
}) => {
  const motionPreset = useMotionPreset();

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-13 h-8 min-w-[52px] rounded-full p-1 transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        checked
          ? 'bg-primary border border-primary'
          : 'bg-surface-container-highest border border-outline-variant/60'
      } ${className}`}
    >
      <motion.div
        animate={{
          x: checked ? 20 : 0,
          width: checked ? 24 : 18,
          height: checked ? 24 : 18,
        }}
        transition={motionPreset.spatialFast}
        className={`rounded-full flex items-center justify-center shadow-md transition-colors ${
          checked ? 'bg-on-primary text-primary' : 'bg-outline text-surface-container-highest'
        }`}
      >
        {icon && checked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
        {icon && !checked && <X className="w-3 h-3 stroke-[3px]" />}
      </motion.div>
    </button>
  );
};
