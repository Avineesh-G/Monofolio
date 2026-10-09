import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionPreset } from '../../../theme/motion';
import { ShapeBadge } from '../ShapeBadge';
import { ShapeName } from '../../../theme/shapes';
import { RotateCw, Check, X, Sparkles } from 'lucide-react';

export interface FlashCardProps {
  id?: string;
  front?: string;
  back?: string;
  question?: string;
  answer?: string;
  hint?: string;
  explanation?: string;
  box?: number;
  boxLevel?: number;
  isFlipped?: boolean;
  onFlip?: () => void;
  subjectName?: string;
  shape?: ShapeName;
  onAnswer?: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
  className?: string;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  front,
  back,
  question,
  answer,
  hint,
  explanation,
  box = 1,
  boxLevel,
  isFlipped: controlledFlipped,
  onFlip,
  subjectName,
  shape = 'squircle',
  onAnswer,
  className = '',
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const motionPreset = useMotionPreset();

  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;
  const cardFront = front || question || '';
  const cardBack = back || answer || '';
  const cardHint = hint || explanation;
  const currentBox = boxLevel !== undefined ? boxLevel : box;

  const handleFlip = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  return (
    <div className={`w-full perspective-[1000px] select-none ${className}`}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={motionPreset.spatialDefault}
        className="relative w-full min-h-[300px] rounded-[32px] p-6 m3-glass-elevated border border-white/10 shadow-2xl flex flex-col justify-between cursor-pointer transform-style-3d"
        onClick={handleFlip}
      >
        {!isFlipped ? (
          /* Front */
          <div className="flex flex-col justify-between h-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShapeBadge
                  shape={shape}
                  size={32}
                  shapeFill="rgba(208, 188, 255, 0.2)"
                  icon={<Sparkles className="w-3.5 h-3.5 text-primary" />}
                />
                {subjectName && (
                  <span className="text-xs font-bold text-on-surface-variant">
                    {subjectName}
                  </span>
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-mono font-bold text-primary border border-white/10">
                Box {currentBox} / 5
              </span>
            </div>

            <div className="my-auto py-4 text-center">
              <p className="text-xl font-bold text-on-surface tracking-tight leading-relaxed">
                {cardFront}
              </p>
              {cardHint && (
                <p className="text-xs text-on-surface-variant/70 italic mt-3">
                  💡 Hint: {cardHint}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-on-surface-variant/80">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Tap to flip card</span>
            </div>
          </div>
        ) : (
          /* Back */
          <div
            className="flex flex-col justify-between h-full space-y-6 transform rotate-y-180"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Answer
              </span>
              <button
                type="button"
                onClick={handleFlip}
                className="p-1.5 rounded-full hover:bg-white/10 text-on-surface-variant"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto py-4 text-center">
              <p className="text-lg font-semibold text-on-surface leading-relaxed">
                {cardBack}
              </p>
              {cardHint && (
                <p className="text-xs text-on-surface-variant/70 mt-3">
                  {cardHint}
                </p>
              )}
            </div>

            {onAnswer ? (
              <div className="grid grid-cols-4 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onAnswer('again')}
                  className="py-2.5 rounded-xl bg-error/20 text-error font-bold text-xs hover:bg-error/30 active:scale-95 transition-all flex flex-col items-center"
                >
                  <X className="w-4 h-4 mb-0.5" />
                  <span>Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAnswer('hard')}
                  className="py-2.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs hover:bg-amber-500/30 active:scale-95 transition-all flex flex-col items-center"
                >
                  <span>Hard</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAnswer('good')}
                  className="py-2.5 rounded-xl bg-primary/20 text-primary font-bold text-xs hover:bg-primary/30 active:scale-95 transition-all flex flex-col items-center"
                >
                  <Check className="w-4 h-4 mb-0.5" />
                  <span>Good</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAnswer('easy')}
                  className="py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs hover:bg-emerald-500/30 active:scale-95 transition-all flex flex-col items-center"
                >
                  <span>Easy</span>
                </button>
              </div>
            ) : null}
          </div>
        )}
      </motion.div>
    </div>
  );
};
