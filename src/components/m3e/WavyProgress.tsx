import React from 'react';

export interface WavyProgressProps {
  progress?: number; // 0 to 100
  indeterminate?: boolean;
  color?: string;
  trackColor?: string;
  height?: number;
  className?: string;
}

export const WavyProgress: React.FC<WavyProgressProps> = ({
  progress = 0,
  indeterminate = false,
  color = 'var(--md-sys-color-primary)',
  trackColor = 'var(--md-sys-color-surface-container-highest)',
  height = 10,
  className = '',
}) => {
  // Static SVG sine wave path from x=0 to x=300
  const wavePath =
    'M 0 5 Q 12.5 0 25 5 T 50 5 T 75 5 T 100 5 T 125 5 T 150 5 T 175 5 T 200 5 T 225 5 T 250 5 T 275 5 T 300 5';

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={`relative w-full overflow-hidden rounded-full ${className}`}
      style={{ height }}
    >
      {/* Background Track Wave */}
      <svg
        viewBox="0 0 300 10"
        preserveAspectRatio="none"
        className="w-full h-full opacity-40"
      >
        <path
          d={wavePath}
          fill="none"
          stroke={trackColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Progress Wave with CSS clip / transform */}
      <div
        className={`absolute inset-0 overflow-hidden transition-all duration-300 ease-out ${
          indeterminate ? 'animate-pulse' : ''
        }`}
        style={{
          width: indeterminate ? '100%' : `${clampedProgress}%`,
        }}
      >
        <svg
          viewBox="0 0 300 10"
          preserveAspectRatio="none"
          className={`w-full h-full ${indeterminate ? 'animate-bounce' : ''}`}
        >
          <path
            d={wavePath}
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
