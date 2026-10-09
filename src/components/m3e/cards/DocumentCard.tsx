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
  index = 0,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  const typeConfig: Record<string, { icon: React.ReactNode; shape: ShapeName; containerBg: string }> = {
    pdf: {
      icon: <FileText className="w-4 h-4 text-on-primary-container stroke-[2.2px]" />,
      shape: 'squircle',
      containerBg: 'var(--md-sys-color-primary-container)',
    },
    note: {
      icon: <StickyNote className="w-4 h-4 text-on-secondary-container stroke-[2.2px]" />,
      shape: 'flower',
      containerBg: 'var(--md-sys-color-secondary-container)',
    },
    link: {
      icon: <Link2 className="w-4 h-4 text-on-tertiary-container stroke-[2.2px]" />,
      shape: 'diamond',
      containerBg: 'var(--md-sys-color-tertiary-container)',
    },
  };

  const config = typeConfig[kind] || typeConfig.pdf;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-3.5 rounded-2xl border border-outline-variant/30 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
        isEven ? 'bg-surface-container' : 'bg-surface-container-low'
      } hover:bg-surface-container-high ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Type Shape Badge */}
        <ShapeBadge
          shape={config.shape}
          size={38}
          shapeFill={config.containerBg}
          icon={config.icon}
        />

        {/* Title & Subject Chip */}
        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="m3-title-medium-emp text-on-surface truncate leading-tight">
            {title}
          </h4>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[120px]"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-highest)',
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

      {/* Star Toggle Action */}
      {onToggleStar && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(e);
          }}
          className="p-2 rounded-full hover:bg-black/10 text-on-surface-variant transition-colors shrink-0"
          aria-label={isStarred ? 'Unstar item' : 'Star item'}
        >
          <Star
            className={`w-4 h-4 ${
              isStarred
                ? 'fill-amber-400 text-amber-400'
                : 'text-on-surface-variant/60'
            }`}
          />
        </button>
      )}
    </motion.div>
  );
});
DocumentCard.displayName = 'M3EDocumentCard';
