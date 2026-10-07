import React, { useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { fadeInScaleVariants } from '../theme/motion';

interface SheetCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SheetCard: React.FC<SheetCardProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Floating Popup Card (Not a full-width bottom sheet) */}
          <m.div
            variants={fadeInScaleVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'relative z-10 w-full max-w-sm rounded-2xl bg-bg-secondary border border-border-medium shadow-2xl p-5 overflow-hidden',
              className
            )}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
              <h2 className="text-base font-semibold text-text-primary tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-95 transition-transform"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto scroll-container">
              {children}
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};
