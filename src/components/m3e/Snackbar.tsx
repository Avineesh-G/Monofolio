import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionPreset } from '../../theme/motion';

export interface SnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  isOpen,
  onClose,
  actionLabel,
  onAction,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={motionPreset.spatialFast}
          className={`fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-full bg-inverse-surface text-inverse-on-surface shadow-xl border border-outline-variant/30 select-none ${className}`}
        >
          <span className="m3-body-medium text-xs font-medium truncate flex-1">{message}</span>

          {actionLabel && (
            <button
              onClick={() => {
                if (onAction) onAction();
                onClose();
              }}
              className="px-2.5 py-1 rounded-full text-inverse-primary m3-label-large font-bold hover:bg-white/10 transition-colors shrink-0"
            >
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
