import React from 'react';
import { Shape } from '../../theme/shapes';

export interface ScallopRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  scallopFill?: string;
  showScallopBadge?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ScallopRing: React.FC<ScallopRingProps> = ({
  progress,
  size = 52,
  strokeWidth = 4.5,
  color = 'var(--md-sys-color-primary)',
  trackColor = 'var(--md-sys-color-surface-container-highest)',
  scallopFill = 'var(--md-sys-color-primary-container)',
  showScallopBadge = false,
  className = '',
  children,
}) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Optional decorative scallop shape behind */}
      {showScallopBadge && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90">
          <Shape name="cookie9" size={size * 0.96} fill={scallopFill} />
        </div>
      )}

      {/* Progress SVG Ring */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="rotate-[-90deg]"
      >
        {/* Track circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          className="opacity-50"
        />

        {/* Dynamic Progress indicator */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>

      {/* Center content / percentage */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {children ? (
          children
        ) : (
          <span className="font-mono text-[11px] font-bold text-on-surface">
            {Math.round(clamped)}%
          </span>
        )}
      </div>
    </div>
  );
};
