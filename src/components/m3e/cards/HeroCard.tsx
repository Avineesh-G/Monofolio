import React from 'react';
import { Shape } from '../../../theme/shapes';
import { Button } from '../Button';
import { ArrowRight, Flame } from 'lucide-react';

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
      className={`relative w-full rounded-xl-inc bg-primary-container text-on-primary-container p-6 overflow-hidden border border-outline-variant/30 shadow-md ${className}`}
    >
      <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
        <Shape name="flower" size={180} fill="var(--md-sys-color-primary)" />
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-surface/20 text-on-primary-container m3-label-medium font-bold flex items-center gap-1.5 backdrop-blur-sm">
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{streakDays} Day Study Streak</span>
          </span>
          <span className="m3-label-medium text-on-primary-container/80 uppercase font-mono tracking-wider">
            Daily Target
          </span>
        </div>

        <div>
          <div className="m3-display-large-emp tracking-tight text-on-primary-container leading-none">
            {dueCount} <span className="m3-headline-medium-emp opacity-90 font-normal">due today</span>
          </div>
          <p className="m3-body-medium text-on-primary-container/85 pt-1.5 max-w-sm">
            {dueCount === 0
              ? 'All caught up! Excellent retention across active semester decks.'
              : 'Flashcards ready for SM-2 spaced repetition review.'}
          </p>
        </div>

        <div className="pt-1">
          <Button
            variant="filled"
            size="md"
            shape="round"
            onClick={onStartRevision}
            trailingIcon={<ArrowRight className="w-4 h-4" />}
            className="shadow-md bg-on-primary-container text-primary-container font-bold hover:opacity-90"
          >
            {dueCount > 0 ? 'Start Rapid Revision' : 'Practice Free Deck'}
          </Button>
        </div>
      </div>
    </div>
  );
};
