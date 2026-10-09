import React, { useEffect, useState } from 'react';
import { db, Document, Flashcard } from '../../db';
import { HeroCard, ContinueCard, StatCard, WeakTopicCard } from '../../components/m3e/cards';
import { TopAppBar, MonofolioLogo } from '../../components/m3e';
import { Sparkles, BookOpen, Layers, Award, Compass, ArrowUpRight } from 'lucide-react';

export interface HomeScreenProps {
  onNavigateTab?: (tab: 'home' | 'shelf' | 'library' | 'quiz' | 'coach' | 'links' | 'settings') => void;
  onOpenDocument?: (docId: string) => void;
  onOpenSubject?: (subjectId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab = () => {},
  onOpenDocument,
}) => {
  const [dueCardsCount, setDueCardsCount] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [recentDoc, setRecentDoc] = useState<Document | null>(null);
  const [recentDocSubject, setRecentDocSubject] = useState<string>('');
  const [totalDocsCount, setTotalDocsCount] = useState<number>(0);
  const [overallMastery, setOverallMastery] = useState<number>(0);
  const [weakTopics, setWeakTopics] = useState<{ topicName: string; subjectName: string; mastery: number; topicId: string }[]>([]);
  const [activeSemesterName, setActiveSemesterName] = useState<string>('Semester 1');

  useEffect(() => {
    const loadRealHomeData = async () => {
      try {
        const now = Date.now();
        // 1. Real due flashcards count
        const due = await db.flashcards.where('dueAt').belowOrEqual(now).count();
        setDueCardsCount(due);

        // 2. Real total documents count
        const totalDocs = await db.documents.count();
        setTotalDocsCount(totalDocs);

        // 3. Real last-opened or updated document
        const docs = await db.documents.orderBy('updatedAt').reverse().limit(1).toArray();
        if (docs.length > 0) {
          setRecentDoc(docs[0]);
          if (docs[0].subjectId) {
            const subj = await db.subjects.get(docs[0].subjectId);
            if (subj) setRecentDocSubject(subj.name);
          }
        }

        // 4. Real overall vault mastery calculated from actual flashcard box levels
        const allCards = await db.flashcards.toArray();
        if (allCards.length > 0) {
          const totalScore = allCards.reduce((acc: number, card: Flashcard) => acc + (card.box || 0), 0);
          const maxScore = allCards.length * 4;
          const calculatedMastery = Math.round((totalScore / maxScore) * 100);
          setOverallMastery(calculatedMastery);
        } else {
          setOverallMastery(0);
        }

        // 5. Real weak topics query from db.topics where mastery is lowest or < 60
        const topics = await db.topics.orderBy('mastery').limit(3).toArray();
        if (topics.length > 0) {
          const loadedWeak: { topicName: string; subjectName: string; mastery: number; topicId: string }[] = [];
          for (const top of topics) {
            const subj = await db.subjects.get(top.subjectId);
            loadedWeak.push({
              topicId: top.id,
              topicName: top.name,
              subjectName: subj ? subj.name : 'General',
              mastery: top.mastery || 0,
            });
          }
          setWeakTopics(loadedWeak);
        }

        // 6. Real Active Semester
        const sems = await db.semesters.toArray();
        if (sems.length > 0) {
          setActiveSemesterName(sems[0].name);
        }

        // 7. Real streak from activity logs or today's session
        const storedStreak = localStorage.getItem('studyvault_streak');
        if (storedStreak) {
          setStreakDays(parseInt(storedStreak, 10) || 1);
        }
      } catch (err) {
        console.error('Failed to load real home data:', err);
      }
    };
    loadRealHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-28">
      <TopAppBar
        title="Monofolio"
        subtitle="Private Vault & Blunt AI Coach"
        leadingAction={
          <div className="w-10 h-10 rounded-2xl bg-primary-container/70 flex items-center justify-center p-2 shadow-inner">
            <MonofolioLogo size={24} className="text-primary" />
          </div>
        }
        trailingAction={
          <button
            onClick={() => onNavigateTab('coach')}
            className="p-2.5 rounded-2xl bg-primary-container text-on-primary-container active:scale-90 transition-transform cursor-pointer"
            aria-label="AI Coach"
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </button>
        }
      />

      <main className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
        {/* Spotlight Command Hub */}
        <HeroCard
          dueCount={dueCardsCount}
          streakDays={streakDays}
          onStartRevision={() => onNavigateTab('quiz')}
          onAskCoach={() => onNavigateTab('coach')}
        />

        {/* Continue Reading Horizon Module */}
        {recentDoc ? (
          <ContinueCard
            title={recentDoc.title}
            subjectName={recentDocSubject || 'General'}
            topicName="Last accessed lecture notes"
            progressPercent={65}
            onClick={() => onOpenDocument && onOpenDocument(recentDoc.id)}
          />
        ) : (
          <ContinueCard
            title="Welcome to Monofolio"
            subjectName="Getting Started"
            topicName="Tap to organize your semester syllabus & docs"
            progressPercent={0}
            onClick={() => onNavigateTab('shelf')}
          />
        )}

        {/* Bento Stat Cluster */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant font-mono">
              Intelligence Bento
            </h2>
            <button
              onClick={() => onNavigateTab('shelf')}
              className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              <span>Explore Shelf</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Review Queue"
              value={dueCardsCount}
              sublabel="Cards Due"
              icon={Layers}
              variant="primary"
              shape="pill"
              onClick={() => onNavigateTab('quiz')}
            />
            <StatCard
              label="Vault Mastery"
              value={overallMastery + '%'}
              sublabel="Calculated Recall"
              icon={Award}
              variant="tertiary"
              shape="squircle"
            />
            <StatCard
              label="Documents"
              value={totalDocsCount}
              sublabel="PDFs & Notes"
              icon={BookOpen}
              variant="secondary"
              shape="softBurst"
              onClick={() => onNavigateTab('library')}
            />
            <StatCard
              label="Active Track"
              value={activeSemesterName}
              sublabel="Enrolled Semester"
              icon={Compass}
              variant="surface"
              shape="clover4"
              onClick={() => onNavigateTab('shelf')}
            />
          </div>
        </section>

        {/* Priority Focus / Real Blindspots */}
        {weakTopics.length > 0 && (
          <section className="space-y-2 pt-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant px-1 font-mono">
              Priority Focus & Blindspots
            </h2>
            <div className="space-y-2">
              {weakTopics.map((wt) => (
                <WeakTopicCard
                  key={wt.topicId}
                  topicName={wt.topicName}
                  subjectName={wt.subjectName}
                  masteryPercent={wt.mastery}
                  weakPointsCount={wt.mastery < 30 ? 3 : 1}
                  onClick={() => onNavigateTab('coach')}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
