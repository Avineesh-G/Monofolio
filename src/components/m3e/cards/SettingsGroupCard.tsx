import React from 'react';
import { ShapeBadge } from '../ShapeBadge';
import { ShapeName } from '../../../theme/shapes';
import { ChevronRight, LucideIcon } from 'lucide-react';

export interface SettingsRowItem {
  id: string;
  label: string;
  subtitle?: string;
  icon?: LucideIcon;
  shape?: ShapeName;
  shapeFill?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
}

export interface SettingsGroupCardProps {
  title?: string;
  items: SettingsRowItem[];
  className?: string;
}

export const SettingsGroupCard: React.FC<SettingsGroupCardProps> = ({
  title,
  items,
  className = '',
}) => {
  return (
    <div className={`space-y-2 select-none ${className}`}>
      {title && (
        <h3 className="m3-label-large font-bold uppercase tracking-wider text-primary px-2 text-xs">
          {title}
        </h3>
      )}

      <div className="rounded-xl bg-surface-container border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20 shadow-sm">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={item.onClick}
              className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                item.onClick ? 'cursor-pointer hover:bg-surface-container-high active:bg-surface-container-highest' : ''
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {Icon && (
                  <ShapeBadge
                    shape={item.shape || 'squircle'}
                    size={40}
                    shapeFill={item.shapeFill || 'var(--md-sys-color-surface-container-highest)'}
                    icon={<Icon className="w-4 h-4 text-primary stroke-[2.2px]" />}
                  />
                )}

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="m3-title-medium-emp text-on-surface truncate text-sm">
                    {item.label}
                  </div>
                  {item.subtitle && (
                    <div className="m3-label-medium text-on-surface-variant text-xs truncate">
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {item.trailing}
                {item.onClick && !item.trailing && (
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
