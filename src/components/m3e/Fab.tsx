import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, StickyNote, Link2, Brain, LucideIcon } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';
import { Shape, ShapeName } from '../../theme/shapes';
import { useLocation, useNavigate } from 'react-router-dom';

export interface FabMenuOption {
  id: 'pdf' | 'note' | 'link' | 'coach';
  label: string;
  icon: LucideIcon;
  shape: ShapeName;
  containerBg: string;
  onColor: string;
}

export interface FabProps {
  onSelectOption?: (optionId: 'pdf' | 'note' | 'link' | 'coach') => void;
}

export const Fab: React.FC<FabProps> = ({ onSelectOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const motionPreset = useMotionPreset();

  if (location.pathname.startsWith('/reader/') || location.pathname.startsWith('/dev/')) {
    return null;
  }

  const menuOptions: FabMenuOption[] = [
    {
      id: 'pdf',
      label: 'Upload Document',
      icon: FileText,
      shape: 'squircle',
      containerBg: 'rgba(208, 188, 255, 0.25)',
      onColor: '#d0bcff',
    },
    {
      id: 'note',
      label: 'New Study Note',
      icon: StickyNote,
      shape: 'flower',
      containerBg: 'rgba(204, 194, 220, 0.25)',
      onColor: '#ccc2dc',
    },
    {
      id: 'link',
      label: 'Save Web Link',
      icon: Link2,
      shape: 'diamond',
      containerBg: 'rgba(239, 184, 200, 0.25)',
      onColor: '#efb8c8',
    },
    {
      id: 'coach',
      label: 'Ask AI Coach',
      icon: Brain,
      shape: 'softBurst',
      containerBg: 'rgba(208, 188, 255, 0.35)',
      onColor: '#d0bcff',
    },
  ];

  const handleSelect = (id: 'pdf' | 'note' | 'link' | 'coach') => {
    setIsOpen(false);
    if (id === 'coach') {
      navigate('/coach');
      return;
    }
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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-3 select-none pointer-events-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={motionPreset.spatialDefault}
              className="flex flex-col items-end gap-3 pointer-events-auto mb-2"
            >
              {menuOptions.map((opt, idx) => {
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.id}
                    initial={{ opacity: 0, x: 24, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 24, scale: 0.8 }}
                    transition={{
                      ...motionPreset.spatialDefault,
                      delay: idx * 0.04,
                    }}
                    whileTap={motionPreset.tapFeedback.whileTap}
                    onClick={() => handleSelect(opt.id)}
                    className="flex items-center gap-3 group focus:outline-none cursor-pointer"
                  >
                    <span className="px-3.5 py-1.5 rounded-full m3-glass text-on-surface text-xs font-bold shadow-lg border border-white/10 tracking-tight">
                      {opt.label}
                    </span>

                    <div
                      className="w-12 h-12 relative flex items-center justify-center shadow-xl group-active:scale-95 transition-transform duration-200"
                      style={{ color: opt.onColor }}
                    >
                      <Shape
                        name={opt.shape}
                        size={48}
                        fill={opt.containerBg}
                        className="absolute inset-0 drop-shadow-md"
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
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-on-primary shadow-2xl border border-white/20 flex items-center justify-center pointer-events-auto cursor-pointer focus:outline-none active:scale-95 transition-transform"
          aria-label={isOpen ? 'Close Quick Menu' : 'Open Quick Menu'}
        >
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={motionPreset.spatialDefault}
          >
            <Plus className="w-6 h-6 stroke-[2.8px]" />
          </motion.div>
        </motion.button>
      </div>
    </>
  );
};
