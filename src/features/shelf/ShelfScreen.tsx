import React, { useEffect, useState } from 'react';
import { db, Semester, Subject, Topic } from '../../db';
import { TopAppBar } from '../../components/m3e';
import { SubjectCard, TopicRow } from '../../components/m3e/cards';

interface ShelfScreenProps {
  onOpenSubject?: (subjectId: string) => void;
  onOpenTopic?: (topicId: string) => void;
}

export const ShelfScreen: React.FC<ShelfScreenProps> = ({
  onOpenTopic
}) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemId, setSelectedSemId] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjectDocCounts, setSubjectDocCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const loadShelf = async () => {
      try {
        const sems = await db.semesters.orderBy('orderIndex').toArray();
        setSemesters(sems);
        if (sems.length > 0) {
          setSelectedSemId(sems[0].id);
        }
      } catch (err) {
        console.error('Failed to load semesters:', err);
      }
    };
    loadShelf();
  }, []);

  useEffect(() => {
    if (!selectedSemId) return;
    const loadSubjects = async () => {
      try {
        const subjs = await db.subjects.where('semesterId').equals(selectedSemId).toArray();
        setSubjects(subjs);
        if (subjs.length > 0) {
          setSelectedSubject(subjs[0]);
        }

        const counts = new Map<string, number>();
        for (const s of subjs) {
          const count = await db.documents.where('subjectId').equals(s.id).count();
          counts.set(s.id, count);
        }
        setSubjectDocCounts(counts);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    loadSubjects();
  }, [selectedSemId]);

  useEffect(() => {
    if (!selectedSubject) return;
    const loadTopics = async () => {
      try {
        const topList = await db.topics.where('subjectId').equals(selectedSubject.id).toArray();
        setTopics(topList);
      } catch (err) {
        console.error('Failed to load topics:', err);
      }
    };
    loadTopics();
  }, [selectedSubject]);

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] pb-24">
      <TopAppBar
        title="Study Shelf"
        subtitle="Syllabus, Semesters & Topics"
      />

      <main className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
        <section className="space-y-2">
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {semesters.map((sem) => (
              <button
                key={sem.id}
                onClick={() => setSelectedSemId(sem.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSemId === sem.id
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                }`}
              >
                {sem.name}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--md-sys-color-on-surface-variant)] px-1">
            Subjects ({subjects.length})
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((subj) => (
              <SubjectCard
                key={subj.id}
                name={subj.name}
                topicCount={4}
                docCount={subjectDocCounts.get(subj.id) || 0}
                masteryPercent={75}
                accentColor={subj.color || '#4285F4'}
                accentContainer="var(--md-sys-color-secondary-container)"
                onAccentContainer="var(--md-sys-color-on-secondary-container)"
                onClick={() => setSelectedSubject(subj)}
              />
            ))}
          </div>
        </section>

        {selectedSubject && (
          <section className="space-y-2 pt-2">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--md-sys-color-on-surface-variant)] px-1">
              {selectedSubject.name} Topics
            </h2>

            <div className="space-y-2">
              {topics.length === 0 ? (
                <div className="p-6 text-center bg-[var(--md-sys-color-surface-container-low)] rounded-3xl border border-[var(--md-sys-color-outline-variant)]">
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    No topics created yet for this subject.
                  </p>
                </div>
              ) : (
                topics.map((top) => (
                  <TopicRow
                    key={top.id}
                    name={top.name}
                    itemCount={3}
                    dueCards={2}
                    masteryPercent={68}
                    onClick={() => onOpenTopic && onOpenTopic(top.id)}
                  />
                ))
              )}
            </div>
        </section>
      )}
    </main>
  </div>
  );
};
