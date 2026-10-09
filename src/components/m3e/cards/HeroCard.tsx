import React from 'react';
import { Shape } from '../../../theme/shapes';
import { Button } from '../Button';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';

export interface HeroCardProps {
  dueCount: number;
  streakDays?: number;
  onStartRevision: () => void;
  className?: string;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  dueCount,
  streakDays = 5,
  onStartRevision,
  className = '',
}) => {
  return (
    <div
      className={`relative w-full rounded-[28px] bg-gradient-to-br from-[#4f378b] via-[#381e72] to-[#211f26] text-on-primary-container p-6 overflow-hidden border border-white/10 shadow-xl ${className}`}
    >
      <div className="absolute -right-8 -bottom-8 opacity-20 pointer-events-none animate-pulse duration-1000">
        <Shape name="flower" size={190} fill="#d0bcff" />
      </div>
      <div className="absolute -left-10 -top-10 opacity-10 pointer-events-none">
        <Shape name="cookie12" size={140} fill="#efb8c8" />
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/10 shadow-sm">
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
            <span>{streakDays} Day Streak</span>
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            DAILY GOAL
          </span>
        </div>

        <div>
          <div className="text-4xl font-extrabold tracking-tight text-white leading-none flex items-baseline gap-2">
            <span>{dueCount}</span>
            <span className="text-lg font-medium text-white/70">cards due today</span>
          </div>
          <p className="text-xs text-white/80 pt-2 leading-relaxed max-w-xs">
            {dueCount === 0
              ? 'All caught up! Zero cards overdue. Ready to dive into new lecture notes?'
              : 'Spaced repetition deck active. Review your cards now to lock in recall.'}
          </p>
        </div>

        <div className="pt-1">
          <Button
            variant="filled"
            size="md"
            shape="pill"
            onClick={onStartRevision}
            trailingIcon={<ArrowRight className="w-4 h-4" />}
            className="shadow-md bg-white text-[#381e72] font-bold hover:bg-white/90 active:scale-95 transition-transform"
          >
            {dueCount > 0 ? 'Start Rapid Revision' : 'Practice Free Deck'}
          </Button>
        </div>
      </div>
    </div>
  );
};
