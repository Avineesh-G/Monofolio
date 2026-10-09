import React, { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import {
  ShapeName,
  getShapePoints,
  interpolatePoints,
  pointsToSvgPath,
  Shape,
} from '../../theme/shapes';

export interface LoadingIndicatorProps {
  size?: number;
  color?: string;
  className?: string;
  label?: string;
}

const CYCLE_SHAPES: ShapeName[] = ['flower', 'cookie9', 'softBurst', 'clover4', 'gem', 'squircle'];

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 48,
  color = 'var(--md-sys-color-primary)',
  className = '',
  label,
}) => {
  const performanceMode = useSettingsStore((s) => s.performanceMode);
  const [currentPath, setCurrentPath] = useState<string>('');
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (performanceMode) return;

    let startTime = performance.now();
    let shapeIndex = 0;

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const duration = 1.2; // 1.2s per transition
      const progress = (elapsed % duration) / duration;

      const currentShape = CYCLE_SHAPES[shapeIndex % CYCLE_SHAPES.length];
      const nextShape = CYCLE_SHAPES[(shapeIndex + 1) % CYCLE_SHAPES.length];

      const ptsA = getShapePoints(currentShape);
      const ptsB = getShapePoints(nextShape);

      // Smooth cosine easing
      const eased = (1 - Math.cos(progress * Math.PI)) / 2;
      const mixed = interpolatePoints(ptsA, ptsB, eased);
      setCurrentPath(pointsToSvgPath(mixed));

      if (elapsed >= duration) {
        shapeIndex++;
        startTime = now;
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [performanceMode]);

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center animate-spin"
        style={{
          width: size,
          height: size,
          animationDuration: '6s',
        }}
      >
        {performanceMode ? (
          <Shape name="flower" size={size} fill={color} />
        ) : (
          <svg viewBox="0 0 100 100" width={size} height={size}>
            <path d={currentPath || getShapePoints('flower').toString()} fill={color} />
          </svg>
        )}
      </div>

      {label && (
        <span className="m3-label-large text-on-surface-variant font-medium animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};
