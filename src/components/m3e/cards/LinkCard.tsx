import React from 'react';
import { motion } from 'framer-motion';
import { Link2, ExternalLink } from 'lucide-react';
import { ShapeBadge } from '../ShapeBadge';
import { useMotionPreset } from '../../../theme/motion';

export interface LinkCardProps {
  id: string;
  title: string;
  url: string;
  whySaved?: string;
  subjectName?: string;
  onClick: () => void;
  className?: string;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  title,
  url,
  whySaved,
  subjectName = 'Resource',
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  let domain = url;
  try {
    const parsed = new URL(url);
    domain = parsed.hostname.replace(/^www\./, '');
  } catch {
    domain = url.slice(0, 30);
  }

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-4 rounded-3xl bg-surface-container border border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer select-none space-y-2.5 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShapeBadge
            shape="diamond"
            size={36}
            shapeFill="var(--md-sys-color-tertiary-container)"
            icon={<Link2 className="w-4 h-4 text-on-tertiary-container stroke-[2.2px]" />}
          />
          <span className="m3-label-medium text-xs font-mono font-bold text-primary truncate">
            {domain}
          </span>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold">
          {subjectName}
        </span>
      </div>

      <div className="space-y-1">
        <h4 className="m3-title-medium-emp text-on-surface line-clamp-1 flex items-center justify-between">
          <span className="truncate">{title}</span>
          <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant shrink-0 ml-1" />
        </h4>
        {whySaved && (
          <p className="m3-body-medium text-on-surface-variant text-xs line-clamp-2 leading-relaxed">
            &ldquo;{whySaved}&rdquo;
          </p>
        )}
      </div>
    </motion.div>
  );
};
