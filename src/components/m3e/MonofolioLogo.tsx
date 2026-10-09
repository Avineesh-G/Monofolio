import React from 'react';

export interface MonofolioLogoProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  variant?: 'glyph' | 'framed';
}

export const MonofolioLogo: React.FC<MonofolioLogoProps> = ({
  size = 48,
  width,
  height,
  className = '',
  variant = 'glyph',
}) => {
  if (variant === 'framed') {
    const computedW = width || size || 80;
    const computedH = height || (typeof size === 'number' ? size * 1.35 : 108);

    return (
      <svg
        viewBox="0 0 160 216"
        width={computedW}
        height={computedH}
        className={`shrink-0 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="monoCardDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e060c" />
            <stop offset="50%" stopColor="#120307" />
            <stop offset="100%" stopColor="#080103" />
          </linearGradient>
          <linearGradient id="monoCardLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdfbf9" />
            <stop offset="50%" stopColor="#f4ece4" />
            <stop offset="100%" stopColor="#e8ded2" />
          </linearGradient>
          <linearGradient id="monoGoldDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ebe6d8" />
            <stop offset="100%" stopColor="#d5cebd" />
          </linearGradient>
          <linearGradient id="monoGoldLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2c1117" />
            <stop offset="100%" stopColor="#180408" />
          </linearGradient>
          <filter id="monofolioShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Outer Frame with Smooth Corner Curvature */}
        <rect
          width="160"
          height="216"
          rx="38"
          className="fill-[url(#monoCardDarkGrad)]"
          filter="url(#monofolioShadow)"
        />

        {/* Monogram Geometric Mark */}
        <g className="fill-[url(#monoGoldDark)]">
          {/* Main Prismatic Diamond Polygon */}
          <polygon points="85,56 102,89 84,126 67,160 50,126" />
          {/* Secondary Downward Triangle Inset */}
          <polygon points="84,126 117,126 101,160" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={`shrink-0 fill-current ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="135,32 161,69 134,110 108,148 82,110" />
      <polygon points="134,110 186,110 160,148" />
    </svg>
  );
};
