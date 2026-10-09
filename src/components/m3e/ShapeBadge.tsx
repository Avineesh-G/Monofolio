import React from 'react';
import { Shape, ShapeName } from '../../theme/shapes';

export interface ShapeBadgeProps {
  shape: ShapeName;
  size?: number;
  shapeFill?: string;
  icon?: React.ReactNode;
  className?: string;
  badgeContent?: React.ReactNode;
}

export const ShapeBadge: React.FC<ShapeBadgeProps> = React.memo(({
  shape,
  size = 44,
  shapeFill = 'var(--md-sys-color-primary-container)',
  icon,
  className = '',
  badgeContent,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Shape
        name={shape}
        size={size}
        fill={shapeFill}
        className="absolute inset-0"
      />
      {icon && (
        <div className="relative z-10 flex items-center justify-center pointer-events-none">
          {icon}
        </div>
      )}
      {badgeContent && (
        <div className="absolute -top-1 -right-1 z-20">
          {badgeContent}
        </div>
      )}
    </div>
  );
});
ShapeBadge.displayName = 'M3EShapeBadge';
