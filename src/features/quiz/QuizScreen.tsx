import React, { useEffect, useState } from 'react';
import { db, Flashcard as FlashcardType, Subject } from '../../db';
import { TopAppBar, Button, WavyProgress } from '../../components/m3e';
import { Flashcard } from './Flashcard';
import { QuizResults } from './QuizResults';
import { Sparkles, Check, RotateCcw, ThumbsUp, Flame } from 'lucide-react';

interface QuizScreenProps {
  onNavigateHome?: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  onNavigateHome
}) => {
  const [cards, setCards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [subjectsMap, setSubjectsMap] = useState<Map<string, Subject>>(new Map());

  useEffect(() => {
    loadDeck();
  }, []);

  const loadDeck = async () => {
    try {
      const now = Date.now();
      const [dueCards, subjs] = await Promise.all([
        db.flashcards.where('dueAt').belowOrEqual(now).limit(20).toArray(),
        db.subjects.toArray()
      ]);
      const map = new Map<string, Subject>();
      subjs.forEach(s => map.set(s.id, s));
      setSubjectsMap(map);

      if (dueCards.length > 0) {
        setCards(dueCards);
      } else {
        const fallback = await db.flashcards.limit(10).toArray();
        setCards(fallback);
      }
      setCurrentIndex(0);
      setIsFlipped(false);
      setCorrectCount(0);
      setIsCompleted(false);
    } catch (err) {
      console.error('Failed to load quiz deck:', err);
    }
  };

  const handleLeitnerAnswer = async (quality: 'again' | 'hard' | 'good' | 'easy') => {
    if (cards.length === 0) return;
    const current = cards[currentIndex];

    let nextBox: number = current.box;
    let nextIntervalDays = 1;

    if (quality === 'again') {
      nextBox = 0;
      nextIntervalDays = 1;
    } else if (quality === 'hard') {
      nextBox = Math.max(0, current.box);
      nextIntervalDays = 2;
    } else if (quality === 'good') {
      nextBox = (current.box + 1);
      nextIntervalDays = Math.pow(2, nextBox);
      setCorrectCount(prev => prev + 1);
    } else if (quality === 'easy') {
      nextBox = (current.box + 2);
      nextIntervalDays = Math.pow(2, nextBox) * 2;
      setCorrectCount(prev => prev + 1);
    }

    const clampedBox = (Math.min(4, Math.max(0, nextBox))) as (0 | 1 | 2 | 3 | 4);
    const nextReviewAt = Date.now() + nextIntervalDays * 24 * 60 * 60 * 1000;

    await db.flashcards.update(current.id, {
      box: clampedBox,
      dueAt: nextReviewAt,
    });

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
    }
  };

  if (isCompleted) {
    return (
      <QuizResults
        correctCount={correctCount}
        totalCount={cards.length}
        onRetry={loadDeck}
        onHome={onNavigateHome || (() => {})}
      />
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] pb-24">
        <TopAppBar title="Flashcard Quiz" />
        <div className="p-8 text-center max-w-md mx-auto mt-12 bg-[var(--md-sys-color-surface-container)] rounded-3xl border border-[var(--md-sys-color-outline-variant)]">
          <Sparkles className="w-12 h-12 mx-auto text-[var(--md-sys-color-primary)] mb-3" />
          <h2 className="text-lg font-bold">All Caught Up!</h2>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-4">
            No cards are due for review right now.
          </p>
          <Button variant="filled" onClick={loadDeck}>
            Reload Deck
          </Button>
        </div>
      </div>
    );
  }

  const current = cards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);
  const subj = current.subjectId ? subjectsMap.get(current.subjectId) : undefined;

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] pb-28">
      <TopAppBar
        title="Spaced Review"
        subtitle={`Card ${currentIndex + 1} of ${cards.length}`}
      />

      <main className="px-4 py-2 space-y-4 max-w-lg mx-auto">
        <div className="px-1">
          <WavyProgress progress={progressPercent} height={6} />
        </div>

        <Flashcard
          question={current.q || current.front || 'Question'}
          answer={current.a || current.back || 'Answer'}
          explanation={current.explanation}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          boxLevel={current.box}
          subjectName={subj?.name}
        />

        <div className="pt-2">
          {!isFlipped ? (
            <Button
              variant="tonal"
              fullWidth
              size="lg"
              onClick={() => setIsFlipped(true)}
            >
              Reveal Answer
            </Button>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleLeitnerAnswer('again')}
                className="py-3 px-1 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-semibold text-xs flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Again</span>
              </button>
              <button
                onClick={() => handleLeitnerAnswer('hard')}
                className="py-3 px-1 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold text-xs flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <Flame className="w-4 h-4" />
                <span>Hard</span>
              </button>
              <button
                onClick={() => handleLeitnerAnswer('good')}
                className="py-3 px-1 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <Check className="w-4 h-4" />
                <span>Good</span>
              </button>
              <button
                onClick={() => handleLeitnerAnswer('easy')}
                className="py-3 px-1 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 font-semibold text-xs flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Easy</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
