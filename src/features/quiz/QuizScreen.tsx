import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { quizzesRepo, analysesRepo, topicsRepo } from '../../db/repos';
import { generateQuizFromAnalysis } from '../../ai/quiz';
import { GroqProvider } from '../../ai/groqProvider';
import { Flashcard } from './Flashcard';
import { QuizResults } from './QuizResults';
import { EmptyState } from '../../components/EmptyState';
import { 
  Brain, 
  Sparkles, 
  Play, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  Calendar
} from 'lucide-react';
import type { QuizCard, Topic } from '../../db/schema';

const LEITNER_INTERVALS_MS = [
  86400000,      // Box 0 -> 1 day
  3 * 86400000,  // Box 1 -> 3 days
  7 * 86400000,  // Box 2 -> 7 days
  14 * 86400000, // Box 3 -> 14 days
  30 * 86400000, // Box 4 -> 30 days
];

export const QuizScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const items = useLibraryStore(state => state.items);
  const topics = useLibraryStore(state => state.topics);
  const refreshAll = useLibraryStore(state => state.refreshAll);
  const groqApiKey = useSettingsStore(state => state.groqApiKey);
  const aiModel = useSettingsStore(state => state.aiModel);

  const initialItemId = searchParams.get('itemId');

  const [allCards, setAllCards] = useState<QuizCard[]>([]);
  const [dueCards, setDueCards] = useState<QuizCard[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>(initialItemId || 'all');
  
  // Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionCards, setSessionCards] = useState<QuizCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [isSessionDone, setIsSessionDone] = useState<boolean>(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genFeedback, setGenFeedback] = useState<string>('');

  const loadAllCards = useCallback(async () => {
    const cards = await quizzesRepo.getAll();
    const due = await quizzesRepo.getDueCards();
    setAllCards(cards);
    setDueCards(due);
  }, []);

  useEffect(() => {
    loadAllCards();
  }, [loadAllCards]);

  // Filtered cards based on selection
  const filteredCards = useMemo(() => {
    if (selectedItemId === 'all') return allCards;
    if (selectedItemId === 'due') return dueCards;
    return allCards.filter(c => c.itemId === selectedItemId);
  }, [allCards, dueCards, selectedItemId]);

  // Start revision session
  const handleStartSession = (cardsToReview: QuizCard[]) => {
    if (cardsToReview.length === 0) return;
    setSessionCards(cardsToReview);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsSessionDone(false);
    setIsSessionActive(true);
  };

  // Handle single flashcard answer (Leitner Schedule + Topic Mastery update)
  const handleAnswerCard = async (correct: boolean) => {
    const card = sessionCards[currentIndex];
    if (!card) return;

    const now = Date.now();
    let newBox: 0 | 1 | 2 | 3 | 4;
    let nextDueAt: number;

    if (correct) {
      newBox = Math.min(4, card.box + 1) as 0 | 1 | 2 | 3 | 4;
      nextDueAt = now + LEITNER_INTERVALS_MS[newBox];
      setCorrectCount(c => c + 1);
    } else {
      newBox = 0;
      nextDueAt = now; // due immediately for repeat
      setIncorrectCount(c => c + 1);
    }

    // Persist Leitner schedule
    await quizzesRepo.updateBox(card.id, newBox, nextDueAt);

    // Update topic mastery if card has a topicId
    if (card.topicId) {
      const topic = topics.find(t => t.id === card.topicId);
      if (topic) {
        const delta = correct ? 10 : -8;
        const newMastery = Math.max(0, Math.min(100, topic.mastery + delta));
        await topicsRepo.updateMastery(topic.id, newMastery);
      }
    }

    if (currentIndex + 1 < sessionCards.length) {
      setCurrentIndex(i => i + 1);
    } else {
      await refreshAll();
      await loadAllCards();
      setIsSessionDone(true);
    }
  };

  // Generate new cards using AI from cached analysis
  const handleGenerateAiQuiz = async () => {
    const targetItem = items.find(i => i.id === selectedItemId) || items[0];
    if (!targetItem) {
      setGenFeedback('Please select a document first.');
      return;
    }

    if (!groqApiKey.trim()) {
      setGenFeedback('Add your free Groq API key in Settings to generate flashcards.');
      return;
    }

    setIsGenerating(true);
    setGenFeedback('Reading cached analysis concepts...');

    try {
      const hash = targetItem.fileHash || targetItem.id;
      let analysis = await analysesRepo.getByHashAndVersion(hash, 1);

      if (!analysis) {
        // Mock simple concept analysis fallback
        analysis = {
          id: 'temp',
          itemId: targetItem.id,
          fileHash: hash,
          promptVersion: 1,
          concepts: [
            { name: `${targetItem.title} - Core Principles`, importance: 5, why: 'High yield exam topic' }
          ],
          weakSpots: ['Key definitions and mathematical invariants'],
          learningOrder: ['Prerequisites', 'Mechanisms'],
          plan: [{ day: 1, tasks: ['Review definitions'] }],
          realityCheck: 'Active recall required.',
          createdAt: Date.now(),
        };
      }

      setGenFeedback('Synthesizing Leitner flashcards with Groq...');
      const provider = new GroqProvider({ apiKey: groqApiKey, model: aiModel });
      const newCards = await generateQuizFromAnalysis(analysis, provider);

      await loadAllCards();
      setIsGenerating(false);
      setGenFeedback(`Generated ${newCards.length} flashcards!`);
      setTimeout(() => setGenFeedback(''), 3000);
      handleStartSession(newCards);

    } catch (err: unknown) {
      console.error('Quiz generation failed:', err);
      setIsGenerating(false);
      setGenFeedback(err instanceof Error ? err.message : 'Flashcard generation failed.');
      setTimeout(() => setGenFeedback(''), 4000);
    }
  };

  // Weakest topics for heatmap
  const weakTopics: Topic[] = useMemo(() => {
    return [...topics].sort((a, b) => a.mastery - b.mastery).slice(0, 3);
  }, [topics]);

  // ACTIVE FLASHCARD SESSION VIEW
  if (isSessionActive && !isSessionDone && sessionCards.length > 0) {
    const currentCard = sessionCards[currentIndex];
    const progressPercent = Math.round(((currentIndex) / sessionCards.length) * 100);

    return (
      <div className="h-full flex flex-col bg-bg p-4 overflow-hidden select-none">
        {/* Top Session Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsSessionActive(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-text-muted hover:text-text-primary text-xs font-medium"
          >
            <ArrowLeft size={14} />
            <span>End</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-accent">{progressPercent}%</span>
          </div>
        </div>

        {/* Top Progress Track */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-6">
          <div
            className="h-full bg-accent transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 3D Flashcard */}
        <div className="flex-1 flex items-center justify-center">
          <Flashcard
            card={currentCard}
            onAnswer={handleAnswerCard}
            index={currentIndex}
            total={sessionCards.length}
          />
        </div>
      </div>
    );
  }

  // SESSION COMPLETED VIEW
  if (isSessionDone) {
    return (
      <div className="h-full flex flex-col bg-bg p-5 overflow-y-auto scroll-container">
        <QuizResults
          totalAnswered={sessionCards.length}
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          weakTopics={weakTopics}
          onRestart={() => handleStartSession(sessionCards)}
          onDone={() => {
            setIsSessionDone(false);
            setIsSessionActive(false);
          }}
        />
      </div>
    );
  }

  // MAIN QUIZ & REVISION HUB VIEW
  return (
    <div className="h-full flex flex-col bg-bg px-5 pt-6 pb-20 overflow-y-auto scroll-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-accent font-semibold text-xs uppercase tracking-wider">
            <Brain size={16} />
            <span>Spaced Repetition</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Active Recall Quizzes</h1>
        </div>

        {dueCards.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold animate-pulse">
            {dueCards.length} Due
          </span>
        )}
      </div>

      {genFeedback && (
        <div className="p-3 rounded-xl bg-accent/20 border border-accent/40 text-xs font-semibold text-accent text-center">
          {genFeedback}
        </div>
      )}

      {/* Due Today Quick Practice Card */}
      {dueCards.length > 0 ? (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-bg-card to-bg-card border border-indigo-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Calendar size={15} />
              <span>Revision Due Today</span>
            </div>
            <span className="text-xs font-mono font-bold text-text-primary">{dueCards.length} cards</span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Strengthen your neural pathways before memory decay occurs.
          </p>

          <button
            onClick={() => handleStartSession(dueCards)}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-accent/25 active:scale-95 transition-all"
          >
            <Play size={15} className="fill-white" />
            <span>Review {dueCards.length} Due Cards</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-primary">All Caught Up!</h3>
            <p className="text-[11px] text-text-muted mt-0.5">Zero flashcards due today. Generate new cards below.</p>
          </div>
        </div>
      )}

      {/* Document Selector & AI Quiz Generator */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Generate & Practice</h2>
          <span className="text-xs font-mono text-text-muted">{allCards.length} Total Cards</span>
        </div>

        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-xs text-text-primary font-medium focus:outline-none focus:border-accent"
        >
          <option value="all">All Documents ({allCards.length} cards)</option>
          <option value="due">Due Cards Only ({dueCards.length} cards)</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => handleStartSession(filteredCards)}
            disabled={filteredCards.length === 0}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-border-subtle text-xs font-semibold text-text-primary disabled:opacity-40 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Play size={14} />
            <span>Practice ({filteredCards.length})</span>
          </button>

          <button
            onClick={handleGenerateAiQuiz}
            disabled={isGenerating}
            className="py-2.5 px-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md shadow-accent/20 active:scale-95 transition-all"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
          </button>
        </div>
      </div>

      {/* Leitner Box Overview */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Leitner Memory Boxes</h3>
        <div className="grid grid-cols-5 gap-1.5 text-center">
          {[0, 1, 2, 3, 4].map((boxNum) => {
            const count = allCards.filter(c => c.box === boxNum).length;
            return (
              <div key={boxNum} className="p-2.5 rounded-xl bg-white/5 border border-border-subtle">
                <div className="text-xs font-mono font-bold text-text-primary">{count}</div>
                <div className="text-[9px] text-text-muted mt-0.5">Box {boxNum}</div>
              </div>
            );
          })}
        </div>
      </div>

      {allCards.length === 0 && (
        <EmptyState
          icon={Brain}
          title="No Flashcards in Vault"
          description="Select any document from your vault and tap 'AI Generate' to build your active recall deck."
          actionLabel="Go to Library"
          onAction={() => navigate('/library')}
        />
      )}
    </div>
  );
};
