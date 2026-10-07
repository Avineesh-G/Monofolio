import React, { useState } from 'react';
import { m, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { RotateCw, Check, X, Sparkles, Brain } from 'lucide-react';
import type { QuizCard } from '../../db/schema';

interface FlashcardProps {
  card: QuizCard;
  onAnswer: (correct: boolean) => void;
  index: number;
  total: number;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  card,
  onAnswer,
  index,
  total,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const x = useMotionValue(0);

  // Animate strictly transform and opacity
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
  const rightSwipeCueOpacity = useTransform(x, [20, 100], [0, 1]);
  const leftSwipeCueOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 90;
    if (info.offset.x > swipeThreshold) {
      onAnswer(true);
    } else if (info.offset.x < -swipeThreshold) {
      onAnswer(false);
    }
  };

  const getBoxLabel = (box: number) => {
    switch (box) {
      case 0: return 'Box 0 (Learning)';
      case 1: return 'Box 1 (1 Day)';
      case 2: return 'Box 2 (3 Days)';
      case 3: return 'Box 3 (1 Week)';
      case 4: return 'Box 4 (Mastered)';
      default: return `Box ${box}`;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center select-none relative">
      {/* Progress & Box Pill */}
      <div className="w-full flex items-center justify-between text-xs text-text-muted mb-3 px-1">
        <span className="font-semibold text-text-primary">Card {index + 1} of {total}</span>
        <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-border-subtle font-mono text-[10px]">
          {getBoxLabel(card.box)}
        </span>
      </div>

      {/* Swipeable 3D Card Container */}
      <div className="w-full h-80 relative [perspective:1000px]">
        {/* Swipe Indicators */}
        <m.div
          style={{ opacity: rightSwipeCueOpacity }}
          className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold pointer-events-none flex items-center gap-1"
        >
          <Check size={14} /> GOT IT
        </m.div>

        <m.div
          style={{ opacity: leftSwipeCueOpacity }}
          className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold pointer-events-none flex items-center gap-1"
        >
          <X size={14} /> AGAIN
        </m.div>

        <m.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full h-full cursor-pointer relative [transform-style:preserve-3d] transition-transform duration-300"
        >
          {/* FRONT SIDE (Question) */}
          <div
            className={`absolute inset-0 w-full h-full p-6 rounded-3xl bg-bg-elevated border border-border-medium shadow-2xl flex flex-col justify-between [backface-visibility:hidden] transition-opacity duration-200 ${
              isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="flex items-center justify-between text-accent">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Brain size={16} />
                <span>Active Recall</span>
              </div>
              <span className="text-[10px] text-text-muted">Tap to flip</span>
            </div>

            <div className="my-auto py-2">
              <h3 className="text-base md:text-lg font-bold text-text-primary leading-snug">
                {card.q}
              </h3>
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-muted pt-3 border-t border-border-subtle">
              <span>Swipe Right if Correct</span>
              <div className="flex items-center gap-1 text-accent">
                <RotateCw size={13} />
                <span>Reveal</span>
              </div>
            </div>
          </div>

          {/* BACK SIDE (Answer & Memory Anchor) */}
          <div
            className={`absolute inset-0 w-full h-full p-6 rounded-3xl bg-bg-card border border-accent/40 shadow-2xl flex flex-col justify-between [backface-visibility:hidden] transition-opacity duration-200 ${
              isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={16} />
                <span>Verified Answer</span>
              </div>
              <span className="text-[10px] text-text-muted">Tap to flip</span>
            </div>

            <div className="my-auto py-2 space-y-2.5 overflow-y-auto scroll-container max-h-48">
              <p className="text-sm font-semibold text-text-primary leading-relaxed">
                {card.a}
              </p>
              {card.explanation && (
                <div className="p-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-text-secondary leading-snug">
                  <span className="text-accent font-semibold">Anchor: </span>
                  {card.explanation}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-muted pt-3 border-t border-border-subtle">
              <span className="text-rose-400">&larr; Swipe Left (Retry)</span>
              <span className="text-emerald-400">Swipe Right (Pass) &rarr;</span>
            </div>
          </div>
        </m.div>
      </div>

      {/* Button Controls for Tap Accessible Devices */}
      <div className="w-full flex items-center justify-between gap-3 mt-5 px-2">
        <button
          onClick={() => onAnswer(false)}
          className="flex-1 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <X size={16} />
          <span>Again (Box 0)</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-border-subtle text-text-secondary hover:text-text-primary active:scale-95 transition-all"
          title="Flip Card"
        >
          <RotateCw size={16} />
        </button>

        <button
          onClick={() => onAnswer(true)}
          className="flex-1 py-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Check size={16} />
          <span>Good (Advance)</span>
        </button>
      </div>
    </div>
  );
};
