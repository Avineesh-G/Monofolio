import React from 'react';

export interface SettingsItem {
  id: string;
  label: string;
  subtitle?: string;
  icon?: any;
  trailing?: React.ReactNode;
  onClick?: () => void;
}

export interface SettingsGroupCardProps {
  title: string;
  items?: SettingsItem[];
  children?: React.ReactNode;
  className?: string;
}

export const SettingsGroupCard: React.FC<SettingsGroupCardProps> = ({
  title,
  items,
  children,
  className = '',
}) => {
  return (
    <div className={`rounded-[24px] bg-surface-container/80 border border-white/10 m3-glass p-4 space-y-3 shadow-md ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-primary px-1">
        {title}
      </h3>

      {items && items.length > 0 && (
        <div className="divide-y divide-white/5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.onClick}
                className={`py-3 flex items-center justify-between gap-3 ${
                  item.onClick ? 'cursor-pointer hover:bg-white/5 px-2 rounded-xl transition-colors' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {Icon && (
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-on-surface truncate">
                      {item.label}
                    </h4>
                    {item.subtitle && (
                      <p className="text-xs text-on-surface-variant font-medium">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                {item.trailing && <div className="shrink-0">{item.trailing}</div>}
              </div>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
};
