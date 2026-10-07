import React from 'react';
import { ProgressRing } from '../../components/ProgressRing';
import { 
  Trophy, 
  RotateCcw, 
  AlertTriangle, 
  ArrowRight 
} from 'lucide-react';
import type { Topic } from '../../db/schema';

interface QuizResultsProps {
  totalAnswered: number;
  correctCount: number;
  incorrectCount: number;
  weakTopics: Topic[];
  onRestart: () => void;
  onDone: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  totalAnswered,
  correctCount,
  incorrectCount,
  weakTopics,
  onRestart,
  onDone,
}) => {
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
      {/* Trophy / Score Banner */}
      <div className="w-full p-6 rounded-3xl bg-bg-elevated border border-border-medium shadow-2xl flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent/20 text-accent flex items-center justify-center mb-3">
          <Trophy size={28} />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Revision Session Complete!</h2>
        <p className="text-xs text-text-secondary mt-0.5 mb-4">Leitner schedule & mastery metrics updated</p>

        <div className="flex items-center justify-around w-full pt-3 border-t border-border-subtle">
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-400">{correctCount}</div>
            <div className="text-[10px] font-semibold text-text-muted uppercase">Advanced</div>
          </div>

          <div className="text-center">
            <ProgressRing progress={accuracy} size={48} strokeWidth={4.5} />
            <div className="text-[10px] font-semibold text-text-muted uppercase mt-1">Accuracy</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-black text-rose-400">{incorrectCount}</div>
            <div className="text-[10px] font-semibold text-text-muted uppercase">Box 0 Reset</div>
          </div>
        </div>
      </div>

      {/* Weak-Topic Heatmap */}
      {weakTopics.length > 0 && (
        <div className="w-full p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <AlertTriangle size={14} />
            <span>Weak-Topic Heatmap</span>
          </div>

          <div className="space-y-2">
            {weakTopics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border-subtle"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-semibold text-text-primary truncate">{topic.name}</h4>
                  <p className="text-[10px] text-rose-400 mt-0.5">High priority for revision</p>
                </div>
                <ProgressRing
                  progress={topic.mastery}
                  size={32}
                  strokeWidth={3}
                  color={topic.mastery < 50 ? '#f43f5e' : '#f59e0b'}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full flex items-center gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-border-subtle text-xs font-semibold text-text-primary flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <RotateCcw size={14} />
          <span>Review Again</span>
        </button>

        <button
          onClick={onDone}
          className="flex-1 py-3 rounded-2xl bg-accent text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all"
        >
          <span>Vault Home</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
