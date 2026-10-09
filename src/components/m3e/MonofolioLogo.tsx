import React from 'react';

export interface MonofolioLogoProps {
  size?: number | string;
  className?: string;
  variant?: 'glyph' | 'framed';
}

export const MonofolioLogo: React.FC<MonofolioLogoProps> = ({
  size = 40,
  className = '',
  variant = 'glyph',
}) => {
  if (variant === 'framed') {
    return (
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className={`shrink-0 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="monoDarkBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e080d" />
            <stop offset="50%" stopColor="#140508" />
            <stop offset="100%" stopColor="#0d0305" />
          </linearGradient>
          <linearGradient id="monoLightBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fcf8f6" />
            <stop offset="50%" stopColor="#f5efe9" />
            <stop offset="100%" stopColor="#eae0d6" />
          </linearGradient>
        </defs>

        <rect
          width="512"
          height="512"
          rx="112"
          className="fill-[url(#monoLightBgGrad)] dark:fill-[url(#monoDarkBgGrad)] stroke-outline-variant/20"
        />

        <g className="fill-on-surface dark:fill-[#e8e2d2]">
          <polygon points="270,140 322,214 268,296 216,372 164,296" />
          <polygon points="268,296 372,296 320,372" />
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
