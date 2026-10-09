import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, StickyNote, Link2, LucideIcon } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';
import { Shape, ShapeName } from '../../theme/shapes';
import { useLocation } from 'react-router-dom';

export interface FabMenuOption {
  id: 'pdf' | 'note' | 'link';
  label: string;
  icon: LucideIcon;
  shape: ShapeName;
  containerBg: string;
  onColor: string;
}

export interface FabProps {
  onSelectOption?: (optionId: 'pdf' | 'note' | 'link') => void;
}

export const Fab: React.FC<FabProps> = ({ onSelectOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const motionPreset = useMotionPreset();

  if (location.pathname.startsWith('/reader/') || location.pathname.startsWith('/dev/')) {
    return null;
  }

  const menuOptions: FabMenuOption[] = [
    {
      id: 'pdf',
      label: 'Upload PDF Document',
      icon: FileText,
      shape: 'squircle',
      containerBg: 'var(--md-sys-color-primary-container)',
      onColor: 'var(--md-sys-color-on-primary-container)',
    },
    {
      id: 'note',
      label: 'Create Study Note',
      icon: StickyNote,
      shape: 'flower',
      containerBg: 'var(--md-sys-color-secondary-container)',
      onColor: 'var(--md-sys-color-on-secondary-container)',
    },
    {
      id: 'link',
      label: 'Save Resource Link',
      icon: Link2,
      shape: 'diamond',
      containerBg: 'var(--md-sys-color-tertiary-container)',
      onColor: 'var(--md-sys-color-on-tertiary-container)',
    },
  ];

  const handleSelect = (id: 'pdf' | 'note' | 'link') => {
    setIsOpen(false);
    if (onSelectOption) {
      onSelectOption(id);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionPreset.effectsFast}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-20 right-5 z-40 flex flex-col items-end gap-3 select-none pointer-events-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={motionPreset.spatialDefault}
              className="flex flex-col items-end gap-3 pointer-events-auto mb-1"
            >
              {menuOptions.map((opt, idx) => {
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      ...motionPreset.spatialDefault,
                      delay: idx * 0.04,
                    }}
                    whileTap={motionPreset.tapFeedback.whileTap}
                    onClick={() => handleSelect(opt.id)}
                    className="flex items-center gap-3 group"
                  >
                    <span className="px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface m3-label-large font-bold shadow-md border border-outline-variant/30">
                      {opt.label}
                    </span>

                    <div
                      className="w-12 h-12 relative flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                      style={{ color: opt.onColor }}
                    >
                      <Shape
                        name={opt.shape}
                        size={48}
                        fill={opt.containerBg}
                        className="absolute inset-0"
                      />
                      <Icon className="w-5 h-5 relative z-10 stroke-[2.2px]" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={motionPreset.tapFeedback.whileTap}
          transition={motionPreset.tapFeedback.transition}
          onClick={() => setIsOpen(!isOpen)}
          className="w-15 h-15 min-w-[56px] min-h-[56px] rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-xl border border-outline-variant/30 pointer-events-auto cursor-pointer"
          aria-label={isOpen ? 'Close Add Menu' : 'Add Item'}
        >
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={motionPreset.spatialDefault}
          >
            <Plus className="w-7 h-7 stroke-[2.5px]" />
          </motion.div>
        </motion.button>
      </div>
    </>
  );
};
