import type { Transition, Variants } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

/**
 * M3 Expressive Spring Physics Tokens
 * - Spatial springs: Physical movement, translation, scale (can slightly overshoot)
 * - Effects springs: Color, opacity, subtle fades (never overshoot)
 */
export const spring = {
  spatialFast: { type: 'spring', stiffness: 1400, damping: 67, mass: 1 },
  spatialDefault: { type: 'spring', stiffness: 700, damping: 48, mass: 1 },
  spatialSlow: { type: 'spring', stiffness: 300, damping: 31, mass: 1 },
  effectsFast: { type: 'spring', stiffness: 3800, damping: 123, mass: 1 },
  effectsDefault: { type: 'spring', stiffness: 1600, damping: 80, mass: 1 },
  effectsSlow: { type: 'spring', stiffness: 800, damping: 57, mass: 1 },
} as const;

export const instantTransition: Transition = {
  duration: 0.001,
};

// Backward-compatible motion helpers
export const springConfig = spring.spatialDefault;
export const springSnappy = spring.spatialFast;

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

export const fadeInScaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: tweenBase },
  exit: { opacity: 0, scale: 0.96, transition: tweenFast },
};

export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: tweenBase },
  exit: { opacity: 0, y: 8, transition: tweenFast },
};

export const tabScreenVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hook to provide spring motion or instant fallback when Performance Mode is active
 */
export function useMotionPreset() {
  const perfMode = useSettingsStore((s) => s.performanceMode);
  const isReduced = shouldReduceMotion() || perfMode;

  return {
    isReduced,
    spatialFast: isReduced ? instantTransition : spring.spatialFast,
    spatialDefault: isReduced ? instantTransition : spring.spatialDefault,
    spatialSlow: isReduced ? instantTransition : spring.spatialSlow,
    effectsFast: isReduced ? instantTransition : spring.effectsFast,
    effectsDefault: isReduced ? instantTransition : spring.effectsDefault,
    effectsSlow: isReduced ? instantTransition : spring.effectsSlow,
    tapFeedback: isReduced
      ? {}
      : {
          whileTap: { scale: 0.96 },
          transition: spring.spatialFast,
        },
  };
}

/**
 * Shared screen & view transition variants
 */
export const screenFadeThroughVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 4,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.spatialDefault,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -4,
    transition: spring.effectsFast,
  },
};

export const sheetCardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.92,
    y: 16,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.spatialDefault,
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 12,
    transition: spring.effectsFast,
  },
};

export const staggerContainerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: spring.spatialDefault },
};
