import React from 'react';
import { motion } from 'framer-motion';
import { useMotionPreset } from '../../theme/motion';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated' | 'error';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonShape = 'round' | 'square' | 'pill' | 'squircle';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1 m3-label-medium',
  sm: 'h-9 px-3.5 text-xs gap-1.5 m3-label-large',
  md: 'h-11 px-4 text-sm gap-2 m3-label-large',
  lg: 'h-13 px-5 text-base gap-2.5 m3-title-medium-emp',
  xl: 'h-15 px-6 text-lg gap-3 m3-title-large-emp',
};

const SHAPE_CLASSES: Record<ButtonShape, string> = {
  round: 'rounded-full',
  pill: 'rounded-full',
  square: 'rounded-2xl',
  squircle: 'rounded-2xl',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary hover:opacity-95 shadow-none',
  tonal: 'bg-secondary-container text-on-secondary-container hover:bg-opacity-80',
  outlined: 'border border-outline text-primary hover:bg-surface-container',
  text: 'text-primary hover:bg-surface-container',
  elevated: 'bg-surface-container-high text-primary hover:bg-surface-bright shadow-sm',
  error: 'bg-error text-on-error hover:opacity-95',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'filled',
  size = 'md',
  shape = 'round',
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  className = '',
  disabled = false,
  children,
  onClick,
  ...props
}, ref) => {
  const motionPreset = useMotionPreset();

  return (
    <motion.button
      ref={ref}
      whileTap={disabled ? undefined : motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-bold select-none cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        SIZE_CLASSES[size]
      } ${SHAPE_CLASSES[shape]} ${VARIANT_CLASSES[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...(props as any)}
    >
      {leadingIcon && <span className="shrink-0 flex items-center">{leadingIcon}</span>}
      <span className="truncate">{children}</span>
      {trailingIcon && <span className="shrink-0 flex items-center">{trailingIcon}</span>}
    </motion.button>
  );
});
Button.displayName = 'M3EButton';
