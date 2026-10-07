import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../../store/useLibraryStore';
import { ArrowLeft, Bot, BookOpen } from 'lucide-react';
import type { Item } from '../../db/schema';

export const ReaderScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const items = useLibraryStore(state => state.items);
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    const found = items.find(i => i.id === id);
    if (found) {
      setItem(found);
    }
  }, [id, items]);

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs text-text-secondary mb-4">Document not found.</p>
        <button
          onClick={() => navigate('/library')}
          className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium"
        >
          Return to Library
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      {/* Reader Navbar */}
      <div className="h-14 border-b border-border-subtle px-4 flex items-center justify-between flex-shrink-0 bg-bg-secondary">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-text-primary truncate max-w-[200px]">{item.title}</h2>
            <p className="text-[10px] text-text-muted">{item.pageCount || 1} pages</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/coach?itemId=${item.id}`)}
          className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Bot size={14} />
          <span>AI Coach</span>
        </button>
      </div>

      {/* Reader Content / Preview */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
        {item.thumbnail ? (
          <div className="max-w-xs rounded-2xl overflow-hidden shadow-2xl border border-border-medium mb-4">
            <img src={item.thumbnail} alt={item.title} className="w-full object-contain" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent mb-4">
            <BookOpen size={36} />
          </div>
        )}
        <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
        <p className="text-xs text-text-secondary max-w-xs mt-1">
          PDF is parsed and indexed in your local vault. Full lazy page-by-page PDF view with text selection arrives in Phase 2.
        </p>
      </div>
    </div>
  );
};
