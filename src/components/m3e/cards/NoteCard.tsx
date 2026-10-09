import React from 'react';
import { motion } from 'framer-motion';
import { ShapeBadge } from '../ShapeBadge';
import { useMotionPreset } from '../../../theme/motion';
import { StickyNote } from 'lucide-react';

export interface NoteCardProps {
  id: string;
  title: string;
  snippet?: string;
  subjectName?: string;
  updatedAt?: string | number;
  onClick: () => void;
  className?: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  title,
  snippet,
  subjectName,
  updatedAt,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-4 rounded-[22px] bg-surface-container/90 border border-white/10 m3-glass flex flex-col justify-between cursor-pointer shadow-sm hover:border-white/20 hover:bg-surface-container-high transition-all ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <ShapeBadge
              shape="flower"
              size={32}
              shapeFill="rgba(204, 194, 220, 0.2)"
              icon={<StickyNote className="w-4 h-4 text-secondary stroke-[2.2px]" />}
            />
            <h4 className="text-sm font-bold text-on-surface truncate">
              {title}
            </h4>
          </div>
          {subjectName && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-secondary truncate max-w-[100px]">
              {subjectName}
            </span>
          )}
        </div>

        {snippet && (
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {snippet}
          </p>
        )}
      </div>

      {updatedAt && (
        <div className="pt-3 text-[10px] font-mono text-on-surface-variant/60">
          Updated {typeof updatedAt === 'number' ? new Date(updatedAt).toLocaleDateString() : updatedAt}
        </div>
      )}
    </motion.div>
  );
};
