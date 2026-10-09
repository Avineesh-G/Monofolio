import React from 'react';
import { motion } from 'framer-motion';
import { ShapeBadge } from '../ShapeBadge';
import { ScallopRing } from '../ScallopRing';
import { ShapeName } from '../../../theme/shapes';
import { useMotionPreset } from '../../../theme/motion';
import { BookOpen } from 'lucide-react';

export interface SubjectCardProps {
  name: string;
  topicCount: number;
  docCount: number;
  masteryPercent: number;
  accentColor: string;
  accentContainer: string;
  onAccentContainer: string;
  shape?: ShapeName;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  topicCount,
  docCount,
  masteryPercent,
  accentColor,
  accentContainer,
  onAccentContainer,
  shape = 'flower',
  icon,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      style={{
        backgroundColor: accentContainer,
        color: onAccentContainer,
      }}
      className={`p-4 rounded-3xl border border-outline-variant/30 flex flex-col justify-between min-h-[145px] cursor-pointer transition-transform select-none shadow-sm ${className}`}
    >
      {/* Top Shape Badge & Mastery Ring */}
      <div className="flex items-start justify-between">
        <ShapeBadge
          shape={shape}
          size={44}
          shapeFill={accentColor}
          icon={
            icon || <BookOpen className="w-5 h-5 text-surface stroke-[2.2px]" />
          }
        />

        <ScallopRing
          progress={masteryPercent}
          size={38}
          strokeWidth={3.5}
          color={accentColor}
          trackColor="rgba(0, 0, 0, 0.15)"
        />
      </div>

      {/* Title & Metadata */}
      <div className="pt-3 space-y-1">
        <h3 className="m3-title-medium-emp leading-tight line-clamp-2">
          {name}
        </h3>
        <p className="m3-label-medium text-xs opacity-80 font-medium">
          {topicCount} Topics &bull; {docCount} Docs
        </p>
      </div>
    </motion.div>
  );
};
