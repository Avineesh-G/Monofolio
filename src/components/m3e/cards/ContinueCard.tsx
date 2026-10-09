import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useMotionPreset } from '../../../theme/motion';
import { ShapeBadge } from '../ShapeBadge';

export interface ContinueCardProps {
  documentId?: string;
  title: string;
  subjectName?: string;
  topicName?: string;
  lastPage?: number;
  totalPages?: number;
  progressPercent?: number;
  onResume?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ContinueCard: React.FC<ContinueCardProps> = ({
  title,
  subjectName = 'Lecture Notes',
  topicName,
  lastPage,
  totalPages,
  progressPercent,
  onResume,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();
  const calculatedPercent =
    progressPercent !== undefined
      ? progressPercent
      : lastPage && totalPages
      ? Math.min(100, Math.round((lastPage / Math.max(1, totalPages)) * 100))
      : 60;

  const handleClick = onResume || onClick || (() => {});

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={handleClick}
      className={`p-4 rounded-[24px] bg-gradient-to-r from-surface-container-high/90 to-surface-container/90 border border-primary/20 backdrop-blur-md shadow-md flex items-center justify-between gap-4 cursor-pointer select-none hover:border-primary/50 transition-all ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <ShapeBadge
          shape="cookie12"
          size={42}
          shapeFill="rgba(208, 188, 255, 0.2)"
          glow
          glowColor="rgba(208, 188, 255, 0.3)"
          icon={<BookOpen className="w-5 h-5 text-primary stroke-[2.2px]" />}
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
              {topicName || 'CONTINUE READING'}
            </span>
            <span className="text-[11px] font-mono text-on-surface-variant">
              {lastPage && totalPages ? `Page ${lastPage} / ${totalPages}` : subjectName}
            </span>
          </div>

          <h4 className="text-sm font-bold text-on-surface truncate leading-tight">
            {title}
          </h4>

          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${calculatedPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-2 rounded-full bg-primary/20 text-primary shrink-0">
        <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
      </div>
    </motion.div>
  );
};
