import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight } from 'lucide-react';
import { ScallopRing } from '../ScallopRing';
import { useMotionPreset } from '../../../theme/motion';

export interface ContinueCardProps {
  title: string;
  topicName?: string;
  subjectName?: string;
  progressPercent: number;
  thumbnailUrl?: string;
  onClick: () => void;
  className?: string;
}

export const ContinueCard: React.FC<ContinueCardProps> = ({
  title,
  topicName = 'Core Topics',
  subjectName,
  progressPercent,
  thumbnailUrl,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`relative w-full rounded-2xl bg-surface-container-high text-on-surface p-4 border border-outline-variant/30 flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-bright transition-colors select-none shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="relative w-12 h-14 rounded-2xl bg-surface-container-highest overflow-hidden shrink-0 flex items-center justify-center border border-outline-variant/30">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center text-primary">
              <FileText className="w-6 h-6 stroke-[1.8px]" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono block truncate">
            {subjectName || 'Resume Reading'}
          </span>
          <h3 className="m3-title-medium-emp text-on-surface truncate leading-tight">
            {title}
          </h3>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant m3-label-medium text-[11px] truncate">
            {topicName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ScallopRing
          progress={progressPercent}
          size={44}
          strokeWidth={4}
          color="var(--md-sys-color-primary)"
          scallopFill="var(--md-sys-color-primary-container)"
        />
        <ChevronRight className="w-4 h-4 text-on-surface-variant" />
      </div>
    </motion.div>
  );
};
