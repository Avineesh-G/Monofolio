export interface SearchDocument {
  id: string;
  title: string;
  kind: string;
  subjectId: string;
  topicId?: string;
  bodySnippet?: string;
  url?: string;
  linkNote?: string;
}

let documents: SearchDocument[] = [];

self.onmessage = (e: MessageEvent<{ type: 'index' | 'query'; payload: unknown }>) => {
  const { type, payload } = e.data;

  if (type === 'index') {
    documents = (payload as SearchDocument[]) || [];
    self.postMessage({ type: 'indexed', count: documents.length });
    return;
  }

  if (type === 'query') {
    const { query, filterKind, subjectId } = payload as {
      query: string;
      filterKind?: string;
      subjectId?: string;
    };

    const q = (query || '').toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);

    let results = documents;

    if (subjectId) {
      results = results.filter(d => d.subjectId === subjectId);
    }

    if (filterKind && filterKind !== 'all') {
      results = results.filter(d => d.kind === filterKind);
    }

    if (tokens.length > 0) {
      results = results.filter(doc => {
        const text = `${doc.title} ${doc.bodySnippet || ''} ${doc.linkNote || ''} ${doc.url || ''}`.toLowerCase();
        return tokens.every(token => text.includes(token));
      });
    }

    self.postMessage({
      type: 'results',
      matchingIds: results.map(r => r.id),
    });
  }
};
