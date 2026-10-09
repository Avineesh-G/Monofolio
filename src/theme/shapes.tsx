import React from 'react';

export const NUM_SHAPE_POINTS = 96;

export type ShapeName =
  | 'circle'
  | 'squircle'
  | 'pill'
  | 'cookie4'
  | 'cookie6'
  | 'cookie7'
  | 'cookie9'
  | 'cookie12'
  | 'flower'
  | 'clover4'
  | 'clover8'
  | 'softBurst'
  | 'burst'
  | 'puffy'
  | 'diamond'
  | 'triangle'
  | 'pentagon'
  | 'hexagon'
  | 'arch'
  | 'heart'
  | 'gem';

export const SHAPE_NAMES: ShapeName[] = [
  'circle',
  'squircle',
  'pill',
  'cookie4',
  'cookie6',
  'cookie7',
  'cookie9',
  'cookie12',
  'flower',
  'clover4',
  'clover8',
  'softBurst',
  'burst',
  'puffy',
  'diamond',
  'triangle',
  'pentagon',
  'hexagon',
  'arch',
  'heart',
  'gem',
];

export interface Point {
  x: number;
  y: number;
}

/**
 * Generate 96 sampled points for a given shape in a 0..100 bounding box
 */
function generateRawPoints(name: ShapeName): Point[] {
  const points: Point[] = [];
  const cx = 50;
  const cy = 50;

  for (let i = 0; i < NUM_SHAPE_POINTS; i++) {
    const theta = (i / NUM_SHAPE_POINTS) * 2 * Math.PI - Math.PI / 2;
    let x = cx;
    let y = cy;

    switch (name) {
      case 'circle': {
        const r = 46;
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'squircle': {
        // Superellipse: |x|^4 + |y|^4 = R^4
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        const r = 46 / Math.pow(Math.pow(Math.abs(ct), 3.8) + Math.pow(Math.abs(st), 3.8), 1 / 3.8);
        x = cx + r * ct;
        y = cy + r * st;
        break;
      }
      case 'pill': {
        // Oval / stretched pill
        const a = 46;
        const b = 34;
        x = cx + a * Math.cos(theta);
        y = cy + b * Math.sin(theta);
        break;
      }
      case 'cookie4': {
        const r = 43 + 4.5 * Math.cos(4 * theta);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'cookie6': {
        const r = 43.5 + 4 * Math.cos(6 * theta);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'cookie7': {
        const r = 44 + 3.5 * Math.cos(7 * theta);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'cookie9': {
        const r = 44 + 3.5 * Math.cos(9 * theta);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'cookie12': {
        const r = 44 + 3 * Math.cos(12 * theta);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'flower': {
        const r = 38 + 9 * Math.cos(6 * theta);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'clover4': {
        const r = 36 + 11 * Math.cos(4 * theta);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'clover8': {
        const r = 38 + 9 * Math.cos(8 * theta);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'softBurst': {
        const r = 38 + 9 * Math.cos(10 * theta);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'burst': {
        const r = 36 + 11.5 * Math.cos(12 * theta);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'puffy': {
        const r = 40 + 7 * Math.cos(6 * theta + Math.PI / 6);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'diamond': {
        const rotTheta = theta + Math.PI / 4;
        const ct = Math.cos(rotTheta);
        const st = Math.sin(rotTheta);
        const r = 44 / Math.pow(Math.pow(Math.abs(ct), 3.2) + Math.pow(Math.abs(st), 3.2), 1 / 3.2);
        x = cx + r * Math.cos(theta);
        y = cy + r * Math.sin(theta);
        break;
      }
      case 'triangle': {
        const n = 3;
        const r0 = 45;
        const angleMod = ((theta + Math.PI / 2) % ((2 * Math.PI) / n) + (2 * Math.PI) / n) % ((2 * Math.PI) / n);
        const halfAngle = Math.PI / n;
        const cosDiff = Math.cos(angleMod - halfAngle);
        const r = (r0 * Math.cos(halfAngle)) / Math.max(0.2, cosDiff);
        const clampedR = Math.min(46, Math.max(20, r * 0.88 + 5));
        x = cx + clampedR * Math.cos(theta);
        y = cy + 4 + clampedR * Math.sin(theta);
        break;
      }
      case 'pentagon': {
        const n = 5;
        const r0 = 45;
        const angleMod = ((theta + Math.PI / 2) % ((2 * Math.PI) / n) + (2 * Math.PI) / n) % ((2 * Math.PI) / n);
        const halfAngle = Math.PI / n;
        const cosDiff = Math.cos(angleMod - halfAngle);
        const r = (r0 * Math.cos(halfAngle)) / Math.max(0.2, cosDiff);
        const clampedR = Math.min(46, Math.max(28, r * 0.92 + 3.5));
        x = cx + clampedR * Math.cos(theta);
        y = cy + 2 + clampedR * Math.sin(theta);
        break;
      }
      case 'hexagon': {
        const n = 6;
        const r0 = 45;
        const angleMod = ((theta + Math.PI / 2) % ((2 * Math.PI) / n) + (2 * Math.PI) / n) % ((2 * Math.PI) / n);
        const halfAngle = Math.PI / n;
        const cosDiff = Math.cos(angleMod - halfAngle);
        const r = (r0 * Math.cos(halfAngle)) / Math.max(0.2, cosDiff);
        const clampedR = Math.min(46, Math.max(30, r * 0.94 + 2.5));
        x = cx + clampedR * Math.cos(theta);
        y = cy + clampedR * Math.sin(theta);
        break;
      }
      case 'arch': {
        // Upper half circle, lower half rounded rectangle
        const normAngle = ((theta + Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        if (normAngle <= Math.PI) {
          // Top arch
          x = cx + 44 * Math.sin(normAngle - Math.PI / 2);
          y = 50 - 44 * Math.cos(normAngle - Math.PI / 2);
        } else {
          // Bottom rect corners
          const tBottom = (normAngle - Math.PI) / Math.PI;
          if (tBottom < 0.5) {
            x = 50 + 44 - tBottom * 88;
            y = 88 - (1 - Math.cos(tBottom * Math.PI)) * 4;
          } else {
            x = 50 - 44 + (tBottom - 0.5) * 88;
            y = 88 - (1 - Math.cos((1 - tBottom) * Math.PI)) * 4;
          }
        }
        break;
      }
      case 'heart': {
        const t = theta + Math.PI;
        const rawX = 16 * Math.pow(Math.sin(t), 3);
        const rawY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        x = cx + rawX * 2.5;
        y = cy + 4 + rawY * 2.3;
        break;
      }
      case 'gem': {
        // 8-sided faceted gem
        const n = 8;
        const r0 = 45;
        const angleMod = (theta % ((2 * Math.PI) / n) + (2 * Math.PI) / n) % ((2 * Math.PI) / n);
        const halfAngle = Math.PI / n;
        const cosDiff = Math.cos(angleMod - halfAngle);
        const r = (r0 * Math.cos(halfAngle)) / Math.max(0.3, cosDiff);
        const clampedR = Math.min(46, Math.max(34, r * 0.94 + 2));
        x = cx + clampedR * Math.cos(theta);
        y = cy + clampedR * Math.sin(theta);
        break;
      }
    }

    points.push({
      x: Number(Math.max(2, Math.min(98, x)).toFixed(2)),
      y: Number(Math.max(2, Math.min(98, y)).toFixed(2)),
    });
  }

  return points;
}

/**
 * Convert point coordinates array [x0, y0, x1, y1, ...] to smooth SVG Path
 */
export function pointsToSvgPath(points: number[]): string {
  const n = points.length / 2;
  if (n < 3) return '';

  const getX = (idx: number) => points[((idx % n + n) % n) * 2];
  const getY = (idx: number) => points[((idx % n + n) % n) * 2 + 1];

  let path = `M ${getX(0)} ${getY(0)}`;

  for (let i = 0; i < n; i++) {
    const x0 = getX(i - 1);
    const y0 = getY(i - 1);
    const x1 = getX(i);
    const y1 = getY(i);
    const x2 = getX(i + 1);
    const y2 = getY(i + 2);
    const x3 = getX(i + 2);
    const y3 = getY(i + 2);

    // Catmull-Rom to Cubic Bezier control points
    const cp1x = x1 + (x2 - x0) / 6;
    const cp1y = y1 + (y2 - y0) / 6;
    const cp2x = x2 - (x3 - x1) / 6;
    const cp2y = y2 - (y3 - y1) / 6;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }

  path += ' Z';
  return path;
}

/**
 * Interpolate between two point arrays for 60fps morphing
 */
export function interpolatePoints(pointsA: number[], pointsB: number[], progress: number): number[] {
  const result: number[] = new Array(pointsA.length);
  const t = Math.max(0, Math.min(1, progress));
  for (let i = 0; i < pointsA.length; i++) {
    result[i] = pointsA[i] + (pointsB[i] - pointsA[i]) * t;
  }
  return result;
}

// Precompute all static paths and point arrays once at module load
const CACHED_POINTS: Record<ShapeName, number[]> = {} as Record<ShapeName, number[]>;
const CACHED_PATHS: Record<ShapeName, string> = {} as Record<ShapeName, string>;

SHAPE_NAMES.forEach((name) => {
  const rawPts = generateRawPoints(name);
  const flatPoints: number[] = [];
  rawPts.forEach((p) => {
    flatPoints.push(p.x, p.y);
  });
  CACHED_POINTS[name] = flatPoints;
  CACHED_PATHS[name] = pointsToSvgPath(flatPoints);
});

export function getShapePoints(name: ShapeName): number[] {
  return CACHED_POINTS[name] || CACHED_POINTS.squircle;
}

export function getShapePath(name: ShapeName): string {
  return CACHED_PATHS[name] || CACHED_PATHS.squircle;
}

export function interpolateShapePoints(from: ShapeName, to: ShapeName, t: number): number[] {
  return interpolatePoints(getShapePoints(from), getShapePoints(to), t);
}

export interface ShapeProps extends React.SVGProps<SVGSVGElement> {
  name: ShapeName;
  size?: number | string;
  fill?: string;
  className?: string;
}

export const Shape: React.FC<ShapeProps> = React.memo(({
  name,
  size = 40,
  fill = 'currentColor',
  className = '',
  style,
  ...props
}) => {
  const pathData = getShapePath(name);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    >
      <path d={pathData} fill={fill} />
    </svg>
  );
});
Shape.displayName = 'M3EShape';
