import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useMotionPreset } from '../../../theme/motion';
import { ShapeBadge } from '../ShapeBadge';

export interface WeakTopicCardProps {
  topicName: string;
  subjectName?: string;
  failedCount?: number;
  masteryPercent?: number;
  weakPointsCount?: number;
  onReview?: () => void;
  onClick?: () => void;
  className?: string;
}

export const WeakTopicCard: React.FC<WeakTopicCardProps> = ({
  topicName,
  subjectName,
  failedCount = 3,
  masteryPercent,
  weakPointsCount,
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
      className={`p-4 rounded-[24px] bg-error-container/40 border border-error/30 backdrop-blur-md shadow-sm flex items-center justify-between gap-3 cursor-pointer select-none hover:border-error/60 transition-all ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <ShapeBadge
          shape="softBurst"
          size={40}
          shapeFill="rgba(242, 184, 181, 0.2)"
          glow
          glowColor="rgba(242, 184, 181, 0.3)"
          icon={<AlertCircle className="w-4 h-4 text-error stroke-[2.2px]" />}
        />

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-error tracking-wider">
              RETENTION ALERT
            </span>
            {subjectName && (
              <span className="text-[10px] text-on-surface-variant font-medium">
                • {subjectName}
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-on-surface truncate leading-tight">
            {topicName}
          </h4>

          <p className="text-xs text-on-surface-variant">
            {masteryPercent !== undefined
              ? `Mastery at ${masteryPercent}% (${weakPointsCount || 3} concepts unstable)`
              : `${failedCount} cards in Leitner Box 0 needing review.`}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAction}
        className="px-3 py-1.5 rounded-full bg-error text-on-error text-xs font-bold shrink-0 flex items-center gap-1 shadow-sm action:scale-95 transition-transform"
      >
        <span>Review</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
