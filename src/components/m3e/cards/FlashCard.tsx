import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionPreset } from '../../../theme/motion';
import { ShapeBadge } from '../ShapeBadge';
import { ShapeName } from '../../../theme/shapes';
import { RotateCw, Check, X, Sparkles, Gem } from 'lucide-react';

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
    <div className={`relative w-full max-w-md mx-auto perspective-[1200px] select-none ${className}`}>
      {/* 3D Stack Depth Layers */}
      <div className="absolute inset-x-3 -bottom-2 h-full rounded-[32px] bg-surface-container-low opacity-60 scale-[0.96] pointer-events-none transform -rotate-1 shadow-md" />
      <div className="absolute inset-x-6 -bottom-4 h-full rounded-[32px] bg-surface-container-lowest opacity-40 scale-[0.92] pointer-events-none transform rotate-1 shadow-sm" />

      {/* Main Active Card */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={motionPreset.spatialDefault}
        className="relative w-full min-h-[340px] rounded-[32px] p-7 bg-surface-container-high shadow-2xl flex flex-col justify-between cursor-pointer transform-style-3d"
        onClick={handleFlip}
      >
        {!isFlipped ? (
          /* Front */
          <div className="flex flex-col justify-between h-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShapeBadge
                  shape={shape}
                  size={36}
                  shapeFill="rgba(208, 188, 255, 0.2)"
                  icon={<Sparkles className="w-4 h-4 text-primary" />}
                />
                {subjectName && (
                  <span className="text-xs font-bold text-on-surface-variant">
                    {subjectName}
                  </span>
                )}
              </div>

              {/* Leitner Box Gemstone Indicator */}
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container text-xs font-mono font-bold text-primary shadow-sm">
                <Gem className="w-3.5 h-3.5 text-primary" />
                <span>Level {currentBox + 1} / 5</span>
              </div>
            </div>

            <div className="my-auto py-4 text-center space-y-3">
              <p className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight leading-relaxed">
                {cardFront}
              </p>
              {cardHint && (
                <p className="text-xs text-on-surface-variant/80 italic bg-surface-container p-2.5 rounded-2xl max-w-xs mx-auto">
                  💡 Hint: {cardHint}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Tap card to reveal answer</span>
            </div>
          </div>
        ) : (
          /* Back */
          <div
            className="flex flex-col justify-between h-full space-y-6 transform rotate-y-180"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider font-mono">
                Key Answer Concept
              </span>
              <button
                type="button"
                onClick={handleFlip}
                className="p-1.5 rounded-full hover:bg-white/10 text-on-surface-variant cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto py-4 text-center space-y-3">
              <p className="text-lg sm:text-xl font-bold text-on-surface leading-relaxed">
                {cardBack}
              </p>
              {cardHint && (
                <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container p-2.5 rounded-2xl">
                  {cardHint}
                </p>
              )}
            </div>

            {onAnswer ? (
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onAnswer('again')}
                  className="py-2.5 rounded-xl bg-error-container text-on-error-container font-extrabold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAnswer('hard')}
                  className="py-2.5 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Hard</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAnswer('good')}
                  className="py-2.5 rounded-xl bg-primary-container text-on-primary-container font-extrabold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Good</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAnswer('easy')}
                  className="py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
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
