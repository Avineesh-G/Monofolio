import React, { useEffect, useState, useMemo } from 'react';

import { db, Document, Subject } from '../../db';
import { TopAppBar, SearchBar } from '../../components/m3e';
import { DocumentCard } from '../../components/m3e/cards';
import { BookOpen, StickyNote, Link2, Star, Filter, Layers } from 'lucide-react';


interface LibraryScreenProps {
  onOpenDocument?: (docId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onOpenDocument,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [subjectsMap, setSubjectsMap] = useState<Map<string, Subject>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKind, setFilterKind] = useState<'all' | 'pdf' | 'note' | 'link'>('all');
  const [starredOnly, setStarredOnly] = useState(false);
  

  useEffect(() => {
    const loadData = async () => {
      try {
        const [docs, subjs] = await Promise.all([
          db.documents.orderBy('updatedAt').reverse().toArray(),
          db.subjects.toArray()
        ]);
        setDocuments(docs);
        const map = new Map<string, Subject>();
        subjs.forEach(s => map.set(s.id, s));
        setSubjectsMap(map);
      } catch (err) {
        console.error('Error loading library documents:', err);
      }
    };
    loadData();
  }, []);

  const toggleStar = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = !doc.starred;
    await db.documents.update(doc.id, { starred: updated });
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, starred: updated } : d));
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (filterKind !== 'all' && doc.kind !== filterKind) return false;
      if (starredOnly && !doc.starred) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = doc.title.toLowerCase().includes(q);
        const subjMatch = doc.subjectId && subjectsMap.get(doc.subjectId)?.name.toLowerCase().includes(q);
        if (!titleMatch && !subjMatch) return false;
      }
      return true;
    });
  }, [documents, filterKind, starredOnly, searchQuery, subjectsMap]);

  const filterTabs = [
    { id: 'all', label: 'All Items', icon: Layers },
    { id: 'pdf', label: 'PDFs', icon: BookOpen },
    { id: 'note', label: 'Notes', icon: StickyNote },
    { id: 'link', label: 'Links', icon: Link2 },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-28">
      <TopAppBar
        title="Document Library"
        subtitle={`${documents.length} curated study items`}
      />

      <main className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search documents, formulas, notes..."
          onClear={() => setSearchQuery('')}
        />

        {/* Segmented Filter Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface-container">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = filterKind === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterKind(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 focus:outline-none ${
              starredOnly
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-current' : ''}`} />
            <span>Starred</span>
          </button>
        </div>

        {/* Magazine Bento List */}
        <div className="space-y-2.5">
          {filteredDocuments.length === 0 ? (
            <div className="p-10 text-center bg-surface-container rounded-3xl space-y-2">
              <Filter className="w-10 h-10 mx-auto text-on-surface-variant/40 mb-1" />
              <p className="font-bold text-on-surface">No documents found</p>
              <p className="text-xs text-on-surface-variant">
                Try adjusting your search query or switching active filter tabs.
              </p>
            </div>
          ) : (
            filteredDocuments.map((doc, index) => {
              const subj = doc.subjectId ? subjectsMap.get(doc.subjectId) : undefined;
              return (
                <DocumentCard
                  key={doc.id}
                  id={doc.id}
                  kind={doc.kind as any}
                  title={doc.title}
                  subjectName={subj?.name}
                  subjectColor={subj?.color}
                  pageCount={doc.pageCount}
                  isStarred={doc.starred}
                  onToggleStar={(e) => toggleStar(doc, e)}
                  onClick={() => onOpenDocument && onOpenDocument(doc.id)}
                  index={index}
                />
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
