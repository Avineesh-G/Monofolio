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
    const computedW = width || size || 72;
    const computedH = height || (typeof size === 'number' ? Math.round(size * 1.15) : 83);

    return (
      <svg
        viewBox="0 0 160 184"
        width={computedW}
        height={computedH}
        className={`shrink-0 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="monoCardDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a0710" />
            <stop offset="50%" stopColor="#0f0309" />
            <stop offset="100%" stopColor="#070104" />
          </linearGradient>
          <linearGradient id="monoGoldDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eee8dc" />
            <stop offset="100%" stopColor="#ded8c7" />
          </linearGradient>
          <filter id="monofolioShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Outer Frame with Smooth Corner Curvature (160x184 with rx=34) */}
        <rect
          width="160"
          height="184"
          rx="34"
          className="fill-[url(#monoCardDarkGrad)]"
          filter="url(#monofolioShadow)"
        />

        {/* Authentic Monogram Geometric Mark */}
        <g className="fill-[url(#monoGoldDark)]">
          {/* Main Prismatic Chevron Polygon */}
          <polygon points="80,38 98,74 80,110 62,146 44,110" />
          {/* Secondary Inverted Triangle Facet */}
          <polygon points="80,110 116,110 98,146" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={typeof size === 'number' ? Math.round(size * 1.2) : size}
      className={`shrink-0 fill-current ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main Prismatic Chevron Polygon */}
      <polygon points="50,6 68,42 50,78 32,114 14,78" />
      {/* Secondary Inverted Triangle Facet */}
      <polygon points="50,78 86,78 68,114" />
    </svg>
  );
};
