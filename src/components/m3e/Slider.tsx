import React from 'react';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  className?: string;
  label?: string;
  valueFormatter?: (val: number) => string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  className = '',
  label,
  valueFormatter,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const formattedValue = valueFormatter ? valueFormatter(value) : String(value);

  return (
    <div className={`space-y-1.5 w-full select-none ${className}`}>
      <div className="flex justify-between items-center text-xs">
        {label && <span className="m3-label-medium text-on-surface-variant font-medium">{label}</span>}
        <span className="font-mono m3-label-large font-bold text-primary">
          {formattedValue}
        </span>
      </div>

      <div className="relative flex items-center h-8">
        <div className="w-full h-4 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30">
          <div
            className="h-full bg-primary transition-all rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-7 rounded-full bg-on-primary border-2 border-primary shadow-md pointer-events-none transition-transform active:scale-110"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
