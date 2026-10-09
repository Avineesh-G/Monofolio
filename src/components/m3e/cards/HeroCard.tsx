import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, ArrowRight, Zap, Brain, Layers } from 'lucide-react';
import { Shape } from '../../../theme/shapes';
import { useMotionPreset } from '../../../theme/motion';

export interface HeroCardProps {
  dueCount: number;
  streakDays?: number;
  onStartRevision: () => void;
  onAskCoach?: () => void;
  className?: string;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  dueCount,
  streakDays = 5,
  onStartRevision,
  onAskCoach,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <div
      className={`relative w-full rounded-[32px] bg-gradient-to-br from-[#2d1b4e] via-[#1f1533] to-[#14101e] p-6 overflow-hidden shadow-2xl ${className}`}
    >
      {/* Decorative Morphic Aura */}
      <div className="absolute -right-6 -bottom-10 opacity-20 pointer-events-none">
        <Shape name="flower" size={210} fill="#d0bcff" />
      </div>
      <div className="absolute right-24 -top-12 opacity-10 pointer-events-none">
        <Shape name="softBurst" size={160} fill="#efb8c8" />
      </div>

      <div className="relative z-10 space-y-5">
        {/* Top Metric Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
              <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
              <span>{streakDays} Day Streak</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 text-[11px] font-mono text-primary font-bold">
              Leitner Active
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant/80 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI Brain Engine</span>
          </div>
        </div>

        {/* Main Headline with Radial Progress Orbit */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none flex items-baseline gap-2">
              <span>{dueCount}</span>
              <span className="text-base sm:text-lg font-bold text-white/70">
                {dueCount === 1 ? 'card needs review' : 'cards due for recall'}
              </span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              {dueCount === 0
                ? 'All spaced intervals cleared! Dive into new syllabus notes or practice weak spots.'
                : 'Review these cards to reinforce neural pathways before memory decay sets in.'}
            </p>
          </div>

          {/* Radial Mini Gauge */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary"
                strokeDasharray={`${Math.min(100, Math.max(10, (1 - dueCount / 20) * 100))}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>

        {/* Action Bar Pills */}
        <div className="flex items-center gap-2.5 pt-1">
          <motion.button
            whileTap={motionPreset.tapFeedback.whileTap}
            transition={motionPreset.tapFeedback.transition}
            onClick={onStartRevision}
            className="flex-1 py-3 px-4 rounded-2xl bg-white text-[#2d1b4e] font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-white/95 active:scale-95 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#2d1b4e]" />
            <span>{dueCount > 0 ? 'Start Rapid Revision' : 'Practice Free Deck'}</span>
            <ArrowRight className="w-4 h-4 text-[#2d1b4e]" />
          </motion.button>

          {onAskCoach && (
            <motion.button
              whileTap={motionPreset.tapFeedback.whileTap}
              transition={motionPreset.tapFeedback.transition}
              onClick={onAskCoach}
              className="py-3 px-4 rounded-2xl bg-primary-container text-on-primary-container font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              aria-label="Ask AI Coach"
            >
              <Brain className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Coach</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
