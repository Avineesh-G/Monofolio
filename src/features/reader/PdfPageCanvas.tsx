import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { Skeleton } from '../../components/Skeleton';

interface PdfPageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNum: number;
  scale: number;
  onPageVisible?: (pageNum: number) => void;
}

interface TextSpan {
  str: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
}

export const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({
  pdfDoc,
  pageNum,
  scale,
  onPageVisible,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<ReturnType<PDFPageProxy['render']> | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 360, height: 500 });
  const [textSpans, setTextSpans] = useState<TextSpan[]>([]);

  // Observe visibility for lazy rendering and memory recycling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
          onPageVisible?.(pageNum);
        } else {
          // Recycle off-screen canvas memory to keep memory flat
          setIsVisible(false);
          setIsRendered(false);
          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
            renderTaskRef.current = null;
          }
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      },
      {
        rootMargin: '400px 0px 400px 0px', // Pre-render 1 page ahead
        threshold: 0.05,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pageNum, onPageVisible]);

  // Render page when visible
  useEffect(() => {
    let isCancelled = false;

    if (!isVisible) return;

    async function renderPage() {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        setDimensions({ width: viewport.width, height: viewport.height });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x DPR to conserve RAM
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        ctx.scale(dpr, dpr);

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (isCancelled) return;

        setIsRendered(true);

        // Extract text layer spans for text selection
        const textContent = await page.getTextContent();
        const spans: TextSpan[] = [];

        for (const item of textContent.items) {
          if ('str' in item && item.str.trim()) {
            const tx = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
            const [, , , , x, y] = tx;
            const [vx, vy] = viewport.convertToViewportPoint(x, y);

            spans.push({
              str: item.str,
              left: vx,
              top: vy - (item.height * scale),
              width: item.width * scale,
              height: Math.max(12, item.height * scale),
              fontSize: Math.max(10, Math.abs(tx[3]) * scale),
            });
          }
        }

        setTextSpans(spans);

      } catch (err) {
        // Ignored if cancelled
        if (!isCancelled) {
          console.warn(`Error rendering PDF page ${pageNum}:`, err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [isVisible, pdfDoc, pageNum, scale]);

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNum}`}
      className="relative mx-auto my-3 rounded-lg shadow-md bg-white overflow-hidden select-text flex-shrink-0"
      style={{
        width: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
      }}
    >
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className={`block transition-opacity duration-200 ${isRendered ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Loading Skeleton Placeholder while visible but rendering */}
      {isVisible && !isRendered && (
        <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
          <Skeleton className="w-full h-full bg-slate-800/20" />
        </div>
      )}

      {/* Selectable Text Layer (Invisible overlay perfectly mapped to canvas text) */}
      {isRendered && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-auto leading-none select-text cursor-text"
          style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        >
          {textSpans.map((span, idx) => (
            <span
              key={idx}
              className="absolute text-transparent select-text whitespace-pre"
              style={{
                left: `${span.left}px`,
                top: `${span.top}px`,
                width: `${span.width}px`,
                height: `${span.height}px`,
                fontSize: `${span.fontSize}px`,
                fontFamily: 'sans-serif',
              }}
            >
              {span.str}
            </span>
          ))}
        </div>
      )}

      {/* Page Number Stamp */}
      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/50 text-[9px] text-white/80 pointer-events-none font-mono">
        {pageNum}
      </div>
    </div>
  );
};
