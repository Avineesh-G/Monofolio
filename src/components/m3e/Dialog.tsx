import React from 'react';
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionPreset.effectsFast}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 pointer-events-auto"
          />

          {/* Centered Dialog Surface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={motionPreset.spatialDefault}
            className="relative w-full max-w-sm bg-surface-container-high text-on-surface rounded-xl p-6 border border-outline-variant/40 shadow-2xl pointer-events-auto space-y-4"
          >
            {icon && (
              <div className="flex items-center justify-center text-primary">
                {icon}
              </div>
            )}

            <div className="space-y-1.5 text-center">
              <h3 className="m3-headline-small-emp m3-title-large-emp text-on-surface">{title}</h3>
              {description && (
                <p className="m3-body-medium text-on-surface-variant leading-relaxed">
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
