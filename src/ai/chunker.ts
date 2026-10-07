export interface TextChunk {
  index: number;
  text: string;
  charCount: number;
}

export interface ChunkerOptions {
  maxCharsPerChunk?: number; // approx 3,000 tokens ~ 12,000 chars
  overlapChars?: number;     // approx 200 tokens ~ 800 chars
}

export function chunkText(fullText: string, options: ChunkerOptions = {}): TextChunk[] {
  const maxChars = options.maxCharsPerChunk ?? 10000;
  const overlap = options.overlapChars ?? 600;

  const trimmed = fullText.trim();
  if (trimmed.length <= maxChars) {
    return [{
      index: 0,
      text: trimmed,
      charCount: trimmed.length,
    }];
  }

  // Split on page markers or double newlines
  const paragraphs = trimmed.split(/(?=\n--- \[Page |\n\n+)/);
  const chunks: TextChunk[] = [];

  let currentChunk = '';
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    if (currentChunk.length + p.length > maxChars && currentChunk.length > 0) {
      chunks.push({
        index: chunkIndex++,
        text: currentChunk.trim(),
        charCount: currentChunk.trim().length,
      });

      // Keep trailing overlap
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + p;
    } else {
      currentChunk += p;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      index: chunkIndex,
      text: currentChunk.trim(),
      charCount: currentChunk.trim().length,
    });
  }

  return chunks;
}
