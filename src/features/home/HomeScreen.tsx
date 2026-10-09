import React, { useEffect, useState } from 'react';
import { db, Document, Subject, Flashcard } from '../../db';
import { HeroCard, ContinueCard, StatCard, WeakTopicCard } from '../../components/m3e/cards';
import { TopAppBar } from '../../components/m3e';
import { Sparkles, BookOpen, Layers, Award } from 'lucide-react';

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
  const [totalFlashcardsCount, setTotalFlashcardsCount] = useState<number>(0);
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

        const totalCards = await db.flashcards.count();
        setTotalFlashcardsCount(totalCards);

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
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] pb-24">
      <TopAppBar
        title="StudyVault"
        subtitle="Semester Master & AI Coach"
        trailingAction={
          <button
            onClick={() => onNavigateTab('coach')}
            className="p-2 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] active:scale-95 transition-transform"
            aria-label="AI Coach"
          >
            <Sparkles className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
          </button>
        }
      />

      <main className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
        <HeroCard
          dueCount={dueCardsCount}
          streakDays={streakDays}
          onStartRevision={() => onNavigateTab('quiz')}
        />

        {recentDoc ? (
          <ContinueCard
            title={recentDoc.title}
            subjectName={recentDocSubject || 'General'}
            topicName="Last opened document"
            progressPercent={65}
            onClick={() => onOpenDocument && onOpenDocument(recentDoc.id)}
          />
        ) : (
          <ContinueCard
            title="Welcome to StudyVault"
            subjectName="Getting Started"
            topicName="Add your first syllabus & PDF"
            progressPercent={0}
            onClick={() => onNavigateTab('shelf')}
          />
        )}

        <section>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--md-sys-color-on-surface-variant)] mb-2 px-1">
            Overview
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Review Queue"
              value={dueCardsCount}
              sublabel="Cards pending"
              icon={Layers}
              variant="primary"
              shape="pill"
              onClick={() => onNavigateTab('quiz')}
            />
            <StatCard
              label="Vault Mastery"
              value={overallMastery + '%'}
              sublabel="Average score"
              icon={Award}
              variant="tertiary"
              shape="squircle"
            />
            <StatCard
              label="Study Documents"
              value={totalDocsCount}
              sublabel="PDFs & Notes"
              icon={BookOpen}
              variant="secondary"
              shape="softBurst"
              onClick={() => onNavigateTab('library')}
            />
            <StatCard
              label="Flashcards"
              value={totalFlashcardsCount}
              sublabel="In Leitner system"
              icon={Sparkles}
              variant="surface"
              shape="clover4"
              onClick={() => onNavigateTab('quiz')}
            />
          </div>
        </section>

        {weakTopics.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--md-sys-color-on-surface-variant)] px-1">
              Priority Focus
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
