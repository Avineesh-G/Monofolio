import React from 'react';
import { motion } from 'framer-motion';
import { useMotionPreset } from '../../../theme/motion';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';

export interface TopicRowProps {
  id?: string;
  title?: string;
  name?: string;
  masteryPercent?: number;
  isComplete?: boolean;
  flashcardCount?: number;
  itemCount?: number;
  dueCards?: number;
  onClick?: () => void;
  className?: string;
}

export const TopicRow: React.FC<TopicRowProps> = ({
  title,
  name,
  masteryPercent = 0,
  isComplete = false,
  flashcardCount,
  itemCount,
  dueCards,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();
  const displayTitle = title || name || 'Untitled Topic';
  const totalCards = flashcardCount !== undefined ? flashcardCount : (itemCount || 0);

  return (
    <motion.div
      whileTap={onClick ? motionPreset.tapFeedback.whileTap : undefined}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-3.5 rounded-[18px] bg-surface-container/70 border border-white/5 m3-glass flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-container-high transition-all ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-on-surface truncate leading-tight">
            {displayTitle}
          </h4>
          <p className="text-[11px] text-on-surface-variant font-medium pt-0.5">
            {totalCards} cards
            {dueCards !== undefined && dueCards > 0 && ` (${dueCards} due)`}
            {` • ${masteryPercent}% recall`}
          </p>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
    </motion.div>
  );
};
