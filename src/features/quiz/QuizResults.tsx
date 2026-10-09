import React from 'react';
import { ScallopRing, Button, TopAppBar } from '../../components/m3e';
import { WeakTopicCard } from '../../components/m3e/cards';
import { CheckCircle, XCircle, RotateCcw, Home } from 'lucide-react';

interface QuizResultsProps {
  correctCount: number;
  totalCount: number;
  weakTopics?: { topicName: string; subjectName?: string; mastery: number }[];
  onRetry: () => void;
  onHome: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  correctCount,
  totalCount,
  weakTopics = [],
  onRetry,
  onHome
}) => {
  const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const incorrectCount = totalCount - correctCount;

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] pb-24">
      <TopAppBar
        title="Session Complete"
        subtitle="Leitner Spaced Review Summary"
      />

      <main className="px-4 py-4 space-y-5 max-w-lg mx-auto text-center">
        <div className="flex justify-center py-2">
          <ScallopRing
            progress={percent}
            size={160}
            strokeWidth={14}
            color="var(--md-sys-color-primary)"
            trackColor="var(--md-sys-color-surface-container-high)"
            showScallopBadge={true}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">{percent}%</span>
              <span className="text-[10px] uppercase font-bold opacity-70">Accuracy</span>
            </div>
          </ScallopRing>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-center gap-1.5 text-emerald-500 font-semibold mb-1">
              <CheckCircle className="w-5 h-5" />
              <span>Correct</span>
            </div>
            <p className="text-2xl font-bold">{correctCount}</p>
          </div>

          <div className="p-4 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-center gap-1.5 text-rose-500 font-semibold mb-1">
              <XCircle className="w-5 h-5" />
              <span>Review Again</span>
            </div>
            <p className="text-2xl font-bold">{incorrectCount}</p>
          </div>
        </div>

        {weakTopics.length > 0 && (
          <div className="text-left space-y-2 pt-2">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--md-sys-color-on-surface-variant)] px-1">
              Weak Topic Recommendations
            </h3>
            {weakTopics.map((wt, idx) => (
              <WeakTopicCard
                key={idx}
                topicName={wt.topicName}
                subjectName={wt.subjectName}
                masteryPercent={wt.mastery}
                weakPointsCount={2}
              />
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="tonal"
            fullWidth
            leadingIcon={<RotateCcw className="w-4 h-4" />}
            onClick={onRetry}
          >
            Review Again
          </Button>
          <Button
            variant="filled"
            fullWidth
            leadingIcon={<Home className="w-4 h-4" />}
            onClick={onHome}
          >
            Back Home
          </Button>
        </div>
      </main>
    </div>
  );
};
