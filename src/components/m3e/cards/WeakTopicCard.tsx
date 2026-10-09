import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { ShapeBadge } from '../ShapeBadge';
import { useMotionPreset } from '../../../theme/motion';

export interface WeakTopicCardProps {
  id?: string;
  topicName: string;
  subjectName?: string;
  masteryPercent?: number;
  weakPointsCount?: number;
  onReview?: () => void;
  onClick?: () => void;
  className?: string;
}

export const WeakTopicCard: React.FC<WeakTopicCardProps> = ({
  topicName,
  subjectName = 'General',
  masteryPercent = 35,
  weakPointsCount = 2,
  onReview,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();
  const handleAction = onReview || onClick || (() => {});

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={handleAction}
      className={`p-3.5 rounded-[22px] bg-error-container/40 shadow-md flex items-center justify-between gap-3 cursor-pointer select-none active:scale-98 transition-all ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <ShapeBadge
          shape="softBurst"
          size={40}
          shapeFill="rgba(242, 184, 181, 0.25)"
          icon={<AlertCircle className="w-4 h-4 text-error stroke-[2.2px]" />}
        />

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-error font-mono">
              Priority Review
            </span>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-[10px] font-bold text-on-error-container truncate max-w-[100px]">
              {subjectName}
            </span>
          </div>

          <h4 className="text-sm font-bold text-on-surface truncate leading-tight">
            {topicName}
          </h4>

          <p className="text-[11px] text-on-surface-variant font-medium">
            {masteryPercent}% retention &bull; {weakPointsCount} blindspots flagged
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-error text-xs font-bold shrink-0">
        <span>Review</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
};
