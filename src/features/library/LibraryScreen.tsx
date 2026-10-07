import React, { useState, useEffect, useMemo, useCallback, useTransition, useRef } from 'react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { VirtualList } from '../../components/VirtualList';
import { EmptyState } from '../../components/EmptyState';
import { formatDate } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  StickyNote, 
  Link2, 
  Star, 
  Trash2, 
  BookOpen,
} from 'lucide-react';
import type { Item } from '../../db/schema';

// Memoized single row component to prevent re-render storms on large virtual lists
const ItemRow = React.memo(({
  item,
  subjectColor,
  subjectName,
  onToggleStar,
  onDelete,
  onOpen,
}: {
  item: Item;
  subjectColor?: string;
  subjectName?: string;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (item: Item) => void;
}) => {
  const getIcon = () => {
    switch (item.kind) {
      case 'pdf':
        return <FileText size={18} className="text-red-400" />;
      case 'note':
        return <StickyNote size={18} className="text-amber-400" />;
      case 'link':
        return <Link2 size={18} className="text-blue-400" />;
    }
  };

  return (
    <div className="px-4 py-1.5 h-full">
      <div
        onClick={() => onOpen(item)}
        className="flex items-center justify-between p-3.5 h-[84px] rounded-2xl bg-bg-card border border-border-subtle hover:border-border-medium active:scale-[0.99] transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Thumbnail / Kind Icon */}
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              getIcon()
            )}
            {subjectColor && (
              <span
                className="absolute top-0 left-0 w-1.5 h-full"
                style={{ backgroundColor: subjectColor }}
              />
            )}
          </div>

          {/* Title & Metadata */}
          <div className="min-w-0 flex-1 pr-2">
            <h4 className="text-xs font-semibold text-text-primary truncate">{item.title}</h4>
            
            <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
              {subjectName && (
                <span className="truncate max-w-[100px] text-text-secondary">{subjectName}</span>
              )}
              <span>&bull;</span>
              <span>{formatDate(item.updatedAt)}</span>
              {item.pageCount && (
                <>
                  <span>&bull;</span>
                  <span>{item.pageCount} pgs</span>
                </>
              )}
            </div>

            {item.linkNote && (
              <p className="text-[10px] text-text-muted/80 truncate mt-0.5">{item.linkNote}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleStar(item.id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              item.starred ? 'text-amber-400 bg-amber-400/10' : 'text-text-muted hover:text-text-secondary'
            }`}
            aria-label="Star item"
          >
            <Star size={16} fill={item.starred ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => onDelete(item.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Delete item"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
});

ItemRow.displayName = 'ItemRow';

export const LibraryScreen: React.FC = () => {
  const navigate = useNavigate();
  const items = useLibraryStore(state => state.items);
  const subjects = useLibraryStore(state => state.subjects);
  const filterKind = useLibraryStore(state => state.filterKind);
  const searchQuery = useLibraryStore(state => state.searchQuery);
  const toggleStar = useLibraryStore(state => state.toggleStar);
  const deleteItem = useLibraryStore(state => state.deleteItem);
  const setFilterKind = useLibraryStore(state => state.setFilterKind);
  const setSearchQuery = useLibraryStore(state => state.setSearchQuery);

  const [, startTransition] = useTransition();
  const [matchedIds, setMatchedIds] = useState<string[] | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Map subjects for O(1) lookup
  const subjectMap = useMemo(() => {
    return new Map(subjects.map(s => [s.id, s]));
  }, [subjects]);

  // Setup search worker
  useEffect(() => {
    const worker = new Worker(new URL('../../workers/search.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (e.data.type === 'results') {
        startTransition(() => {
          setMatchedIds(e.data.matchingIds);
        });
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  // Sync index to search worker
  useEffect(() => {
    if (workerRef.current && items.length > 0) {
      const searchDocs = items.map(item => ({
        id: item.id,
        title: item.title,
        kind: item.kind,
        subjectId: item.subjectId,
        topicId: item.topicId,
        bodySnippet: item.body?.slice(0, 300),
        url: item.url,
        linkNote: item.linkNote,
      }));
      workerRef.current.postMessage({ type: 'index', payload: searchDocs });
    }
  }, [items]);

  // Trigger search with 150ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!workerRef.current) return;
      if (!searchQuery.trim()) {
        setMatchedIds(null);
        return;
      }
      workerRef.current.postMessage({
        type: 'query',
        payload: {
          query: searchQuery,
          filterKind: filterKind === 'starred' || filterKind === 'all' ? undefined : filterKind,
        }
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, filterKind]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = items;

    if (matchedIds !== null) {
      const matchedSet = new Set(matchedIds);
      result = result.filter(item => matchedSet.has(item.id));
    }

    if (filterKind === 'starred') {
      result = result.filter(item => item.starred);
    } else if (filterKind !== 'all' && matchedIds === null) {
      result = result.filter(item => item.kind === filterKind);
    }

    return result;
  }, [items, filterKind, matchedIds]);

  const handleToggleStar = useCallback((id: string) => {
    toggleStar(id);
  }, [toggleStar]);

  const handleDelete = useCallback((id: string) => {
    deleteItem(id);
  }, [deleteItem]);

  const handleOpenItem = useCallback((item: Item) => {
    if (item.kind === 'pdf') {
      navigate(`/reader/${item.id}`);
    } else if (item.kind === 'link' && item.url) {
      window.open(item.url, '_blank');
    }
  }, [navigate]);

  return (
    <div className="h-full flex flex-col pb-20 overflow-hidden">
      {/* Search & Header */}
      <div className="px-5 pt-6 pb-3 flex-shrink-0 bg-bg">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Study Vault</h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/15 text-accent">
            {filteredItems.length} items
          </span>
        </div>

        {/* Search input */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, formulas, notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'pdf', 'note', 'link', 'starred'] as const).map((kind) => {
            const isSelected = filterKind === kind;
            return (
              <button
                key={kind}
                onClick={() => setFilterKind(kind)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-accent text-white shadow-sm shadow-accent/20'
                    : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                {kind === 'all' ? 'All Items' : kind === 'pdf' ? 'PDFs' : kind === 'note' ? 'Notes' : kind === 'link' ? 'Links' : 'Starred'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Virtualized List for 60fps scrolling on 500+ items */}
      <div className="flex-1 min-h-0">
        <VirtualList
          items={filteredItems}
          estimateSize={92}
          keyExtractor={(item) => item.id}
          renderItem={(item) => {
            const sub = subjectMap.get(item.subjectId);
            return (
              <ItemRow
                item={item}
                subjectColor={sub?.color}
                subjectName={sub?.name}
                onToggleStar={handleToggleStar}
                onDelete={handleDelete}
                onOpen={handleOpenItem}
              />
            );
          }}
          emptyComponent={
            <EmptyState
              icon={BookOpen}
              title="Vault is Empty"
              description="Upload your semester lecture PDFs, syllabus, typed notes, or links using the + button."
            />
          }
        />
      </div>
    </div>
  );
};
