import React, { useState, useRef } from 'react';
import { SheetCard } from './m3e/SheetCard';
import { Fab } from './m3e/Fab';
import { Button } from './m3e/Button';
import { LoadingIndicator } from './m3e/LoadingIndicator';
import { useLibraryStore } from '../store/useLibraryStore';
import { itemsRepo } from '../db/repos';
import { filesStorage } from '../storage/files';
import { computeHash } from '../lib/hash';

export const FloatingAddButton: React.FC = () => {
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

  // Handle Menu Option Selection from M3E Fab
  const handleFabSelect = (optionId: 'pdf' | 'note' | 'link' | 'coach') => {
    if (optionId === 'pdf') {
      fileInputRef.current?.click();
    } else if (optionId === 'note') {
      setActiveModal('note');
    } else if (optionId === 'link') {
      setActiveModal('link');
    }
  };

  // Handle PDF Import via Worker
  const handlePdfSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetSubjectId) return;

    setActiveModal('pdf-processing');
    setProcessingStatus('Reading PDF file...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hash = await computeHash(arrayBuffer);

      setProcessingStatus('Saving to secure vault...');
      const filePath = await filesStorage.saveFile(file.name, arrayBuffer);

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

      {/* M3E FAB & Speed Dial Menu */}
      <Fab onSelectOption={handleFabSelect} />

      {/* PDF Processing Indicator Modal */}
      <SheetCard
        isOpen={activeModal === 'pdf-processing'}
        onClose={() => {}}
        title="Importing PDF"
      >
        <div className="py-6 flex flex-col items-center justify-center gap-4 text-center">
          <LoadingIndicator size={48} />
          <div>
            <div className="m3-title-medium-emp text-on-surface">Offline Text Extraction</div>
            <div className="m3-body-medium text-on-surface-variant font-mono text-xs pt-1">
              {processingStatus}
            </div>
          </div>
        </div>
      </SheetCard>

      {/* Add Note Modal */}
      <SheetCard
        isOpen={activeModal === 'note'}
        onClose={() => setActiveModal('none')}
        title="Create Study Note"
        subtitle="Quick Markdown notes & exam formulas"
      >
        <div className="space-y-3.5 py-1">
          <div>
            <label className="block m3-label-medium text-on-surface-variant mb-1">Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Page Replacement Algorithms"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/40 text-on-surface m3-body-large placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div>
            <label className="block m3-label-medium text-on-surface-variant mb-1">Note Content</label>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Type formulas, bullet points, or paste excerpts..."
              rows={5}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/40 text-on-surface m3-body-large placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <Button
            variant="filled"
            fullWidth
            onClick={handleSaveNote}
            disabled={!noteTitle.trim()}
          >
            Save Note to Vault
          </Button>
        </div>
      </SheetCard>

      {/* Add Link Modal */}
      <SheetCard
        isOpen={activeModal === 'link'}
        onClose={() => setActiveModal('none')}
        title="Save Resource Link"
        subtitle="Keep track of articles, docs & lectures"
      >
        <div className="space-y-3.5 py-1">
          <div>
            <label className="block m3-label-medium text-on-surface-variant mb-1">Title</label>
            <input
              type="text"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="e.g. OSDev Wiki - Memory Management"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/40 text-on-surface m3-body-large placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div>
            <label className="block m3-label-medium text-on-surface-variant mb-1">URL</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://wiki.osdev.org/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/40 text-on-surface m3-body-large font-mono text-xs placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block m3-label-medium text-on-surface-variant mb-1">Why I saved this (Note)</label>
            <input
              type="text"
              value={linkNote}
              onChange={(e) => setLinkNote(e.target.value)}
              placeholder="e.g. Good diagram on page tables"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/40 text-on-surface m3-body-large placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
            />
          </div>

          <Button
            variant="filled"
            fullWidth
            onClick={handleSaveLink}
            disabled={!linkTitle.trim() || !linkUrl.trim()}
          >
            Save Resource Link
          </Button>
        </div>
      </SheetCard>
    </>
  );
};
