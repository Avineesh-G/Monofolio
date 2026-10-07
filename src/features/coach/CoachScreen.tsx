import React from 'react';
import { Bot } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';

export const CoachScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col px-5 pt-6 pb-20 overflow-y-auto scroll-container">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">AI Coach</h1>
        <p className="text-xs text-text-secondary">Direct, exam-focused document analysis without fluff</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Bot}
          title="Select a Document to Analyze"
          description="Pick any lecture PDF from your Vault or Library to generate key concept rankings, weak spots, and an exam plan."
          actionLabel="Browse Vault Library"
          onAction={() => navigate('/library')}
        />
      </div>
    </div>
  );
};
