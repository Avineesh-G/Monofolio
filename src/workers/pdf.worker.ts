import * as pdfjsLib from 'pdfjs-dist';

export interface PdfExtractProgress {
  type: 'progress';
  page: number;
  totalPages: number;
}

export interface PdfExtractResult {
  type: 'result';
  text: string;
  pageCount: number;
  isScanned: boolean;
  thumbnail?: string;
  charCount: number;
}

export interface PdfErrorResult {
  type: 'error';
  error: string;
}

self.onmessage = async (e: MessageEvent<{ arrayBuffer: ArrayBuffer; generateThumbnail?: boolean }>) => {
  try {
    const { arrayBuffer, generateThumbnail = true } = e.data;
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    let fullText = '';
    let totalChars = 0;
    let thumbnailDataUrl: string | undefined = undefined;

    // Generate first page thumbnail if requested
    if (generateThumbnail && totalPages > 0) {
      try {
        const page1 = await pdfDoc.getPage(1);
        const viewport = page1.getViewport({ scale: 0.3 }); // Small thumbnail scale
        
        if (typeof OffscreenCanvas !== 'undefined') {
          const offscreen = new OffscreenCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
          const ctx = offscreen.getContext('2d');
          if (ctx) {
            // @ts-expect-error OffscreenCanvas rendering context with pdfjs
            await page1.render({ canvasContext: ctx, viewport }).promise;
            const blob = await offscreen.convertToBlob({ type: 'image/webp', quality: 0.7 });
            const reader = new FileReader();
            thumbnailDataUrl = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          }
        }
      } catch (thumbErr) {
        console.warn('Thumbnail generation failed in worker:', thumbErr);
      }
    }

    // Extract text page by page with progress
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map(item => ('str' in item ? (item as { str: string }).str : ''))
        .filter(str => str.length > 0);
      
      const pageText = pageStrings.join(' ');
      fullText += `\n--- [Page ${pageNum}] ---\n` + pageText;
      totalChars += pageText.trim().length;

      // Post progress every page
      self.postMessage({
        type: 'progress',
        page: pageNum,
        totalPages,
      } as PdfExtractProgress);
    }

    // Scanned document heuristic: if average chars per page < 35, it's likely scanned / images only
    const avgCharsPerPage = totalPages > 0 ? totalChars / totalPages : 0;
    const isScanned = avgCharsPerPage < 35 && totalChars < 150;

    self.postMessage({
      type: 'result',
      text: fullText.trim(),
      pageCount: totalPages,
      isScanned,
      thumbnail: thumbnailDataUrl,
      charCount: totalChars,
    } as PdfExtractResult);

  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Failed to parse PDF document',
    } as PdfErrorResult);
  }
};
