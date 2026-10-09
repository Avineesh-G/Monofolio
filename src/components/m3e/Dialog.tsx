import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionPreset } from '../../theme/motion';
import { Button } from './Button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isDestructive = false,
  icon,
  children,
}) => {
  const motionPreset = useMotionPreset();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionPreset.effectsFast}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Centered Dialog Surface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={motionPreset.spatialDefault}
            className="relative z-10 w-full max-w-sm bg-surface-container-high text-on-surface rounded-[28px] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {icon && (
              <div className="flex items-center justify-center text-primary">
                {icon}
              </div>
            )}

            <div className="space-y-1.5 text-center">
              <h3 className="text-lg font-extrabold text-on-surface">{title}</h3>
              {description && (
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                  {description}
                </p>
              )}
            </div>

            {children && <div>{children}</div>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="text" size="sm" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                variant={isDestructive ? 'error' : 'filled'}
                size="sm"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
