import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ExternalLink } from 'lucide-react';
import { ShapeBadge } from '../ShapeBadge';
import { useMotionPreset } from '../../../theme/motion';

export interface LinkCardProps {
  id?: string;
  title: string;
  url: string;
  whySaved?: string;
  subjectName?: string;
  createdAt?: string | number;
  onClick?: () => void;
  className?: string;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  title,
  url,
  whySaved,
  subjectName,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  const domain = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  })();

  return (
    <motion.div
      whileTap={onClick ? motionPreset.tapFeedback.whileTap : undefined}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-4 rounded-[22px] bg-surface-container/90 border border-white/10 m3-glass flex flex-col justify-between cursor-pointer shadow-sm hover:border-white/20 hover:bg-surface-container-high transition-all ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <ShapeBadge
              shape="diamond"
              size={36}
              shapeFill="rgba(239, 184, 200, 0.2)"
              icon={<Globe className="w-4 h-4 text-tertiary stroke-[2.2px]" />}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-on-surface truncate">
                {title}
              </h4>
              <p className="text-[11px] font-mono text-tertiary truncate">
                {domain}
              </p>
            </div>
          </div>
          {subjectName && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-on-surface-variant truncate max-w-[100px]">
              {subjectName}
            </span>
          )}
        </div>

        {whySaved && (
          <p className="text-xs text-on-surface-variant/90 line-clamp-2 leading-relaxed bg-surface-container-highest/50 p-2 rounded-xl">
            {whySaved}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end pt-2 text-xs font-bold text-primary gap-1">
        <span>Open Link</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  );
};
