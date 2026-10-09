import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db, Semester, Subject, Topic } from '../../db';
import { TopAppBar } from '../../components/m3e';
import { TopicRow } from '../../components/m3e/cards';
import { ShapeBadge } from '../../components/m3e/ShapeBadge';
import { BookOpen, Layers, Sparkles, Compass } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';

interface ShelfScreenProps {
  onOpenSubject?: (subjectId: string) => void;
  onOpenTopic?: (topicId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ShelfScreen: React.FC<ShelfScreenProps> = ({
  onOpenTopic,
  onNavigateTab,
}) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemId, setSelectedSemId] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjectDocCounts, setSubjectDocCounts] = useState<Map<string, number>>(new Map());
  const motionPreset = useMotionPreset();

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

  const activeColor = selectedSubject?.color || '#d0bcff';
  const activeDocCount = selectedSubject ? subjectDocCounts.get(selectedSubject.id) || 0 : 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-28">
      <TopAppBar
        title="Study Shelf"
        subtitle="Syllabus, Semesters & Subject Dossiers"
        trailingAction={
          <div className="p-2 rounded-2xl bg-surface-container-high text-primary">
            <Compass className="w-5 h-5" />
          </div>
        }
      />

      <main className="px-4 py-3 space-y-5 max-w-2xl mx-auto">
        {/* Semester Capsule Selector */}
        <section className="space-y-1">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {semesters.map((sem) => {
              const isSelected = selectedSemId === sem.id;
              return (
                <button
                  key={sem.id}
                  onClick={() => setSelectedSemId(sem.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {sem.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Panoramic Active Subject Dossier Banner */}
        {selectedSubject && (
          <motion.div
            key={selectedSubject.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionPreset.spatialDefault}
            className="p-6 rounded-[32px] bg-gradient-to-br from-surface-container-high to-surface-container shadow-2xl relative overflow-hidden space-y-4"
          >
            {/* Ambient subject glow */}
            <div
              className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeColor }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <ShapeBadge
                  shape="flower"
                  size={52}
                  shapeFill="rgba(255, 255, 255, 0.08)"
                  glow
                  glowColor={activeColor}
                  icon={<BookOpen className="w-6 h-6 stroke-[2.2px]" style={{ color: activeColor }} />}
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-primary">
                    Active Subject Dossier
                  </span>
                  <h2 className="text-xl font-extrabold text-on-surface truncate">
                    {selectedSubject.name}
                  </h2>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {topics.length} syllabus topics &bull; {activeDocCount} attached documents
                  </p>
                </div>
              </div>

              {/* Syllabus Completion Ring */}
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    style={{ color: activeColor }}
                    strokeDasharray="75, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-mono font-bold text-on-surface">
                  75%
                </span>
              </div>
            </div>

            {/* Quick Action Strip */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onNavigateTab && onNavigateTab('quiz')}
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Quiz Subject Deck</span>
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('coach')}
                className="py-2.5 px-3.5 rounded-xl bg-surface-container-highest text-on-surface text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI Coach Analysis</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Subject Carousel Pills */}
        <section className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant px-1 font-mono">
            Enrolled Subjects ({subjects.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {subjects.map((subj) => {
              const isSelected = selectedSubject?.id === subj.id;
              const docCount = subjectDocCounts.get(subj.id) || 0;
              return (
                <motion.div
                  key={subj.id}
                  whileTap={motionPreset.tapFeedback.whileTap}
                  transition={motionPreset.tapFeedback.transition}
                  onClick={() => setSelectedSubject(subj)}
                  className={`p-3.5 rounded-[22px] cursor-pointer flex flex-col justify-between min-h-[96px] transition-all ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container shadow-md'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShapeBadge
                      shape="squircle"
                      size={32}
                      shapeFill={isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)'}
                      icon={<BookOpen className="w-4 h-4" style={{ color: subj.color || '#d0bcff' }} />}
                    />
                    <span className="text-[10px] font-mono font-bold opacity-75">
                      {docCount} docs
                    </span>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold truncate">
                      {subj.name}
                    </h4>
                    <p className="text-[10px] opacity-70">
                      4 topics active
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Hierarchical Syllabus Tree */}
        {selectedSubject && (
          <section className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant font-mono">
                {selectedSubject.name} &bull; Syllabus Nodes
              </h3>
              <span className="text-xs text-primary font-bold">
                {topics.length} Chapters
              </span>
            </div>

            <div className="space-y-2">
              {topics.length === 0 ? (
                <div className="p-8 text-center bg-surface-container rounded-3xl space-y-1">
                  <p className="text-sm font-bold text-on-surface">No topics defined yet</p>
                  <p className="text-xs text-on-surface-variant">
                    Use the quick + button to create notes or attach syllabus topics.
                  </p>
                </div>
              ) : (
                topics.map((top, idx) => (
                  <TopicRow
                    key={top.id}
                    title={`${idx + 1}. ${top.name}`}
                    flashcardCount={4}
                    dueCards={idx === 0 ? 2 : 0}
                    masteryPercent={idx === 0 ? 45 : 80}
                    isComplete={idx > 1}
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
