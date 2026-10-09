import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, StickyNote, Link2, BookOpen, Layers, Settings, LucideIcon } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';
import { useLocation, useNavigate } from 'react-router-dom';

export interface FabMenuOption {
  id: 'pdf' | 'note' | 'link' | 'library' | 'quiz' | 'settings';
  label: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
}

export interface FabProps {
  onSelectOption?: (optionId: 'pdf' | 'note' | 'link' | 'library' | 'quiz' | 'settings') => void;
}

export const Fab: React.FC<FabProps> = ({ onSelectOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const motionPreset = useMotionPreset();

  if (location.pathname.startsWith('/reader/') || location.pathname.startsWith('/dev/')) {
    return null;
  }

  // Extended Speed Dial Actions for Mobile
  const menuOptions: FabMenuOption[] = [
    {
      id: 'pdf',
      label: 'Upload Document',
      icon: FileText,
      bgColor: 'rgba(208, 188, 255, 0.25)',
      textColor: '#d0bcff',
    },
    {
      id: 'note',
      label: 'New Study Note',
      icon: StickyNote,
      bgColor: 'rgba(204, 194, 220, 0.25)',
      textColor: '#ccc2dc',
    },
    {
      id: 'link',
      label: 'Save Web Link',
      icon: Link2,
      bgColor: 'rgba(239, 184, 200, 0.25)',
      textColor: '#efb8c8',
    },
    {
      id: 'library',
      label: 'Open Library',
      icon: BookOpen,
      bgColor: 'rgba(196, 199, 218, 0.25)',
      textColor: '#c4c7da',
    },
    {
      id: 'quiz',
      label: 'Flashcard Quiz',
      icon: Layers,
      bgColor: 'rgba(218, 190, 200, 0.25)',
      textColor: '#dabece',
    },
    {
      id: 'settings',
      label: 'Settings & Vault',
      icon: Settings,
      bgColor: 'rgba(230, 224, 233, 0.25)',
      textColor: '#e6e0e9',
    },
  ];

  const handleSelect = (id: 'pdf' | 'note' | 'link' | 'library' | 'quiz' | 'settings') => {
    setIsOpen(false);
    if (id === 'library') {
      navigate('/library');
      return;
    }
    if (id === 'quiz') {
      navigate('/quiz');
      return;
    }
    if (id === 'settings') {
      navigate('/settings');
      return;
    }
    if (onSelectOption) {
      onSelectOption(id);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Dim Backdrop when Speed Dial is active */}
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

      {/* Upward Speed Dial Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={motionPreset.spatialDefault}
            className="absolute bottom-16 right-0 z-50 flex flex-col items-end gap-2.5 pointer-events-auto pb-2 min-w-[200px]"
          >
            {menuOptions.map((opt, idx) => {
              const Icon = opt.icon;
              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, x: 16, scale: 0.85 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 16, scale: 0.85 }}
                  transition={{
                    ...motionPreset.spatialDefault,
                    delay: idx * 0.03,
                  }}
                  whileTap={motionPreset.tapFeedback.whileTap}
                  onClick={() => handleSelect(opt.id)}
                  className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
                >
                  <span className="px-3 py-1 rounded-full bg-surface-container-highest/95 dark:bg-[#201824]/95 backdrop-blur-md text-on-surface text-xs font-bold shadow-lg tracking-tight border border-outline-variant/30 whitespace-nowrap">
                    {opt.label}
                  </span>

                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl group-active:scale-95 transition-transform duration-200 border border-outline-variant/30"
                    style={{ backgroundColor: opt.bgColor, color: opt.textColor }}
                  >
                    <Icon className="w-4.5 h-4.5 stroke-[2.2px]" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* M3 Sized '+' FAB matching exact 54px dock height */}
      <motion.button
        whileTap={motionPreset.tapFeedback.whileTap}
        transition={motionPreset.tapFeedback.transition}
        onClick={() => setIsOpen(!isOpen)}
        className="w-[54px] h-[54px] rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary shadow-[0_16px_40px_rgba(0,0,0,0.65)] flex items-center justify-center pointer-events-auto cursor-pointer focus:outline-none active:scale-95 transition-transform border border-white/10 shrink-0"
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
  );
};
