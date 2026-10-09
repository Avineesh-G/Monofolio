import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useMotionPreset } from '../../../theme/motion';

export interface WeakTopicCardProps {
  topicName: string;
  subjectName?: string;
  masteryPercent: number;
  weakPointsCount?: number;
  onClick?: () => void;
  className?: string;
}

export const WeakTopicCard: React.FC<WeakTopicCardProps> = ({
  topicName,
  subjectName,
  masteryPercent,
  weakPointsCount,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  const isWeak = masteryPercent < 60;
  const isModerate = masteryPercent >= 60 && masteryPercent < 80;

  const bgStyle = isWeak
    ? 'bg-error-container text-on-error-container border-rose-500/30'
    : isModerate
    ? 'bg-tertiary-container text-on-tertiary-container border-amber-500/30'
    : 'bg-primary-container text-on-primary-container border-primary/30';

  return (
    <motion.div
      whileTap={onClick ? motionPreset.tapFeedback.whileTap : undefined}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-4 rounded-3xl border ${bgStyle} flex flex-col justify-between min-h-[110px] select-none shadow-sm ${
        onClick ? 'cursor-pointer hover:opacity-95' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isWeak ? (
            <AlertCircle className="w-4 h-4 text-error" />
          ) : isModerate ? (
            <TrendingUp className="w-4 h-4 text-tertiary" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-primary" />
          )}
          <span className="m3-label-medium text-[11px] font-bold uppercase tracking-wider opacity-90 truncate">
            {subjectName || 'Topic Mastery'}
          </span>
        </div>

        <span className="m3-headline-medium-emp font-mono font-bold leading-none">
          {Math.round(masteryPercent)}%
        </span>
      </div>

      <div className="pt-2 space-y-0.5">
        <h4 className="m3-title-medium-emp truncate leading-tight">
          {topicName}
        </h4>
        {weakPointsCount !== undefined && weakPointsCount > 0 && (
          <p className="m3-label-medium text-xs opacity-80">
            {weakPointsCount} identified blind spots
          </p>
        )}
      </div>
    </motion.div>
  );
};
