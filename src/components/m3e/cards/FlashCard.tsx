import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layers, RotateCw } from 'lucide-react';
import { useMotionPreset } from '../../../theme/motion';
import { Shape } from '../../../theme/shapes';

export interface FlashCardProps {
  question: string;
  answer: string;
  explanation?: string;
  isFlipped: boolean;
  onFlip: () => void;
  boxLevel?: number;
  subjectName?: string;
  className?: string;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  question,
  answer,
  explanation,
  isFlipped,
  onFlip,
  boxLevel = 1,
  subjectName = 'Revision',
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <div
      onClick={onFlip}
      className={`relative w-full max-w-md h-96 perspective-1000 cursor-pointer select-none ${className}`}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={motionPreset.spatialDefault}
        className="w-full h-full relative preserve-3d"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT FACE */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            borderTopLeftRadius: '48px',
            borderTopRightRadius: '16px',
            borderBottomRightRadius: '48px',
            borderBottomLeftRadius: '16px',
          }}
          className="absolute inset-0 p-6 bg-surface-container-high text-on-surface border-2 border-outline-variant/40 shadow-xl flex flex-col justify-between"
        >
          {/* Top metadata badge */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-surface-container-highest text-primary m3-label-medium font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Leitner Box {boxLevel}</span>
            </span>
            <span className="m3-label-medium text-xs text-on-surface-variant font-mono">
              {subjectName}
            </span>
          </div>

          {/* Question Text */}
          <div className="py-4 text-center my-auto">
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest font-mono block mb-2">
              QUESTION
            </span>
            <h3 className="m3-headline-medium-emp text-on-surface leading-snug">
              {question}
            </h3>
          </div>

          {/* Flip Hint */}
          <div className="flex items-center justify-center gap-1.5 text-on-surface-variant m3-label-medium text-xs">
            <RotateCw className="w-3.5 h-3.5 animate-pulse" />
            <span>Tap anywhere to reveal answer</span>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderTopLeftRadius: '48px',
            borderTopRightRadius: '16px',
            borderBottomRightRadius: '48px',
            borderBottomLeftRadius: '16px',
          }}
          className="absolute inset-0 p-6 bg-primary-container text-on-primary-container border-2 border-primary shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* Decorative Corner Shape */}
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
            <Shape name="softBurst" size={140} fill="var(--md-sys-color-primary)" />
          </div>

          {/* Top metadata badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-surface/20 text-on-primary-container m3-label-medium font-bold flex items-center gap-1.5 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Key Concept</span>
            </span>
            <span className="m3-label-medium text-xs opacity-80 uppercase font-mono tracking-wider">
              Answer
            </span>
          </div>

          {/* Answer Content */}
          <div className="relative z-10 py-2 text-center my-auto space-y-3">
            <div className="m3-title-large-emp text-on-primary-container leading-relaxed">
              {answer}
            </div>
            {explanation && (
              <p className="m3-body-medium text-on-primary-container/85 text-xs italic">
                {explanation}
              </p>
            )}
          </div>

          {/* Flip back Hint */}
          <div className="relative z-10 flex items-center justify-center gap-1.5 text-on-primary-container/80 m3-label-medium text-xs">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Tap to flip back</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
