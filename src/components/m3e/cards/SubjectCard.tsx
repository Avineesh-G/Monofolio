import React from 'react';
import { motion } from 'framer-motion';
import { ShapeBadge } from '../ShapeBadge';
import { ShapeName } from '../../../theme/shapes';
import { useMotionPreset } from '../../../theme/motion';
import { BookOpen, ChevronRight } from 'lucide-react';

export interface SubjectCardProps {
  id?: string;
  name: string;
  code?: string;
  color?: string;
  topicCount?: number;
  docCount?: number;
  mastery?: number;
  masteryPercent?: number;
  accentColor?: string;
  accentContainer?: string;
  onAccentContainer?: string;
  shape?: ShapeName;
  onClick: () => void;
  className?: string;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  code,
  color,
  accentColor,
  topicCount = 0,
  docCount,
  mastery,
  masteryPercent,
  shape = 'flower',
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();
  const activeColor = accentColor || color || '#d0bcff';
  const displayMastery = masteryPercent !== undefined ? masteryPercent : (mastery || 0);

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-4 rounded-[24px] bg-surface-container/90 border border-white/10 m3-glass cursor-pointer flex items-center justify-between gap-3 shadow-md hover:border-white/20 hover:bg-surface-container-high transition-all ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <ShapeBadge
          shape={shape}
          size={44}
          shapeFill="rgba(255, 255, 255, 0.08)"
          icon={<BookOpen className="w-5 h-5 stroke-[2.2px]" style={{ color: activeColor }} />}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-on-surface truncate leading-tight">
              {name}
            </h3>
            {code && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono font-bold text-on-surface-variant">
                {code}
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant font-medium">
            {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
            {docCount !== undefined && ` • ${docCount} docs`}
            {` • ${displayMastery}% mastery`}
          </p>
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-on-surface-variant/60 shrink-0" />
    </motion.div>
  );
};
