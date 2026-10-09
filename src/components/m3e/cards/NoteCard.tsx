import React from 'react';
import { motion } from 'framer-motion';
import { useMotionPreset } from '../../../theme/motion';

export interface NoteCardProps {
  id: string;
  title: string;
  bodyPreview: string;
  lastEditedText?: string;
  subjectName?: string;
  subjectColor?: string;
  onClick: () => void;
  className?: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  title,
  bodyPreview,
  lastEditedText = 'Recently',
  subjectName,
  subjectColor = 'var(--md-sys-color-primary)',
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`relative p-4 rounded-3xl bg-surface-container border border-outline-variant/30 overflow-hidden cursor-pointer hover:bg-surface-container-high transition-colors select-none shadow-sm space-y-2.5 ${className}`}
    >
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-secondary" />

      <div className="flex items-center justify-between pl-1">
        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[140px]"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-highest)',
            color: subjectColor,
          }}
        >
          {subjectName || 'Study Note'}
        </span>
        <span className="m3-label-medium text-[11px] text-on-surface-variant font-mono">
          {lastEditedText}
        </span>
      </div>

      <div className="pl-1 space-y-1">
        <h4 className="m3-title-medium-emp text-on-surface line-clamp-1 leading-snug">
          {title}
        </h4>
        <p className="m3-body-medium text-on-surface-variant line-clamp-3 text-xs leading-relaxed">
          {bodyPreview || 'No content provided in this study note.'}
        </p>
      </div>
    </motion.div>
  );
};
