import React from 'react';
import { Shape, ShapeName } from '../../theme/shapes';

export interface ShapeBadgeProps {
  shape: ShapeName;
  size?: number;
  shapeFill?: string;
  icon?: React.ReactNode;
  glow?: boolean;
  glowColor?: string;
  className?: string;
  badgeContent?: React.ReactNode;
}

export const ShapeBadge: React.FC<ShapeBadgeProps> = React.memo(({
  shape,
  size = 44,
  shapeFill = 'var(--md-sys-color-primary-container)',
  icon,
  glow = false,
  glowColor,
  className = '',
  badgeContent,
}) => {
  return (
    <div
      className={'relative inline-flex items-center justify-center shrink-0 ' + className}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 pointer-events-none"
          style={{ backgroundColor: glowColor || shapeFill }}
        />
      )}
      <Shape
        name={shape}
        size={size}
        fill={shapeFill}
        className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
      />
      {icon && (
        <div className="relative z-10 flex items-center justify-center pointer-events-none drop-shadow-sm">
          {icon}
        </div>
      )}
      {badgeContent && (
        <div className="absolute -top-1 -right-1 z-20 shadow-sm">
          {badgeContent}
        </div>
      )}
    </div>
  );
});
ShapeBadge.displayName = 'M3EShapeBadge';
