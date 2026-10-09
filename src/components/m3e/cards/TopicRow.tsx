import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ScallopRing } from '../ScallopRing';
import { useMotionPreset } from '../../../theme/motion';

export interface TopicRowProps {
  name: string;
  itemCount: number;
  dueCards?: number;
  masteryPercent: number;
  onClick: () => void;
  className?: string;
}

export const TopicRow: React.FC<TopicRowProps> = ({
  name,
  itemCount,
  dueCards = 0,
  masteryPercent,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between gap-3 border border-outline-variant/30 cursor-pointer select-none ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Leading Mastery Ring */}
        <ScallopRing
          progress={masteryPercent}
          size={40}
          strokeWidth={3.5}
        />

        {/* Name & Item Count */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <h4 className="m3-title-medium-emp text-on-surface truncate">
            {name}
          </h4>
          <p className="m3-label-medium text-on-surface-variant text-xs">
            {itemCount} Resources &bull; {Math.round(masteryPercent)}% Mastery
          </p>
        </div>
      </div>

      {/* Due Badge & Chevron */}
      <div className="flex items-center gap-2 shrink-0">
        {dueCards > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-mono text-[10px] font-bold shadow-sm">
            {dueCards} Due
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-on-surface-variant" />
      </div>
    </motion.div>
  );
};
