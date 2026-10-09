import React from 'react';
import { motion } from 'framer-motion';
import { ShapeBadge } from '../ShapeBadge';
import { ShapeName } from '../../../theme/shapes';
import { useMotionPreset } from '../../../theme/motion';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  shape?: ShapeName;
  variant?: 'secondary' | 'tertiary' | 'primary' | 'surface';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sublabel,
  icon: Icon,
  shape = 'squircle',
  variant = 'secondary',
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  const variantStyles = {
    secondary: {
      bg: 'bg-secondary-container/90 text-on-secondary-container',
      shapeFill: 'rgba(204, 194, 220, 0.2)',
      iconColor: 'text-secondary',
      glow: 'rgba(204, 194, 220, 0.25)',
    },
    tertiary: {
      bg: 'bg-tertiary-container/90 text-on-tertiary-container',
      shapeFill: 'rgba(239, 184, 200, 0.2)',
      iconColor: 'text-tertiary',
      glow: 'rgba(239, 184, 200, 0.25)',
    },
    primary: {
      bg: 'bg-primary-container/90 text-on-primary-container',
      shapeFill: 'rgba(208, 188, 255, 0.2)',
      iconColor: 'text-primary',
      glow: 'rgba(208, 188, 255, 0.25)',
    },
    surface: {
      bg: 'bg-surface-container-high text-on-surface',
      shapeFill: 'rgba(255, 255, 255, 0.1)',
      iconColor: 'text-primary',
      glow: 'rgba(208, 188, 255, 0.15)',
    },
  }[variant];

  return (
    <motion.div
      whileTap={onClick ? motionPreset.tapFeedback.whileTap : undefined}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-4 rounded-[24px] ${variantStyles.bg} flex flex-col justify-between min-h-[114px] select-none shadow-md backdrop-blur-md ${
        onClick ? 'cursor-pointer active:scale-98 transition-transform' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <ShapeBadge
          shape={shape}
          size={38}
          shapeFill={variantStyles.shapeFill}
          glow
          glowColor={variantStyles.glow}
          icon={<Icon className={`w-4 h-4 ${variantStyles.iconColor} stroke-[2.2px]`} />}
        />
        {sublabel && (
          <span className="text-[10px] uppercase font-mono font-bold text-on-surface-variant/80 tracking-wider">
            {sublabel}
          </span>
        )}
      </div>

      <div className="pt-2">
        <div className="text-2xl font-extrabold tracking-tight leading-none text-on-surface">
          {value}
        </div>
        <p className="text-xs font-medium pt-1 text-on-surface-variant truncate">
          {label}
        </p>
      </div>
    </motion.div>
  );
};
