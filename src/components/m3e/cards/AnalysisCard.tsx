import React from 'react';
import { Sparkles, AlertTriangle, Target, CheckCircle2, ShieldAlert, LucideIcon } from 'lucide-react';
import { Shape, ShapeName } from '../../../theme/shapes';

export type AnalysisTabKey =
  | 'cheatSheet'
  | 'blindSpots'
  | 'examTraps'
  | 'actionPlan'
  | 'realityCheck'
  | 'overview'
  | 'reality'
  | 'concepts'
  | 'traps'
  | 'action';

export interface AnalysisCardProps {
  type: AnalysisTabKey;
  title: string;
  items: string[];
  realityVerdict?: string;
  className?: string;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  type,
  title,
  items,
  realityVerdict,
  className = '',
}) => {
  const tabConfigs: Record<string, {
    bg: string;
    icon: LucideIcon;
    shape: ShapeName;
    accentColor: string;
  }> = {
    cheatSheet: {
      bg: 'bg-primary-container text-on-primary-container',
      icon: Sparkles,
      shape: 'flower',
      accentColor: 'var(--md-sys-color-primary)',
    },
    overview: {
      bg: 'bg-primary-container text-on-primary-container',
      icon: Sparkles,
      shape: 'flower',
      accentColor: 'var(--md-sys-color-primary)',
    },
    concepts: {
      bg: 'bg-primary-container text-on-primary-container',
      icon: Sparkles,
      shape: 'flower',
      accentColor: 'var(--md-sys-color-primary)',
    },
    blindSpots: {
      bg: 'bg-secondary-container text-on-secondary-container',
      icon: AlertTriangle,
      shape: 'burst',
      accentColor: 'var(--md-sys-color-secondary)',
    },
    examTraps: {
      bg: 'bg-tertiary-container text-on-tertiary-container',
      icon: Target,
      shape: 'cookie9',
      accentColor: 'var(--md-sys-color-tertiary)',
    },
    traps: {
      bg: 'bg-tertiary-container text-on-tertiary-container',
      icon: Target,
      shape: 'cookie9',
      accentColor: 'var(--md-sys-color-tertiary)',
    },
    actionPlan: {
      bg: 'bg-surface-container-high text-on-surface',
      icon: CheckCircle2,
      shape: 'squircle',
      accentColor: 'var(--md-sys-color-primary)',
    },
    action: {
      bg: 'bg-surface-container-high text-on-surface',
      icon: CheckCircle2,
      shape: 'squircle',
      accentColor: 'var(--md-sys-color-primary)',
    },
    realityCheck: {
      bg: 'bg-error-container text-on-error-container',
      icon: ShieldAlert,
      shape: 'heart',
      accentColor: 'var(--md-sys-color-error)',
    },
    reality: {
      bg: 'bg-error-container text-on-error-container',
      icon: ShieldAlert,
      shape: 'heart',
      accentColor: 'var(--md-sys-color-error)',
    },
  };

  const config = tabConfigs[type] || tabConfigs.cheatSheet;
  const Icon = config.icon;

  return (
    <div
      style={{
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '16px',
        borderBottomRightRadius: '32px',
        borderBottomLeftRadius: '16px',
      }}
      className={`relative w-full p-6 ${config.bg} border border-outline-variant/40 shadow-md select-none overflow-hidden space-y-4 ${className}`}
    >
      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
        <Shape name={config.shape} size={150} fill={config.accentColor} />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center">
            <Icon className="w-5 h-5 stroke-[2.4px]" />
          </div>
          <div>
            <h3 className="m3-headline-small-emp m3-title-large-emp tracking-tight">
              {title}
            </h3>
            <span className="m3-label-medium text-xs opacity-80 uppercase font-mono tracking-wider">
              Blunt AI Coach
            </span>
          </div>
        </div>
      </div>

      {realityVerdict && (
        <div className="relative z-10 p-3.5 rounded-2xl bg-black/15 border border-black/10 font-bold m3-body-large leading-relaxed">
          &ldquo;{realityVerdict}&rdquo;
        </div>
      )}

      <div className="relative z-10 space-y-2.5 pt-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-current opacity-60 mt-1.5 shrink-0" />
            <span className="m3-body-large text-sm opacity-95 flex-1 font-medium">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
