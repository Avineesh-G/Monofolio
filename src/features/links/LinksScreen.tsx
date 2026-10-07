import React, { useMemo } from 'react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { EmptyState } from '../../components/EmptyState';
import { Link2, ExternalLink, Bookmark } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const LinksScreen: React.FC = () => {
  const items = useLibraryStore(state => state.items);
  const subjects = useLibraryStore(state => state.subjects);

  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const links = useMemo(() => items.filter(i => i.kind === 'link'), [items]);

  return (
    <div className="h-full flex flex-col px-5 pt-6 pb-20 overflow-y-auto scroll-container">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Saved Links</h1>
        <p className="text-xs text-text-secondary">Web resources and chat notes with study context</p>
      </div>

      {links.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Bookmark}
            title="No Saved Links"
            description="Save helpful StackOverflow answers, YouTube tutorials, and online references with why you saved them."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => {
            const sub = subjectMap.get(link.subjectId);
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="block p-4 rounded-2xl bg-bg-card border border-border-subtle hover:border-border-medium active:scale-[0.99] transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Link2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-text-primary truncate">{link.title}</h4>
                      <p className="text-[11px] text-text-muted truncate">{link.url}</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-text-muted flex-shrink-0 mt-1" />
                </div>

                {link.linkNote && (
                  <div className="mt-2.5 p-2 rounded-lg bg-white/5 text-[11px] text-text-secondary leading-snug">
                    <span className="font-semibold text-accent">Why saved: </span>
                    {link.linkNote}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2 text-[10px] text-text-muted">
                  {sub && <span className="text-text-secondary font-medium">{sub.name}</span>}
                  <span>&bull;</span>
                  <span>{formatDate(link.updatedAt)}</span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
