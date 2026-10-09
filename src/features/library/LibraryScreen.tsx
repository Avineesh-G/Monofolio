import React, { useEffect, useState, useMemo } from 'react';
import { db, Document, Subject } from '../../db';
import { TopAppBar, SearchBar, ButtonGroup } from '../../components/m3e';
import { DocumentCard } from '../../components/m3e/cards';
import { FileText, BookOpen, Link as LinkIcon, Filter, Star } from 'lucide-react';

interface LibraryScreenProps {
  onOpenDocument?: (docId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onOpenDocument
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

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] pb-24">
      <TopAppBar
        title="Document Library"
        subtitle={documents.length + ' study items stored'}
      />

      <main className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search PDFs, notes, summaries..."
          onClear={() => setSearchQuery('')}
        />

        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <ButtonGroup
            options={[
              { value: 'all', label: 'All' },
              { value: 'pdf', label: 'PDFs', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { value: 'note', label: 'Notes', icon: <FileText className="w-3.5 h-3.5" /> },
              { value: 'link', label: 'Links', icon: <LinkIcon className="w-3.5 h-3.5" /> }
            ]}
            value={filterKind}
            onChange={(val) => setFilterKind(val as any)}
          />

          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={'px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-colors ' + (starredOnly ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]')}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Starred</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {filteredDocuments.length === 0 ? (
            <div className="p-8 text-center bg-[var(--md-sys-color-surface-container-low)] rounded-3xl border border-[var(--md-sys-color-outline-variant)]">
              <Filter className="w-10 h-10 mx-auto text-[var(--md-sys-color-outline)] mb-2" />
              <p className="font-semibold text-[var(--md-sys-color-on-surface)]">No documents found</p>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                Try adjusting your search terms or filter criteria.
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
