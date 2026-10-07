import React, { useState, useRef } from 'react';
import { Plus, FileText, StickyNote, Link2, Loader2, Sparkles } from 'lucide-react';
import { SheetCard } from './SheetCard';
import { useLibraryStore } from '../store/useLibraryStore';
import { itemsRepo } from '../db/repos';
import { filesStorage } from '../storage/files';
import { computeHash } from '../lib/hash';

export const FloatingAddButton: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'note' | 'link' | 'pdf-processing'>('none');
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  // Note Form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  
  // Link Form
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNote, setLinkNote] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = useLibraryStore(state => state.subjects);
  const selectedSubjectId = useLibraryStore(state => state.selectedSubjectId);
  const refreshItems = useLibraryStore(state => state.refreshItems);

  const targetSubjectId = selectedSubjectId || (subjects.length > 0 ? subjects[0].id : '');

  // Handle PDF Import via Worker
  const handlePdfSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetSubjectId) return;

    setIsMenuOpen(false);
    setActiveModal('pdf-processing');
    setProcessingStatus('Reading PDF file...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hash = await computeHash(arrayBuffer);

      // Save file to storage
      setProcessingStatus('Saving to secure vault...');
      const filePath = await filesStorage.saveFile(file.name, arrayBuffer);

      // Spin up PDF worker for text extraction and thumbnail
      setProcessingStatus('Extracting text & generating thumbnail...');
      const worker = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), { type: 'module' });

      worker.onmessage = async (event) => {
        const data = event.data;

        if (data.type === 'progress') {
          setProcessingStatus(`Processing page ${data.page} of ${data.totalPages}...`);
        } else if (data.type === 'result') {
          setProcessingStatus('Saving document metadata...');
          
          await itemsRepo.create({
            kind: 'pdf',
            title: file.name.replace(/\.[^/.]+$/, ''),
            subjectId: targetSubjectId,
            filePath,
            fileHash: hash,
            pageCount: data.pageCount,
            textLength: data.charCount,
            thumbnail: data.thumbnail,
          });

          await refreshItems();
          worker.terminate();
          setActiveModal('none');
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else if (data.type === 'error') {
          console.error('PDF Worker error:', data.error);
          setProcessingStatus(`Error: ${data.error}`);
          setTimeout(() => {
            worker.terminate();
            setActiveModal('none');
          }, 2000);
        }
      };

      worker.onerror = (err) => {
        console.error('Worker error:', err);
        setProcessingStatus('Failed to process PDF in background');
        setTimeout(() => {
          worker.terminate();
          setActiveModal('none');
        }, 1500);
      };

      worker.postMessage({ arrayBuffer, generateThumbnail: true }, [arrayBuffer]);

    } catch (err) {
      console.error('Failed to import PDF:', err);
      setProcessingStatus('Failed to import PDF');
      setTimeout(() => setActiveModal('none'), 1500);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !targetSubjectId) return;

    await itemsRepo.create({
      kind: 'note',
      title: noteTitle.trim(),
      body: noteBody.trim(),
      subjectId: targetSubjectId,
    });

    await refreshItems();
    setNoteTitle('');
    setNoteBody('');
    setActiveModal('none');
  };

  const handleSaveLink = async () => {
    if (!linkTitle.trim() || !linkUrl.trim() || !targetSubjectId) return;

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    await itemsRepo.create({
      kind: 'link',
      title: linkTitle.trim(),
      url: formattedUrl,
      linkNote: linkNote.trim(),
      subjectId: targetSubjectId,
    });

    await refreshItems();
    setLinkTitle('');
    setLinkUrl('');
    setLinkNote('');
    setActiveModal('none');
  };

  return (
    <>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handlePdfSelected}
        className="hidden"
      />

      {/* Floating Action Button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed right-5 bottom-20 z-40 w-14 h-14 rounded-full bg-accent text-white shadow-xl shadow-accent/30 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Add item"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Choice SheetCard */}
      <SheetCard
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Add to Vault"
      >
        <div className="grid grid-cols-1 gap-2.5 py-1">
          <button
            onClick={() => {
              setIsMenuOpen(false);
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-left active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Upload PDF</div>
              <div className="text-xs text-text-secondary">Text extraction, AI study coach & quiz ready</div>
            </div>
          </button>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              setActiveModal('note');
            }}
            className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-left active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <StickyNote size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Create Typed Note</div>
              <div className="text-xs text-text-secondary">Markdown notes, formulas & definitions</div>
            </div>
          </button>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              setActiveModal('link');
            }}
            className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-left active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Link2 size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Save Web / Chat Link</div>
              <div className="text-xs text-text-secondary">With "why I saved this" study context</div>
            </div>
          </button>
        </div>
      </SheetCard>

      {/* Note Modal */}
      <SheetCard
        isOpen={activeModal === 'note'}
        onClose={() => setActiveModal('none')}
        title="New Study Note"
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Dijkstra's Algorithm Notes"
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Content (Markdown)</label>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Key definitions, proofs, pseudocode..."
              rows={6}
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none font-mono text-xs"
            />
          </div>

          <button
            onClick={handleSaveNote}
            disabled={!noteTitle.trim()}
            className="w-full py-2.5 rounded-lg bg-accent text-white font-medium text-sm disabled:opacity-40 active:scale-98 transition-all"
          >
            Save Note
          </button>
        </div>
      </SheetCard>

      {/* Link Modal */}
      <SheetCard
        isOpen={activeModal === 'link'}
        onClose={() => setActiveModal('none')}
        title="Save Resource Link"
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
            <input
              type="text"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="e.g. Visualizing A* Search"
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">URL</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/guide"
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Why I saved this (Context note)</label>
            <textarea
              value={linkNote}
              onChange={(e) => setLinkNote(e.target.value)}
              placeholder="Best explanation of heuristic admissible condition..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <button
            onClick={handleSaveLink}
            disabled={!linkTitle.trim() || !linkUrl.trim()}
            className="w-full py-2.5 rounded-lg bg-accent text-white font-medium text-sm disabled:opacity-40 active:scale-98 transition-all"
          >
            Save Link
          </button>
        </div>
      </SheetCard>

      {/* PDF Processing Progress Modal */}
      <SheetCard
        isOpen={activeModal === 'pdf-processing'}
        onClose={() => {}}
        title="Importing PDF"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center animate-spin">
            <Loader2 size={24} />
          </div>
          <div className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <Sparkles size={16} className="text-accent" />
            Processing in Web Worker
          </div>
          <p className="text-xs text-text-secondary max-w-xs">{processingStatus}</p>
        </div>
      </SheetCard>
    </>
  );
};
