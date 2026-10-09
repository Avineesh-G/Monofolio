import React from 'react';
import { motion } from 'framer-motion';
import { WavyProgress } from '../WavyProgress';
import { ShapeBadge } from '../ShapeBadge';
import { ShapeName } from '../../../theme/shapes';
import { useMotionPreset } from '../../../theme/motion';

export interface SemesterSubjectBadge {
  id: string;
  name: string;
  color: string;
  shape: ShapeName;
}

export interface SemesterCardProps {
  id: string;
  name: string;
  subjectBadges: SemesterSubjectBadge[];
  progressPercent: number;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({
  name,
  subjectBadges,
  progressPercent,
  isSelected = false,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <motion.div
      whileTap={onClick ? motionPreset.tapFeedback.whileTap : undefined}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`min-w-[260px] p-5 rounded-3xl transition-all cursor-pointer select-none border ${
        isSelected
          ? 'bg-primary-container text-on-primary-container border-primary shadow-md'
          : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
      } ${className}`}
    >
      <div className="space-y-3">
        {/* Semester Title */}
        <div className="flex items-center justify-between">
          <h3 className="m3-headline-small-emp m3-title-large-emp truncate font-bold">
            {name}
          </h3>
          <span className="font-mono text-xs font-bold opacity-80">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* Overlapping Subject Badges */}
        <div className="flex items-center -space-x-2.5 py-1">
          {subjectBadges.slice(0, 5).map((badge) => (
            <ShapeBadge
              key={badge.id}
              shape={badge.shape}
              size={36}
              shapeFill={badge.color}
              className="ring-2 ring-surface shadow-sm"
            />
          ))}
          {subjectBadges.length > 5 && (
            <div className="w-9 h-9 rounded-full bg-surface-container-highest text-on-surface text-[11px] font-bold flex items-center justify-center ring-2 ring-surface z-10">
              +{subjectBadges.length - 5}
            </div>
          )}
        </div>

        {/* Wavy Progress Line */}
        <div className="pt-1">
          <WavyProgress
            progress={progressPercent}
            color={
              isSelected
                ? 'var(--md-sys-color-primary)'
                : 'var(--md-sys-color-secondary)'
            }
          />
        </div>
      </div>
    </motion.div>
  );
};
