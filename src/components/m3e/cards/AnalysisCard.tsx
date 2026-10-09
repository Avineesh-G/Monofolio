import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ShieldAlert, CheckCircle2, ChevronRight, AlertTriangle, Lightbulb } from 'lucide-react';
import { ShapeBadge } from '../ShapeBadge';
import { useMotionPreset } from '../../../theme/motion';

export type AnalysisTabKey = 'overview' | 'reality' | 'concepts' | 'traps' | 'plan' | 'action';

export interface AnalysisCardProps {
  id?: string;
  type?: AnalysisTabKey;
  title?: string;
  items?: string[];
  realityVerdict?: string;
  documentTitle?: string;
  mode?: 'blunt' | 'supportive';
  readinessScore?: number;
  weakPointsCount?: number;
  findingsCount?: number;
  createdAt?: string;
  onClick?: () => void;
  className?: string;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  type,
  title,
  items,
  realityVerdict,
  documentTitle,
  mode = 'blunt',
  readinessScore,
  weakPointsCount,
  findingsCount,
  createdAt,
  onClick,
  className = '',
}) => {
  const motionPreset = useMotionPreset();

  // If rendered as diagnostic overview in Coach screen with items
  if (items || realityVerdict || title) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionPreset.spatialDefault}
        className={`p-5 rounded-[26px] bg-surface-container/90 border border-white/10 m3-glass-elevated shadow-xl space-y-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShapeBadge
              shape={type === 'reality' ? 'softBurst' : type === 'traps' ? 'diamond' : 'flower'}
              size={36}
              shapeFill={type === 'reality' ? 'rgba(242, 184, 181, 0.2)' : 'rgba(208, 188, 255, 0.2)'}
              icon={
                type === 'reality' ? (
                  <ShieldAlert className="w-4 h-4 text-error stroke-[2.2px]" />
                ) : type === 'traps' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-300 stroke-[2.2px]" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-primary stroke-[2.2px]" />
                )
              }
            />
            <h3 className="text-base font-extrabold text-on-surface tracking-tight">
              {title || 'AI Coach Analysis'}
            </h3>
          </div>
        </div>

        {realityVerdict && (
          <div className="p-3.5 rounded-2xl bg-error/15 border border-error/30 text-xs text-error font-medium leading-relaxed">
            <strong className="block text-sm font-bold pb-1 uppercase tracking-wide">Reality Verdict:</strong>
            {realityVerdict}
          </div>
        )}

        {items && items.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-on-surface leading-relaxed p-2.5 rounded-xl bg-surface-container-high/60 border border-white/5"
              >
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="flex-1">{item}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // Summary Card representation
  const isBlunt = mode === 'blunt';
  return (
    <motion.div
      whileTap={onClick ? motionPreset.tapFeedback.whileTap : undefined}
      transition={motionPreset.tapFeedback.transition}
      onClick={onClick}
      className={`p-4 rounded-[24px] border border-white/10 bg-surface-container/80 backdrop-blur-md shadow-md cursor-pointer select-none space-y-3 hover:border-primary/40 hover:bg-surface-container-high transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <ShapeBadge
            shape={isBlunt ? 'softBurst' : 'flower'}
            size={40}
            shapeFill={isBlunt ? 'rgba(242, 184, 181, 0.2)' : 'rgba(208, 188, 255, 0.2)'}
            glow
            glowColor={isBlunt ? 'rgba(242, 184, 181, 0.3)' : 'rgba(208, 188, 255, 0.3)'}
            icon={
              isBlunt ? (
                <ShieldAlert className="w-4 h-4 text-error stroke-[2.2px]" />
              ) : (
                <Brain className="w-4 h-4 text-primary stroke-[2.2px]" />
              )
            }
          />

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isBlunt
                    ? 'bg-error-container text-on-error-container'
                    : 'bg-primary-container text-on-primary-container'
                }`}
              >
                {isBlunt ? 'Brutal Examiner' : 'Supportive Coach'}
              </span>
              {createdAt && (
                <span className="text-[10px] font-mono text-on-surface-variant/70">
                  {new Date(createdAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-on-surface truncate leading-tight">
              {documentTitle || 'Document Analysis'}
            </h4>
          </div>
        </div>

        {readinessScore !== undefined && (
          <div className="text-right shrink-0">
            <div
              className={`text-xl font-extrabold font-mono leading-none ${
                readinessScore < 60
                  ? 'text-error'
                  : readinessScore < 80
                  ? 'text-warning'
                  : 'text-success'
              }`}
            >
              {readinessScore}%
            </div>
            <span className="text-[10px] uppercase font-mono text-on-surface-variant/80 font-bold">
              Readiness
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 text-xs text-on-surface-variant border-t border-white/5">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-error" />
            <span>{weakPointsCount || 0} Blindspots</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>{findingsCount || 0} Findings</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-primary text-xs font-bold">
          <span>View Report</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
};
