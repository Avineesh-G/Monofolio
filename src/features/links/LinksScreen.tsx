import React, { useEffect, useState } from 'react';
import { db, SavedLink, Subject } from '../../db';
import { TopAppBar, SearchBar } from '../../components/m3e';
import { LinkCard } from '../../components/m3e/cards';
import { Link2 } from 'lucide-react';

interface LinksScreenProps {
  onOpenLink?: (url: string) => void;
}

export const LinksScreen: React.FC<LinksScreenProps> = ({
  onOpenLink
}) => {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [subjectsMap, setSubjectsMap] = useState<Map<string, Subject>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const [savedLinks, subjs] = await Promise.all([
          db.savedLinks.orderBy('updatedAt').reverse().toArray(),
          db.subjects.toArray()
        ]);
        setLinks(savedLinks);
        const map = new Map<string, Subject>();
        subjs.forEach(s => map.set(s.id, s));
        setSubjectsMap(map);
      } catch (err) {
        console.error('Failed to load links:', err);
      }
    };
    loadLinks();
  }, []);

  const filteredLinks = links.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const urlStr = l.url || '';
    return l.title.toLowerCase().includes(q) || urlStr.toLowerCase().includes(q);
  });

  const handleLinkClick = (url: string) => {
    if (onOpenLink) {
      onOpenLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] pb-24">
      <TopAppBar
        title="Resource Links"
        subtitle={`${links.length} web resources collected`}
      />

      <main className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search saved resources..."
          onClear={() => setSearchQuery('')}
        />

        <div className="space-3">
          {filteredLinks.length === 0 ? (
            <div className="p-8 text-center bg-[var(--md-sys-color-surface-container-low)] rounded-3xl border border-[var(--md-sys-color-outline-variant)]">
              <Link2 className="w-10 h-10 mx-auto text-[var(--md-sys-color-outline)] mb-2" />
              <p className="font-semibold text-[var(--md-sys-color-on-surface)]">No links found</p>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                Save useful web articles, video links, or reference docs.
              </p>
            </div>
          ) : (
            filteredLinks.map((item) => {
              const subj = item.subjectId ? subjectsMap.get(item.subjectId) : undefined;
              const linkUrl = item.url || '';
              return (
                <LinkCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  url={linkUrl}
                  whySaved={item.linkNote || item.whySaved}
                  subjectName={subj?.name}
                  onClick={() => handleLinkClick(linkUrl)}
                />
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
