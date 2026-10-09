import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMotionPreset, sheetCardVariants } from '../../theme/motion';

export interface SheetCardProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const SheetCard: React.FC<SheetCardProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 pointer-events-none select-none">
          {/* Flat dim backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionPreset.effectsFast}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 pointer-events-auto"
          />

          {/* Floating Sheet Card */}
          <motion.div
            variants={sheetCardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={motionPreset.spatialDefault}
            className={`relative w-full max-w-lg bg-surface-container-high text-on-surface rounded-xl-inc p-5 border border-outline-variant/40 shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[85vh] mb-12 sm:mb-0 ${className}`}
          >
            {/* Header */}
            {(title || subtitle) && (
              <div className="flex items-start justify-between pb-3 mb-2 border-b border-outline-variant/30">
                <div>
                  {title && <h2 className="m3-title-large-emp text-on-surface">{title}</h2>}
                  {subtitle && (
                    <p className="m3-body-medium text-on-surface-variant pt-0.5">{subtitle}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content Area */}
            <div className="overflow-y-auto scroll-container flex-1 py-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
