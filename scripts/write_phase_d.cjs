const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, '..', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Wrote', relPath);
}

const quizScreen = `import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Play 
} from 'lucide-react';
import type { QuizCard } from '../../db/schema';
import { TopAppBar, Button, LoadingIndicator } from '../../components/m3e';

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
  const groqApiKey = useSettingsStore(state => state.groqApiKey);
  const aiModel = useSettingsStore(state => state.aiModel);

  const initialItemId = searchParams.get('itemId');

  const [allCards, setAllCards] = useState<QuizCard[]>([]);
  const [dueCards, setDueCards] = useState<QuizCard[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>(initialItemId || 'all');
  
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionCards, setSessionCards] = useState<QuizCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [isSessionDone, setIsSessionDone] = useState<boolean>(false);

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

  const filteredCards = useMemo(() => {
    if (selectedItemId === 'all') return allCards;
    if (selectedItemId === 'due') return dueCards;
    return allCards.filter(c => c.itemId === selectedItemId);
  }, [allCards, dueCards, selectedItemId]);

  const handleStartSession = (cardsToReview: QuizCard[]) => {
    if (cardsToReview.length === 0) return;
    setSessionCards(cardsToReview);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsSessionDone(false);
    setIsSessionActive(true);
  };

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
      nextDueAt = now;
      setIncorrectCount(c => c + 1);
    }

    await quizzesRepo.updateBox(card.id, newBox, nextDueAt);

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
      setIsSessionDone(true);
      await loadAllCards();
    }
  };

  const handleGenerateCards = async () => {
    if (!selectedItemId || selectedItemId === 'all' || selectedItemId === 'due') {
      setGenFeedback('Please select a specific document to generate cards from.');
      return;
    }

    if (!groqApiKey) {
      setGenFeedback('Groq API Key is required. Please set it in Settings.');
      return;
    }

    const doc = items.find(i => i.id === selectedItemId);
    if (!doc) return;

    setIsGenerating(true);
    setGenFeedback('Generating active recall cards from document analysis...');

    try {
      const hash = doc.fileHash || doc.id;
      const analysis = await analysesRepo.getByHashAndVersion(hash, 1);
      
      if (!analysis) {
        setGenFeedback('Document has not been analyzed yet. Run Coach Analysis first.');
        setIsGenerating(false);
        return;
      }

      const provider = new GroqProvider({ apiKey: groqApiKey, model: aiModel });
      const cards = await generateQuizFromAnalysis(doc.id, analysis, provider);

      if (cards.length > 0) {
        await quizzesRepo.createBulk(cards);
        await loadAllCards();
        setGenFeedback(`Successfully generated ${cards.length} flashcards!`);
      } else {
        setGenFeedback('No cards generated. Please try again.');
      }
    } catch (err: any) {
      setGenFeedback(`Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const weakTopics = useMemo(() => {
    return topics.filter(t => t.mastery < 50);
  }, [topics]);

  return (
    <div className="min-h-full h-full flex flex-col pb-24 overflow-y-auto scroll-container font-sans select-none">
      <TopAppBar
        title={isSessionActive ? `Flashcards (${currentIndex + 1}/${sessionCards.length})` : 'Active Recall Quiz'}
        subtitle={isSessionActive ? 'Leitner Spaced Repetition' : `${allCards.length} Total Cards • ${dueCards.length} Due`}
        action={
          isSessionActive ? (
            <Button
              variant="tonal"
              size="sm"
              onClick={() => {
                setIsSessionActive(false);
                setIsSessionDone(false);
              }}
            >
              Exit
            </Button>
          ) : undefined
        }
      />

      <div className="px-4 flex-1 flex flex-col justify-center">
        {isSessionActive && !isSessionDone f& sessionCards.length > 0 && (
          <Flashcard
            card={sessionCards[currentIndex]}
            onAnswer={handleAnswerCard}
            index={currentIndex}
            total={sessionCards.length}
          />
        )}

        {isSessionActive && isSessionDone f& (
          <QuizResults
            totalAnswered={sessionCards.length}
            correctCount={correctCount}
            incorrectCount=tincorrectCount}
            weakTopics={weakTopics}
            onRestart={() => handleStartSession(sessionCards)}
            onDone={() => {
              setIsSessionActive(false);
              setIsSessionDone(false);
            }}
          />
        )}

        {!isSessionActive && (
          <div className="space-y-4">
            <div className="p-5 rounded-[28px] bg-surface-container border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Brain size={20} />
                  <span className="m3-title-medium-emp text-on-surface">Leitner Due Queue</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-mono text-xs font-bold">
                  {dueCards.length} Ready
                </span>
              </div>

              <p className="m3-body-small text-on-surface-variant">
                Spaced repetition reviews reinforce memory consolidation before decay sets in.
              </p>

              <Button
                variant="filled"
                disabled={dueCards.length === 0}
                onClick={() => handleStartSession(dueCards)
                className="w-full justify-center shadow-sm"
              >
                <Play size={16} />
                <span>Start Due Revision ({dueCards.length})</span>
              </Button>
            </div>

            <div className="p-5 rounded-[28px] bg-surface-container border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="m3-label-medium text-on-surface-variant uppercase font-bold tracking-wider">
                  Deck Selection
                </span>
              </div>

              <select
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-highest text-on-surface border border-outline-variant/40 outline-none m3-body-medium"
              >
                <option value="all">All Cards in Vault ({allCards.length})</option>
                <option value="due">Only Due Cards ({dueCards.length})</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="tonal"
                  disabled={filteredCards.length === 0}
                  onClick={() => handleStartSession(filteredCards)}
                  className="flex-1 justify-center"
                >
                  <Play size={15} />
                  <span>Review Deck ({filteredCards.length})</span>
                </Button>


                {selectedItemId !== 'all' && selectedItemId !== 'due' && (
                  <Button
                    variant="outlined"
                    disabled={isGenerating}
                    onClick={handleGenerateCards}
                  >
                    {isGenerating ? <LoadingIndicator size="sm" /> : <Sparkles size={15} />}
                    <span>AI Gen</span>
                  </Button>
                )}
              </div>


            {genFeedback && (
              <p className="m3-body-small text-on-surface-variant text-center pt-1">
                {genFeedback}
              </p>
            )}
            </div>


            {allCards.length === 0 && (
              <EmptyState
                icon={Brain}
                title="No Flashcards Created"
                description="Upload semester materials in Library and let the II Coach generate active recall flashcards."
                actionLabel="Go to Library"
                onAction={() => navigate('/library')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
`;

writeFile('src/features/quiz/QuizScreen.tsx', quizScreen);
