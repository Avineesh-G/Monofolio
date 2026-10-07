import React from 'react';
import { Brain } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';

export const QuizScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col px-5 pt-6 pb-20 overflow-y-auto scroll-container">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Revision & Quizzes</h1>
        <p className="text-xs text-text-secondary">Spaced repetition Leitner flashcard system</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Brain}
          title="No Flashcards Due Today"
          description="Generate flashcards from your study materials to reinforce high-yield exam concepts."
          actionLabel="View Library"
          onAction={() => navigate('/library')}
        />
      </div>
    </div>
  );
};
