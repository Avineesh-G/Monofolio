import React, { useState } from 'react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { ProgressRing } from '../../components/ProgressRing';
import { EmptyState } from '../../components/EmptyState';
import { SheetCard } from '../../components/SheetCard';
import { subjectsRepo, topicsRepo, semestersRepo } from '../../db/repos';
import { 
  FolderKanban, 
  Plus, 
  BookOpen, 
  Cpu, 
  Database, 
  Network, 
  Layers, 
  Code,
  type LucideIcon,
} from 'lucide-react';

const SUBJECT_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

const ICONS_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Cpu,
  Database,
  Network,
  Layers,
  Code,
};

export const ShelfScreen: React.FC = () => {
  const semesters = useLibraryStore(state => state.semesters);
  const subjects = useLibraryStore(state => state.subjects);
  const topics = useLibraryStore(state => state.topics);
  const selectedSemesterId = useLibraryStore(state => state.selectedSemesterId);
  const selectedSubjectId = useLibraryStore(state => state.selectedSubjectId);
  
  const setSelectedSemester = useLibraryStore(state => state.setSelectedSemester);
  const setSelectedSubject = useLibraryStore(state => state.setSelectedSubject);
  const refreshAll = useLibraryStore(state => state.refreshAll);

  // Modals state
  const [modalType, setModalType] = useState<'none' | 'semester' | 'subject' | 'topic'>('none');
  const [newSemesterName, setNewSemesterName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);
  const [newTopicName, setNewTopicName] = useState('');

  // Active semester & subjects
  const currentSemester = semesters.find(s => s.id === selectedSemesterId) || semesters[0];
  const semesterSubjects = subjects.filter(s => s.semesterId === currentSemester?.id);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || semesterSubjects[0];
  const subjectTopics = topics.filter(t => t.subjectId === currentSubject?.id);

  const handleCreateSemester = async () => {
    if (!newSemesterName.trim()) return;
    const sem = await semestersRepo.create(newSemesterName.trim());
    await refreshAll();
    setSelectedSemester(sem.id);
    setNewSemesterName('');
    setModalType('none');
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim() || !currentSemester) return;
    const sub = await subjectsRepo.create(currentSemester.id, newSubjectName.trim(), selectedColor);
    await refreshAll();
    setSelectedSubject(sub.id);
    setNewSubjectName('');
    setModalType('none');
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim() || !currentSubject) return;
    await topicsRepo.create(currentSubject.id, newTopicName.trim());
    await refreshAll();
    setNewTopicName('');
    setModalType('none');
  };

  return (
    <div className="h-full flex flex-col pb-20 overflow-y-auto scroll-container">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Study Shelf</h1>
            <p className="text-xs text-text-secondary">Organized by Semester & Subjects</p>
          </div>
          
          <button
            onClick={() => setModalType('semester')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-border-subtle text-xs font-medium text-text-primary hover:bg-white/10 active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>New Sem</span>
          </button>
        </div>

        {/* Semester Selector Chips */}
        {semesters.length > 0 && (
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            {semesters.map((sem) => (
              <button
                key={sem.id}
                onClick={() => {
                  setSelectedSemester(sem.id);
                  const firstSub = subjects.find(s => s.semesterId === sem.id);
                  setSelectedSubject(firstSub ? firstSub.id : null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  sem.id === currentSemester?.id
                    ? 'bg-accent text-white shadow-md shadow-accent/20'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                }`}
              >
                {sem.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subject Grid */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Subjects</h2>
          <button
            onClick={() => setModalType('subject')}
            className="text-xs font-medium text-accent hover:text-accent-hover flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Add Subject</span>
          </button>
        </div>

        {semesterSubjects.length === 0 ? (
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle text-center">
            <p className="text-xs text-text-secondary mb-3">No subjects in this semester yet.</p>
            <button
              onClick={() => setModalType('subject')}
              className="px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-medium"
            >
              Create First Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {semesterSubjects.map((sub) => {
              const Icon = ICONS_MAP[sub.icon] || BookOpen;
              const isSelected = sub.id === currentSubject?.id;
              const subTopics = topics.filter(t => t.subjectId === sub.id);
              const avgMastery = subTopics.length > 0
                ? Math.round(subTopics.reduce((acc, t) => acc + t.mastery, 0) / subTopics.length)
                : 0;

              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-bg-elevated border-accent shadow-lg shadow-accent/10'
                      : 'bg-bg-card border-border-subtle hover:border-border-medium'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <ProgressRing progress={avgMastery} size={28} strokeWidth={3} color={sub.color} />
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-text-primary line-clamp-1">{sub.name}</h3>
                    <p className="text-[10px] text-text-muted mt-0.5">{subTopics.length} topics</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Topic List */}
      {currentSubject && (
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {currentSubject.name} &bull; Topics
            </h2>
            <button
              onClick={() => setModalType('topic')}
              className="text-xs font-medium text-accent hover:text-accent-hover flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add Topic</span>
            </button>
          </div>

          {subjectTopics.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No Topics Added"
              description="Break down this subject into focused topics to track your exam readiness."
              actionLabel="Add Topic"
              onAction={() => setModalType('topic')}
            />
          ) : (
            <div className="space-y-2">
              {subjectTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-bg-card border border-border-subtle hover:border-border-medium transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ProgressRing
                      progress={topic.mastery}
                      size={36}
                      strokeWidth={3.5}
                      color={currentSubject.color}
                    />
                    <div>
                      <h4 className="text-sm font-medium text-text-primary">{topic.name}</h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {topic.mastery >= 80 ? 'Exam Ready' : topic.mastery >= 50 ? 'In Progress' : 'Needs Review'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        const newMastery = (topic.mastery + 25) % 125;
                        await topicsRepo.updateMastery(topic.id, newMastery > 100 ? 0 : newMastery);
                        await refreshAll();
                      }}
                      className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-medium text-text-secondary hover:text-text-primary active:scale-95 transition-all"
                    >
                      +25%
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Semester Modal */}
      <SheetCard
        isOpen={modalType === 'semester'}
        onClose={() => setModalType('none')}
        title="Add Semester"
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Semester Name</label>
            <input
              type="text"
              value={newSemesterName}
              onChange={(e) => setNewSemesterName(e.target.value)}
              placeholder="e.g. Semester 2 (Spring 2026)"
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
          <button
            onClick={handleCreateSemester}
            disabled={!newSemesterName.trim()}
            className="w-full py-2.5 rounded-lg bg-accent text-white font-medium text-sm disabled:opacity-40 active:scale-98 transition-all"
          >
            Create Semester
          </button>
        </div>
      </SheetCard>

      {/* Create Subject Modal */}
      <SheetCard
        isOpen={modalType === 'subject'}
        onClose={() => setModalType('none')}
        title="Add Subject"
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Subject Name</label>
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Algorithms & Data Structures"
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Color Theme</label>
            <div className="flex items-center gap-2 pt-1">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-bg-secondary' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateSubject}
            disabled={!newSubjectName.trim()}
            className="w-full py-2.5 rounded-lg bg-accent text-white font-medium text-sm disabled:opacity-40 active:scale-98 transition-all"
          >
            Create Subject
          </button>
        </div>
      </SheetCard>

      {/* Create Topic Modal */}
      <SheetCard
        isOpen={modalType === 'topic'}
        onClose={() => setModalType('none')}
        title="Add Topic"
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Topic Name</label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="e.g. Dynamic Programming & Memoization"
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <button
            onClick={handleCreateTopic}
            disabled={!newTopicName.trim()}
            className="w-full py-2.5 rounded-lg bg-accent text-white font-medium text-sm disabled:opacity-40 active:scale-98 transition-all"
          >
            Create Topic
          </button>
        </div>
      </SheetCard>
    </div>
  );
};
