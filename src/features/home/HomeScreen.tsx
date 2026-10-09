import React, { useEffect, useState } from 'react';
import { db, Document, Subject, Flashcard } from '../../db';
import { HeroCard, ContinueCard, StatCard, WeakTopicCard } from '../../components/m3e/cards';
import { TopAppBar } from '../../components/m3e';
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
  const [streakDays] = useState<number>(5);
  const [recentDoc, setRecentDoc] = useState<Document | null>(null);
  const [recentDocSubject, setRecentDocSubject] = useState<string>('');
  const [totalDocsCount, setTotalDocsCount] = useState<number>(0);
  // flashcards count state removed
  const [overallMastery, setOverallMastery] = useState<number>(72);
  const [weakTopics, setWeakTopics] = useState<{ topicName: string; subjectName: string; mastery: number }[]>([]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const now = Date.now();
        const due = await db.flashcards.where('dueAt').belowOrEqual(now).count();
        setDueCardsCount(due);

        const totalDocs = await db.documents.count();
        setTotalDocsCount(totalDocs);

        // total cards count omitted

        const docs = await db.documents.orderBy('updatedAt').reverse().limit(1).toArray();
        if (docs.length > 0) {
          setRecentDoc(docs[0]);
          if (docs[0].subjectId) {
            const subj = await db.subjects.get(docs[0].subjectId);
            if (subj) setRecentDocSubject(subj.name);
          }
        }

        const cards = await db.flashcards.toArray();
        if (cards.length > 0) {
          const boxedCards = cards.filter((c: Flashcard) => c.box > 2).length;
          setOverallMastery(Math.round((boxedCards / cards.length) * 100));
        }

        const subjects = await db.subjects.limit(2).toArray();
        if (subjects.length > 0) {
          setWeakTopics(
            subjects.map((s: Subject) => ({
              topicName: s.name + ' Core Concepts',
              subjectName: s.name,
              mastery: 42
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-28">
      <TopAppBar
        title="StudyVault"
        subtitle="Private Vault & Blunt AI Coach"
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
            title="Welcome to StudyVault"
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
              className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
            >
              <span>Explore Vault</span>
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
              label="Vault Retention"
              value={overallMastery + '%'}
              sublabel="Average Mastery"
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
              label="Active Syllabus"
              value="Semester 1"
              sublabel="Enrolled Track"
              icon={Compass}
              variant="surface"
              shape="clover4"
              onClick={() => onNavigateTab('shelf')}
            />
          </div>
        </section>

        {/* Priority Focus / Blindspot Alert */}
        {weakTopics.length > 0 && (
          <section className="space-y-2 pt-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant px-1 font-mono">
              Priority Focus & Blindspots
            </h2>
            <div className="space-y-2">
              {weakTopics.map((wt, idx) => (
                <WeakTopicCard
                  key={idx}
                  topicName={wt.topicName}
                  subjectName={wt.subjectName}
                  masteryPercent={wt.mastery}
                  weakPointsCount={3}
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
