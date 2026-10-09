import React from 'react';
import { motion } from 'framer-motion';
import { ShapeBadge } from '../ShapeBadge';
import { ShapeName } from '../../../theme/shapes';
import { useMotionPreset } from '../../../theme/motion';
import { Cpu, Binary, Atom, BookOpen, LucideIcon } from 'lucide-react';

export interface SubjectCardProps {
  id?: string;
  name: string;
  code?: string;
  color?: string;
  category?: 'cs' | 'math' | 'science' | 'humanities' | 'general';
  topicCount?: number;
  docCount?: number;
  mastery?: number;
  masteryPercent?: number;
  shape?: ShapeName;
  onClick: () => void;
  className?: string;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  code,
  color,
  category,
  topicCount = 0,
  docCount = 0,
  mastery,
  masteryPercent,
  shape,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();
  const displayMastery = masteryPercent !== undefined ? masteryPercent : (mastery || 0);

  // Infer course category if not explicitly provided
  const detectedCategory = category || (() => {
    const lower = name.toLowerCase();
    if (lower.includes('network') || lower.includes('system') || lower.includes('code') || lower.includes('program') || lower.includes('data') || lower.includes('algo') || lower.includes('computer')) return 'cs';
    if (lower.includes('math') || lower.includes('calc') || lower.includes('algebra') || lower.includes('stat') || lower.includes('discrete')) return 'math';
    if (lower.includes('physic') || lower.includes('chem') || lower.includes('bio') || lower.includes('electr') || lower.includes('circuit')) return 'science';
    return 'humanities';
  })();

  const courseTheme: Record<string, { icon: LucideIcon; shape: ShapeName; defaultColor: string; bgGradient: string }> = {
    cs: {
      icon: Cpu,
      shape: 'squircle',
      defaultColor: '#d0bcff',
      bgGradient: 'from-surface-container via-surface-container to-[#1a162b]',
    },
    math: {
      icon: Binary,
      shape: 'diamond',
      defaultColor: '#f5b041',
      bgGradient: 'from-surface-container via-surface-container to-[#291e12]',
    },
    science: {
      icon: Atom,
      shape: 'clover4',
      defaultColor: '#7cd992',
      bgGradient: 'from-surface-container via-surface-container to-[#112419]',
    },
    humanities: {
      icon: BookOpen,
      shape: 'flower',
      defaultColor: '#efb8c8',
      bgGradient: 'from-surface-container via-surface-container to-[#28151f]',
    },
  };

  const theme = courseTheme[detectedCategory] || courseTheme.humanities;
  const activeColor = color || theme.defaultColor;
  const activeShape = shape || theme.shape;
  const IconComponent = theme.icon;

  return (
    <motion.div
      whileTap={motionPreset.tapFeedback.whileTap}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-4 rounded-[26px] bg-gradient-to-br ${theme.bgGradient} cursor-pointer flex flex-col justify-between min-h-[120px] shadow-md hover:bg-surface-container-high active:scale-98 transition-all relative overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <ShapeBadge
          shape={activeShape}
          size={38}
          shapeFill="rgba(255, 255, 255, 0.08)"
          glow
          glowColor={activeColor}
          icon={<IconComponent className="w-4 h-4 stroke-[2.2px]" style={{ color: activeColor }} />}
        />

        {code ? (
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono font-bold text-on-surface-variant">
            {code}
          </span>
        ) : (
          <span className="text-[10px] font-mono font-bold text-primary opacity-80">
            {displayMastery}% mastery
          </span>
        )}
      </div>

      <div className="pt-2 space-y-1">
        <h3 className="text-sm font-bold text-on-surface truncate leading-tight">
          {name}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
          <span>{topicCount} {topicCount === 1 ? 'topic' : 'topics'}</span>
          <span>&bull;</span>
          <span>{docCount} docs</span>
        </div>
      </div>
    </motion.div>
  );
};
