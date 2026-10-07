import type { Transition, Variants } from 'framer-motion';

export const springConfig = {
  type: 'spring',
  stiffness: 400,
  damping: 32,
  mass: 0.8,
} as const;

export const springSnappy = {
  type: 'spring',
  stiffness: 500,
  damping: 28,
} as const;

export const tweenFast: Transition = {
  type: 'tween',
  ease: [0.16, 1, 0.3, 1],
  duration: 0.15,
};

export const tweenBase: Transition = {
  type: 'tween',
  ease: [0.16, 1, 0.3, 1],
  duration: 0.22,
};

// Fade & Scale transition variants (animates strictly transform and opacity)
export const fadeInScaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: tweenBase,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: tweenFast,
  },
};

export const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: tweenBase,
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: tweenFast,
  },
};

export const tabScreenVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
};

export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
