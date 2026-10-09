import React from 'react';
import { motion } from 'framer-motion';
import { FileText, StickyNote, Link2, Star } from 'lucide-react';
import { ShapeBadge } from '../ShapeBadge';
import { ShapeName } from '../../../theme/shapes';
import { useMotionPreset } from '../../../theme/motion';

export interface DocumentCardProps {
  id: string;
  kind: 'pdf' | 'note' | 'link';
  title: string;
  subjectName?: string;
  subjectColor?: string;
  pageCount?: number;
  isStarred?: boolean;
  onToggleStar?: (e: React.MouseEvent) => void;
  onClick: () => void;
  index?: number;
  className?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = React.memo(({
  kind,
  title,
  subjectName = 'General',
  subjectColor = 'var(--md-sys-color-primary)',
  pageCount,
  isStarred = false,
  onToggleStar,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  const typeConfig: Record<string, { icon: React.ReactNode; shape: ShapeName; containerBg: string }> = {
    pdf: {
      icon: <FileText className="w-4 h-4 text-primary stroke-[2.2px]" />,
      shape: 'squircle',
      containerBg: 'rgba(208, 188, 255, 0.18)',
    },
    note: {
      icon: <StickyNote className="w-4 h-4 text-secondary stroke-[2.2px]" />,
      shape: 'flower',
      containerBg: 'rgba(204, 194, 220, 0.18)',
    },
    link: {
      icon: <Link2 className="w-4 h-4 text-tertiary stroke-[2.2px]" />,
      shape: 'diamond',
      containerBg: 'rgba(239, 184, 200, 0.18)',
    },
  };

  const config = typeConfig[kind] || typeConfig.pdf;

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-3.5 rounded-[22px] bg-surface-container backdrop-blur-md flex items-center justify-between gap-3 cursor-pointer select-none shadow-md hover:bg-surface-container-high active:scale-98 transition-all ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <ShapeBadge
          shape={config.shape}
          size={42}
          shapeFill={config.containerBg}
          icon={config.icon}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="text-sm font-bold text-on-surface truncate leading-tight">
            {title}
          </h4>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[120px]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: subjectColor,
              }}
            >
              {subjectName}
            </span>
            {pageCount ? (
              <span className="text-[11px] font-mono text-on-surface-variant">
                {pageCount} pgs
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {onToggleStar && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(e);
          }}
          className="p-2 rounded-full hover:bg-white/10 text-on-surface-variant transition-colors shrink-0 focus:outline-none"
          aria-label={isStarred ? 'Unstar item' : 'Star item'}
        >
          <Star
            className={`w-4 h-4 ${
              isStarred
                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                : 'text-on-surface-variant/40'
            }`}
          />
        </button>
      )}
    </motion.div>
  );
});
DocumentCard.displayName = 'M3EDocumentCard';
