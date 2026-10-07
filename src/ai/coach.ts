import type { AIProvider } from './provider';
import { chunkText } from './chunker';
import { globalRateLimiter } from './rateLimiter';
import { 
  PROMPT_VERSION, 
  COACH_SYSTEM_PROMPT, 
  MAP_CHUNK_SYSTEM_PROMPT, 
  REDUCE_ANALYSIS_SCHEMA_PROMPT,
  EXPLAIN_EXCERPT_PROMPT
} from './prompts';
import { analysesRepo } from '../db/repos';
import { filesStorage } from '../storage/files';
import type { Analysis, Item } from '../db/schema';

export interface CoachProgressUpdate {
  stage: 'checking-cache' | 'reading' | 'mapping' | 'reducing' | 'validating' | 'done' | 'error';
  message: string;
  progressPercent: number;
}

// Hand-written strict type guard for Analysis data structure
export function isValidAnalysis(data: unknown): data is Omit<Analysis, 'id' | 'createdAt' | 'itemId' | 'fileHash' | 'promptVersion'> {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.concepts) || obj.concepts.length === 0) return false;
  for (const c of obj.concepts) {
    if (!c || typeof c !== 'object') return false;
    const concept = c as Record<string, unknown>;
    if (typeof concept.name !== 'string' || typeof concept.why !== 'string') return false;
    const imp = concept.importance;
    if (typeof imp !== 'number' || imp < 1 || imp > 5) return false;
  }

  if (!Array.isArray(obj.weakSpots) || !obj.weakSpots.every(w => typeof w === 'string')) return false;
  if (!Array.isArray(obj.learningOrder) || !obj.learningOrder.every(o => typeof o === 'string')) return false;

  if (!Array.isArray(obj.plan) || obj.plan.length === 0) return false;
  for (const p of obj.plan) {
    if (!p || typeof p !== 'object') return false;
    const dayPlan = p as Record<string, unknown>;
    if (typeof dayPlan.day !== 'number' || !Array.isArray(dayPlan.tasks)) return false;
  }

  if (typeof obj.realityCheck !== 'string') return false;

  return true;
}

export async function runCoachAnalysis(
  item: Item,
  provider: AIProvider,
  options: {
    onProgress?: (update: CoachProgressUpdate) => void;
    signal?: AbortSignal;
    forceRefresh?: boolean;
  } = {}
): Promise<Analysis> {
  const { onProgress, signal, forceRefresh = false } = options;

  // 1. Check cache by fileHash + promptVersion
  const fileHash = item.fileHash || item.id;
  
  if (!forceRefresh) {
    onProgress?.({
      stage: 'checking-cache',
      message: 'Checking local analysis vault cache...',
      progressPercent: 10,
    });

    const cached = await analysesRepo.getByHashAndVersion(fileHash, PROMPT_VERSION);
    if (cached) {
      onProgress?.({
        stage: 'done',
        message: 'Instant load from vault cache!',
        progressPercent: 100,
      });
      return cached;
    }
  }

  // 2. Extract / obtain document text
  onProgress?.({
    stage: 'reading',
    message: 'Extracting selectable document text...',
    progressPercent: 20,
  });

  let documentText = item.body || '';

  if (item.kind === 'pdf') {
    // Check if scanned document
    if (item.pageCount && item.textLength !== undefined && item.textLength < 100) {
      throw new Error('Scanned / image-only PDF detected. Please upload a PDF with selectable typed text.');
    }

    if (!documentText && item.filePath) {
      try {
        const buffer = await filesStorage.readFile(item.filePath);
        // Extract text via worker
        const worker = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), { type: 'module' });
        
        const extracted = await new Promise<{ text: string; isScanned: boolean }>((resolve, reject) => {
          worker.onmessage = (e) => {
            if (e.data.type === 'result') {
              resolve({ text: e.data.text, isScanned: e.data.isScanned });
            } else if (e.data.type === 'error') {
              reject(new Error(e.data.error));
            }
          };
          worker.onerror = (err) => reject(err);
          worker.postMessage({ arrayBuffer: buffer, generateThumbnail: false });
        });

        worker.terminate();

        if (extracted.isScanned) {
          throw new Error('Scanned PDF detected with insufficient extractable text.');
        }

        documentText = extracted.text;
      } catch (readErr) {
        console.warn('Could not read binary, using title context:', readErr);
        documentText = `Title: ${item.title}\nSubject ID: ${item.subjectId}`;
      }
    }
  } else if (item.kind === 'link') {
    documentText = `Resource Link: ${item.title}\nURL: ${item.url || ''}\nWhy I saved this: ${item.linkNote || ''}`;
  }

  if (!documentText.trim()) {
    documentText = `Document Title: ${item.title}`;
  }

  // 3. Chunk text
  const chunks = chunkText(documentText);
  const totalChunks = chunks.length;

  // 4. MAP Stage: summarize each chunk
  const mappedSummaries: string[] = [];

  for (let i = 0; i < totalChunks; i++) {
    if (signal?.aborted) throw new DOMException('Aborted by user', 'AbortError');

    const chunk = chunks[i];
    const chunkPct = 25 + Math.round(((i + 1) / totalChunks) * 45);

    onProgress?.({
      stage: 'mapping',
      message: `Analyzing document segment ${i + 1} of ${totalChunks}...`,
      progressPercent: chunkPct,
    });

    const summary = await globalRateLimiter.execute(
      () => provider.complete({
        system: MAP_CHUNK_SYSTEM_PROMPT,
        user: `Extract core factual concepts and exam-relevant insights from this section:\n\n${chunk.text}`,
        signal,
        maxTokens: 1200,
      }),
      (_attempt, _delayMs, reason) => {
        onProgress?.({
          stage: 'mapping',
          message: reason,
          progressPercent: chunkPct,
        });
      },
      signal
    );

    mappedSummaries.push(summary.trim());
  }

  // 5. REDUCE Stage: synthesize into Analysis JSON
  onProgress?.({
    stage: 'reducing',
    message: 'Synthesizing exam blueprint & concept hierarchy...',
    progressPercent: 80,
  });

  const mergedInsights = mappedSummaries.join('\n\n--- Segment Breakdown ---\n\n');

  let rawJson = await globalRateLimiter.execute(
    () => provider.complete({
      system: COACH_SYSTEM_PROMPT,
      user: `${REDUCE_ANALYSIS_SCHEMA_PROMPT}\n\nStudy Material Insights:\n${mergedInsights}`,
      json: true,
      signal,
      maxTokens: 3500,
    }),
    (_attempt, _delayMs, reason) => {
      onProgress?.({
        stage: 'reducing',
        message: reason,
        progressPercent: 85,
      });
    },
    signal
  );

  // 6. Validate JSON & retry once if malformed
  onProgress?.({
    stage: 'validating',
    message: 'Verifying study plan schema & concept rankings...',
    progressPercent: 90,
  });

  let parsed: unknown;
  try {
    const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // Retry once with strict reminder
    onProgress?.({
      stage: 'validating',
      message: 'Re-formatting output to strict JSON...',
      progressPercent: 92,
    });

    rawJson = await provider.complete({
      system: `${COACH_SYSTEM_PROMPT}\nYour previous response was not valid JSON. Return ONLY the raw JSON object. No Markdown code fences, no extra text.`,
      user: `${REDUCE_ANALYSIS_SCHEMA_PROMPT}\n\nStudy Material Insights:\n${mergedInsights}`,
      json: true,
      signal,
    });

    const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    parsed = JSON.parse(cleaned);
  }

  if (!isValidAnalysis(parsed)) {
    throw new Error('AI Coach response could not be validated against the required study schema.');
  }

  // 7. Save & Cache to Dexie
  const analysisRecord = await analysesRepo.save({
    itemId: item.id,
    fileHash,
    promptVersion: PROMPT_VERSION,
    concepts: parsed.concepts as Analysis['concepts'],
    weakSpots: parsed.weakSpots,
    learningOrder: parsed.learningOrder,
    plan: parsed.plan as Analysis['plan'],
    realityCheck: parsed.realityCheck,
  });

  onProgress?.({
    stage: 'done',
    message: 'Analysis complete!',
    progressPercent: 100,
  });

  return analysisRecord;
}

export async function explainExcerptWithCoach(
  excerpt: string,
  provider: AIProvider,
  signal?: AbortSignal
): Promise<string> {
  const prompt = EXPLAIN_EXCERPT_PROMPT.replace('{EXCERPT}', excerpt.trim());
  return globalRateLimiter.execute(
    () => provider.complete({
      system: COACH_SYSTEM_PROMPT,
      user: prompt,
      signal,
      maxTokens: 1000,
    }),
    undefined,
    signal
  );
}
