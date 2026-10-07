import React from 'react';
import { Bot, Brain, StickyNote, X } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

interface SelectionPopupProps {
  selectedText: string;
  position: { x: number; y: number } | null;
  onExplain: (text: string) => void;
  onQuizMe: (text: string) => void;
  onSaveToNote: (text: string) => void;
  onClose: () => void;
}

export const SelectionPopup: React.FC<SelectionPopupProps> = ({
  selectedText,
  position,
  onExplain,
  onQuizMe,
  onSaveToNote,
  onClose,
}) => {
  if (!selectedText.trim() || !position) return null;

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0, scale: 0.9, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 4 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-3"
        style={{
          left: Math.max(140, Math.min(window.innerWidth - 140, position.x)),
          top: Math.max(70, position.y - 12),
        }}
      >
        <div className="flex items-center gap-1 p-1.5 rounded-xl bg-bg-elevated/95 border border-border-medium shadow-2xl backdrop-blur-md">
          <button
            onClick={() => onExplain(selectedText)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent text-xs font-semibold active:scale-95 transition-all"
          >
            <Bot size={13} />
            <span>Explain</span>
          </button>

          <button
            onClick={() => onQuizMe(selectedText)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold active:scale-95 transition-all"
          >
            <Brain size={13} />
            <span>Quiz Me</span>
          </button>

          <button
            onClick={() => onSaveToNote(selectedText)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold active:scale-95 transition-all"
          >
            <StickyNote size={13} />
            <span>Save Note</span>
          </button>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 active:scale-95 transition-all ml-0.5"
            aria-label="Dismiss selection popup"
          >
            <X size={14} />
          </button>
        </div>
      </m.div>
    </AnimatePresence>
  );
};
