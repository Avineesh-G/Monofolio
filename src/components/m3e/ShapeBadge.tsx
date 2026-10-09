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
}

export const ShapeBadge: React.FC<ShapeBadgeProps> = ({
  shape,
  size = 40,
  shapeFill = 'rgba(208, 188, 255, 0.2)',
  icon,
  glow = false,
  glowColor = 'rgba(208, 188, 255, 0.25)',
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        filter: glow ? `drop-shadow(0 0 12px ${glowColor})` : undefined,
      }}
    >
      <Shape
        name={shape}
        size={size}
        fill={shapeFill}
        className="absolute inset-0"
      />
      {icon && <div className="relative z-10 flex items-center justify-center">{icon}</div>}
    </div>
  );
};
