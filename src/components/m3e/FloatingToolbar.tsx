import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, StickyNote, Copy, X, LucideIcon } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';

export interface FloatingToolbarAction {
  id: 'explain' | 'quiz' | 'note' | 'copy';
  label: string;
  icon: LucideIcon;
}

export interface FloatingToolbarProps {
  isVisible: boolean;
  onAction: (actionId: 'explain' | 'quiz' | 'note' | 'copy') => void;
  onClose?: () => void;
  className?: string;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  isVisible,
  onAction,
  onClose,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  const actions: FloatingToolbarAction[] = [
    { id: 'explain', label: 'Explain', icon: Sparkles },
    { id: 'quiz', label: 'Make Quiz', icon: Brain },
    { id: 'note', label: 'Save Note', icon: StickyNote },
    { id: 'copy', label: 'Copy', icon: Copy },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.94 }}
          transition={motionPreset.spatialDefault}
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 rounded-full bg-tertiary-container text-on-tertiary-container border border-outline-variant/40 shadow-2xl ${className}`}
        >
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <motion.button
                key={act.id}
                whileTap={motionPreset.tapFeedback.whileTap}
                transition={motionPreset.tapFeedback.transition}
                onClick={() => onAction(act.id)}
                className="px-3.5 py-2 rounded-full m3-label-large font-bold flex items-center gap-1.5 hover:bg-black/10 transition-colors select-none"
              >
                <Icon size={16} className="text-on-tertiary-container stroke-[2.2px]" />
                <span className="truncate">{act.label}</span>
              </motion.button>
            );
          })}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/10 text-on-tertiary-container transition-colors ml-0.5"
              aria-label="Close toolbar"
            >
              <X size={16} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
