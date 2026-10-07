import type { AIProvider } from './provider';
import { globalRateLimiter } from './rateLimiter';
import { quizzesRepo } from '../db/repos';
import type { Analysis, QuizCard } from '../db/schema';

export const QUIZ_GEN_PROMPT = `You are an elite exam question and flashcard generator.
Based on the following concepts and weak spots from the study analysis, generate between 8 and 12 high-yield Leitner flashcards.
Focus on:
1. Core definitions and formulas.
2. Tricky edge cases and common misconceptions.
3. Rapid active recall questions.

Output MUST be a JSON array of objects with this schema:
[
  {
    "q": "Clear, direct active recall question",
    "a": "Precise, correct answer without fluff",
    "explanation": "1-sentence memory anchor or justification"
  }
]

Return ONLY the JSON array.`;

export async function generateQuizFromAnalysis(
  analysis: Analysis,
  provider: AIProvider,
  signal?: AbortSignal
): Promise<QuizCard[]> {
  const context = `
Concepts:
${analysis.concepts.map(c => `- ${c.name} (Importance ${c.importance}/5): ${c.why}`).join('\n')}

Known Student Weak Spots:
${analysis.weakSpots.map(w => `- ${w}`).join('\n')}
`;

  const rawJson = await globalRateLimiter.execute(
    () => provider.complete({
      system: 'You generate high-yield technical exam flashcards. Output ONLY valid JSON array.',
      user: `${QUIZ_GEN_PROMPT}\n\n${context}`,
      json: true,
      signal,
      maxTokens: 2500,
    }),
    undefined,
    signal
  );

  const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned) as { q: string; a: string; explanation?: string }[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Failed to generate valid flashcard array');
  }

  const newCards: Omit<QuizCard, 'id'>[] = parsed.map(c => ({
    itemId: analysis.itemId,
    q: c.q,
    a: c.a,
    explanation: c.explanation,
    box: 0,
    dueAt: Date.now(),
  }));

  return quizzesRepo.bulkAdd(newCards);
}
