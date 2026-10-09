import React from 'react';
import { motion } from 'framer-motion';
import { ShapeBadge } from '../ShapeBadge';
import { ShapeName } from '../../../theme/shapes';
import { useMotionPreset } from '../../../theme/motion';
import { Layers, ChevronRight } from 'lucide-react';

export interface SemesterCardProps {
  id: string;
  title: string;
  year?: string;
  subjectsCount?: number;
  shape?: ShapeName;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({
  title,
  year,
  subjectsCount = 0,
  shape = 'softBurst',
  isActive = false,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-4 rounded-[24px] cursor-pointer flex items-center justify-between gap-3 shadow-md transition-all ${
        isActive
          ? 'bg-primary-container/70 border-2 border-primary text-on-primary-container'
          : 'bg-surface-container/90 border border-white/10 m3-glass hover:bg-surface-container-high'
      } ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <ShapeBadge
          shape={shape}
          size={44}
          shapeFill={isActive ? 'rgba(208, 188, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)'}
          icon={<Layers className="w-5 h-5 text-primary stroke-[2.2px]" />}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-on-surface truncate leading-tight">
              {title}
            </h3>
            {year && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-on-surface-variant font-bold">
                {year}
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant font-medium">
            {subjectsCount} {subjectsCount === 1 ? 'subject' : 'subjects'} enrolled
          </p>
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-on-surface-variant/60 shrink-0" />
    </motion.div>
  );
};
