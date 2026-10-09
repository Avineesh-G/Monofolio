import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  trailingAction?: React.ReactNode;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search documents, notes & links...',
  onClear,
  className = '',
  trailingAction,
}) => {
  return (
    <div
      className={`relative flex items-center h-12 px-4 rounded-full bg-surface-container-high text-on-surface border border-outline-variant/30 focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface-container-highest transition-all shadow-sm ${className}`}
    >
      <Search className="w-5 h-5 text-on-surface-variant mr-3 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 outline-none text-on-surface placeholder:text-on-surface-variant/60 m3-body-large"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-black/10 shrink-0 ml-1"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {trailingAction && <div className="ml-2 shrink-0">{trailingAction}</div>}
    </div>
  );
};
