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
      bg: 'bg-secondary-container text-on-secondary-container',
      shapeFill: 'rgba(0, 0, 0, 0.12)',
      iconColor: 'text-on-secondary-container',
    },
    tertiary: {
      bg: 'bg-tertiary-container text-on-tertiary-container',
      shapeFill: 'rgba(0, 0, 0, 0.12)',
      iconColor: 'text-on-tertiary-container',
    },
    primary: {
      bg: 'bg-primary-container text-on-primary-container',
      shapeFill: 'rgba(0, 0, 0, 0.12)',
      iconColor: 'text-on-primary-container',
    },
    surface: {
      bg: 'bg-surface-container-high text-on-surface',
      shapeFill: 'var(--md-sys-color-surface-container-highest)',
      iconColor: 'text-primary',
    },
  }[variant];

  return (
    <motion.div
      whileTap={onClick ? motionPreset.tapFeedback.whileTap : undefined}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      style={{
        borderTopLeftRadius: '28px',
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '20px',
        borderBottomLeftRadius: '12px',
      }}
      className={`p-4 ${variantStyles.bg} border border-outline-variant/30 flex flex-col justify-between min-h-[110px] select-none shadow-sm ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Icon Badge & Top Label */}
      <div className="flex items-center justify-between">
        <ShapeBadge
          shape={shape}
          size={38}
          shapeFill={variantStyles.shapeFill}
          icon={<Icon className={`w-4 h-4 ${variantStyles.iconColor} stroke-[2.2px]`} />}
        />
        {sublabel && (
          <span className="m3-label-medium text-[10px] uppercase font-mono font-bold opacity-80">
            {sublabel}
          </span>
        )}
      </div>

      {/* Big Number & Label */}
      <div className="pt-2">
        <div className="m3-headline-large-emp tracking-tight leading-none">
          {value}
        </div>
        <p className="m3-label-medium text-xs font-medium pt-1 opacity-90 truncate">
          {label}
        </p>
      </div>
    </motion.div>
  );
};
