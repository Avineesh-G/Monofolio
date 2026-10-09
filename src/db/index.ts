export * from './schema';
export * from './repos';

// Aliases for feature screen compatibility
import { Item, QuizCard, Analysis } from './schema';
export type Document = Item & { isStarred?: boolean };
export type SavedLink = Item & { whySaved?: string; isStarred?: boolean };
export type Flashcard = QuizCard & {
  front?: string;
  back?: string;
  nextReviewAt?: number;
  intervalDays?: number;
  updatedAt?: number;
  subjectId?: string;
  isStarred?: boolean;
};
export type CoachAnalysis = Analysis & {
  docId?: string;
  summary?: string;
  overview?: string[];
  realityVerdict?: string;
  traps?: string[];
  actionPlan?: string[];
};
