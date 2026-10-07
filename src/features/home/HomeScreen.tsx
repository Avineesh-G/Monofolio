import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../../store/useLibraryStore';
import { quizzesRepo } from '../../db/repos';
import { ProgressRing } from '../../components/ProgressRing';
import { 
  Sparkles, 
  Flame, 
  BookOpen, 
  Bot, 
  AlertCircle, 
  ArrowRight,
  FileText,
  Brain,
  CheckCircle2
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const items = useLibraryStore(state => state.items);
  const subjects = useLibraryStore(state => state.subjects);
  const topics = useLibraryStore(state => state.topics);

  const [dueCardsCount, setDueCardsCount] = useState<number>(0);

  useEffect(() => {
    quizzesRepo.countDue().then(count => setDueCardsCount(count));
  }, []);

  // Recent PDF for continue reading
  const recentPdf = useMemo(() => {
    return items.find(i => i.kind === 'pdf');
  }, [items]);

  // Weakest topic
  const weakestTopic = useMemo(() => {
    if (topics.length === 0) return null;
    return [...topics].sort((a, b) => a.mastery - b.mastery)[0];
  }, [topics]);

  // Weakest topic's subject
  const weakestSubject = useMemo(() => {
    if (!weakestTopic) return null;
    return subjects.find(s => s.id === weakestTopic.subjectId);
  }, [weakestTopic, subjects]);

  return (
    <div className="h-full flex flex-col px-5 pt-6 pb-20 overflow-y-auto scroll-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-accent uppercase">Today's Focus</span>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">StudyVault</h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Flame size={14} className="fill-amber-400" />
          <span>Day 1 Streak</span>
        </div>
      </div>

      {/* Revision Due Alert Card */}
      {dueCardsCount > 0 ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 via-bg-card to-bg-card border border-rose-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Brain size={15} />
              <span>Spaced Repetition Due</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold">
              {dueCardsCount} cards
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            Cards in your Leitner boxes are ready for active recall practice.
          </p>

          <button
            onClick={() => navigate('/quiz')}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-rose-900/30"
          >
            <span>Review {dueCardsCount} Flashcards Now</span>
            <ArrowRight size={13} />
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary">All Revisions Completed</h4>
              <p className="text-[10px] text-text-muted">Zero cards due in Leitner queue today</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/quiz')}
            className="text-xs font-semibold text-accent hover:underline"
          >
            Open Quiz
          </button>
        </div>
      )}

      {/* Continue Reading Card */}
      {recentPdf ? (
        <div className="p-4 rounded-2xl bg-bg-elevated border border-border-medium shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Continue Document</span>
            <span className="text-[10px] text-text-muted">{recentPdf.pageCount || 1} pages</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary truncate">{recentPdf.title}</h3>
              <p className="text-xs text-text-secondary mt-0.5">Ready for deep dive & AI analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-subtle">
            <button
              onClick={() => navigate(`/reader/${recentPdf.id}`)}
              className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-text-primary text-center transition-colors"
            >
              Open Reader
            </button>
            <button
              onClick={() => navigate(`/coach?itemId=${recentPdf.id}`)}
              className="flex-1 py-2 rounded-lg bg-accent hover:bg-accent-hover text-xs font-medium text-white text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bot size={14} />
              <span>Coach Analysis</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle text-center">
          <BookOpen size={24} className="mx-auto mb-2 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Vault is Ready</h3>
          <p className="text-xs text-text-secondary mt-1 mb-3">Upload your first semester PDF to unlock the AI coach.</p>
          <button
            onClick={() => navigate('/library')}
            className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium"
          >
            Go to Library
          </button>
        </div>
      )}

      {/* Weakest Topic Alert Card */}
      {weakestTopic && (
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Weakest Topic Detected</span>
            </div>
            <button
              onClick={() => navigate(`/shelf`)}
              className="text-[10px] font-semibold text-accent hover:underline"
            >
              Practice Topic
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-text-primary">{weakestTopic.name}</h4>
              <p className="text-xs text-text-muted mt-0.5">{weakestSubject?.name || 'General'}</p>
            </div>
            <ProgressRing
              progress={weakestTopic.mastery}
              size={36}
              strokeWidth={3.5}
              color={weakestTopic.mastery < 50 ? '#f43f5e' : '#f59e0b'}
            />
          </div>
        </div>
      )}

      {/* Blunt AI Coach Nudge Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-bg-card to-bg-card border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-1.5 text-accent">
          <Sparkles size={15} />
          <span className="text-xs font-bold uppercase tracking-wider">Blunt AI Coach</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          "Don't passively reread highlighted slides. Flashcards and retrieval testing are the only things that stick for exam day."
        </p>
        <button
          onClick={() => navigate('/coach')}
          className="mt-3 text-xs font-semibold text-accent flex items-center gap-1 hover:underline"
        >
          <span>Open AI Coach</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => navigate('/shelf')}
          className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle cursor-pointer hover:border-border-medium transition-colors"
        >
          <div className="text-xl font-bold text-text-primary">{subjects.length}</div>
          <div className="text-xs text-text-secondary mt-0.5">Enrolled Subjects</div>
        </div>
        <div
          onClick={() => navigate('/library')}
          className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle cursor-pointer hover:border-border-medium transition-colors"
        >
          <div className="text-xl font-bold text-text-primary">{items.length}</div>
          <div className="text-xs text-text-secondary mt-0.5">Vault Items</div>
        </div>
      </div>
    </div>
  );
};
