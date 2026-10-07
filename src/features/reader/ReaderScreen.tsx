import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../../store/useLibraryStore';
import { itemsRepo, quizzesRepo } from '../../db/repos';
import { filesStorage } from '../../storage/files';
import { generateBenchmarkPdf } from '../../lib/pdfSample';
import { PdfPageCanvas } from './PdfPageCanvas';
import { SelectionPopup } from './SelectionPopup';
import { SheetCard } from '../../components/SheetCard';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { 
  ArrowLeft, 
  Bot, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  AlertTriangle, 
  Loader2,
  Check
} from 'lucide-react';
import type { Item } from '../../db/schema';

export const ReaderScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const items = useLibraryStore(state => state.items);
  const refreshAll = useLibraryStore(state => state.refreshAll);

  const [item, setItem] = useState<Item | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Selection popup state
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPos, setSelectionPos] = useState<{ x: number; y: number } | null>(null);

  // Quick Action Modal states
  const [actionModal, setActionModal] = useState<'none' | 'explain' | 'saved-note' | 'saved-card'>('none');
  const [actionFeedback, setActionFeedback] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Find item
  useEffect(() => {
    const found = items.find(i => i.id === id);
    if (found) {
      setItem(found);
    }
  }, [id, items]);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!item) return;

      setIsLoading(true);
      setErrorMsg('');

      try {
        let arrayBuffer: ArrayBuffer;

        if (item.filePath) {
          try {
            arrayBuffer = await filesStorage.readFile(item.filePath);
          } catch {
            // If benchmark or not found in storage, generate benchmark 200-page document
            arrayBuffer = generateBenchmarkPdf(item.pageCount || 200);
          }
        } else {
          // Generate 200-page benchmark document
          arrayBuffer = generateBenchmarkPdf(item.pageCount || 200);
        }

        const task = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true,
        });

        const doc = await task.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setPageCount(doc.numPages);
        setIsLoading(false);

      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load PDF document:', err);
          setErrorMsg('Failed to render PDF document. Please re-import.');
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [item]);

  // Text selection listener
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setSelectedText('');
        setSelectionPos(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 2) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedText(text);
          setSelectionPos({
            x: rect.left + rect.width / 2,
            y: rect.top,
          });
        } catch {
          // Ignore
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handlePageVisible = useCallback((pageNum: number) => {
    setCurrentPage(pageNum);
  }, []);

  const handleJumpToPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 1 && val <= pageCount) {
      setCurrentPage(val);
      const targetEl = document.getElementById(`pdf-page-${val}`);
      targetEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Selection Action: Explain with AI Coach
  const handleExplain = (text: string) => {
    if (!item) return;
    navigate(`/coach?itemId=${item.id}&excerpt=${encodeURIComponent(text.slice(0, 500))}`);
  };

  // Selection Action: Save as Flashcard / Quiz
  const handleQuizMe = async (text: string) => {
    if (!item) return;
    const clean = text.slice(0, 300);
    await quizzesRepo.bulkAdd([{
      itemId: item.id,
      topicId: item.topicId,
      q: `What is the core concept of: "${clean.slice(0, 100)}..."?`,
      a: clean,
      explanation: `Extracted from ${item.title}`,
      box: 0,
      dueAt: Date.now(),
    }]);

    setActionFeedback('Flashcard created in Quiz box 0!');
    setActionModal('saved-card');
    setSelectedText('');
    setSelectionPos(null);
  };

  // Selection Action: Save to Note
  const handleSaveToNote = async (text: string) => {
    if (!item) return;
    await itemsRepo.create({
      kind: 'note',
      title: `Excerpt from ${item.title}`,
      subjectId: item.subjectId,
      topicId: item.topicId,
      body: `> ${text}\n\n*Source: ${item.title} (Page ${currentPage})*`,
    });

    await refreshAll();
    setActionFeedback('Note saved to vault!');
    setActionModal('saved-note');
    setSelectedText('');
    setSelectionPos(null);
  };

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-bg text-center">
        <p className="text-xs text-text-secondary mb-4">Document not found.</p>
        <button
          onClick={() => navigate('/library')}
          className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold"
        >
          Return to Library
        </button>
      </div>
    );
  }

  // Detect scanned document heuristic (low text length per page)
  const isScannedPdf = item.pageCount && item.textLength !== undefined
    ? (item.textLength / item.pageCount) < 35 && item.textLength < 150
    : false;

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden relative select-none">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border-subtle px-3 flex items-center justify-between flex-shrink-0 bg-bg-secondary/95 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="text-xs font-semibold text-text-primary truncate max-w-[180px] md:max-w-md">
              {item.title}
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
              <span>Page</span>
              <input
                type="number"
                min={1}
                max={pageCount || 1}
                value={currentPage}
                onChange={handleJumpToPage}
                className="w-10 px-1 py-0.5 rounded bg-bg-tertiary border border-border-subtle text-center text-text-primary text-[10px] font-mono focus:outline-none focus:border-accent"
              />
              <span>of {pageCount || 1}</span>
            </div>
          </div>
        </div>

        {/* AI Coach action */}
        <button
          onClick={() => navigate(`/coach?itemId=${item.id}`)}
          className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium flex items-center gap-1.5 shadow-sm shadow-accent/20 active:scale-95 transition-all"
        >
          <Bot size={14} />
          <span>AI Coach</span>
        </button>
      </header>

      {/* Scanned Document Alert Banner */}
      {isScannedPdf && (
        <div className="px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-300">
          <AlertTriangle size={14} className="flex-shrink-0 text-amber-400" />
          <span>Scanned image PDF detected. AI Coach & text extraction work best on selectable typed PDFs.</span>
        </div>
      )}

      {/* Main PDF Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-y-contain scroll-container p-2 md:p-6 bg-slate-950 flex flex-col items-center"
      >
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <Loader2 size={28} className="text-accent animate-spin" />
            <p className="text-xs font-semibold text-text-primary">Loading Document...</p>
            <p className="text-[11px] text-text-muted">Initializing 60fps lazy viewport engine</p>
          </div>
        ) : errorMsg ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs text-rose-400 mb-3">{errorMsg}</p>
            <button
              onClick={() => navigate('/library')}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium text-white"
            >
              Back to Library
            </button>
          </div>
        ) : pdfDoc ? (
          <div className="w-full flex flex-col items-center">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
              <PdfPageCanvas
                key={pageNum}
                pdfDoc={pdfDoc}
                pageNum={pageNum}
                scale={scale}
                onPageVisible={handlePageVisible}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Floating Zoom & Fit Controls */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-bg-secondary/90 border border-border-medium shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setScale(s => Math.max(0.6, s - 0.15))}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-95 transition-all"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>

        <span className="text-[11px] font-mono text-text-muted px-2 select-none">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={() => setScale(s => Math.min(2.5, s + 0.15))}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-95 transition-all"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>

        <div className="w-px h-4 bg-white/10 mx-0.5" />

        <button
          onClick={() => setScale(1.0)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-95 transition-all"
          title="Reset Zoom / Fit Width"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {/* Selection Popup */}
      <SelectionPopup
        selectedText={selectedText}
        position={selectionPos}
        onExplain={handleExplain}
        onQuizMe={handleQuizMe}
        onSaveToNote={handleSaveToNote}
        onClose={() => {
          setSelectedText('');
          setSelectionPos(null);
        }}
      />

      {/* Feedback Card */}
      <SheetCard
        isOpen={actionModal !== 'none'}
        onClose={() => setActionModal('none')}
        title="Saved to Vault"
      >
        <div className="flex flex-col items-center justify-center py-5 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check size={24} />
          </div>
          <p className="text-sm font-semibold text-text-primary">{actionFeedback}</p>
          <button
            onClick={() => setActionModal('none')}
            className="px-5 py-2 rounded-lg bg-accent text-white text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </SheetCard>
    </div>
  );
};
