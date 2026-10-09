import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { ShapeBadge } from '../ShapeBadge';
import { useMotionPreset } from '../../../theme/motion';

export interface ContinueCardProps {
  id?: string;
  title: string;
  subjectName?: string;
  topicName?: string;
  progressPercent?: number;
  onResume?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ContinueCard: React.FC<ContinueCardProps> = ({
  title,
  subjectName = 'General',
  topicName,
  progressPercent = 40,
  onResume,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();
  const handleAction = onResume || onClick || (() => {});

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={handleAction}
      className={`p-4 rounded-[24px] bg-surface-container-high shadow-lg flex items-center justify-between gap-3 cursor-pointer select-none active:scale-98 transition-all ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <ShapeBadge
          shape="clover4"
          size={44}
          shapeFill="rgba(208, 188, 255, 0.2)"
          glow
          glowColor="rgba(208, 188, 255, 0.3)"
          icon={<Sparkles className="w-5 h-5 text-primary stroke-[2.2px]" />}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-extrabold text-primary tracking-wider">
              Continue Reading
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-on-surface-variant truncate max-w-[100px]">
              {subjectName}
            </span>
          </div>

          <h4 className="text-sm font-bold text-on-surface truncate leading-tight">
            {title}
          </h4>

          {topicName && (
            <p className="text-xs text-on-surface-variant truncate font-medium">
              {topicName}
            </p>
          )}

          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
        <Play className="w-4 h-4 fill-current ml-0.5" />
      </div>
    </motion.div>
  );
};
