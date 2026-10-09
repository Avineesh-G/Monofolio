import React, { useEffect } from 'react';
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 select-none">
          {/* Flat dim backdrop - Click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionPreset.effectsFast}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Floating Sheet Card Surface - No white borders/lines */}
          <motion.div
            variants={sheetCardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={motionPreset.spatialDefault}
            className={`relative z-10 w-full max-w-lg bg-surface-container-high text-on-surface rounded-[28px] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] mb-12 sm:mb-0 ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header without white divider line */}
            {(title || subtitle) && (
              <div className="flex items-start justify-between pb-3">
                <div className="min-w-0 flex-1 pr-2">
                  {title && <h2 className="text-lg font-extrabold text-on-surface truncate">{title}</h2>}
                  {subtitle && (
                    <p className="text-xs text-on-surface-variant pt-0.5 font-medium">{subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface active:scale-90 transition-all cursor-pointer focus:outline-none shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 stroke-[2.2px]" />
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
