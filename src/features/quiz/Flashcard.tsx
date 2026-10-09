import React from 'react';
import { FlashCard as M3FlashCard } from '../../components/m3e/cards';

interface FlashcardViewProps {
  question: string;
  answer: string;
  explanation?: string;
  isFlipped: boolean;
  onFlip: () => void;
  boxLevel?: number;
  subjectName?: string;
}

export const Flashcard: React.FC<FlashcardViewProps> = ({
  question,
  answer,
  explanation,
  isFlipped,
  onFlip,
  boxLevel = 1,
  subjectName
}) => {
  return (
    <div className="w-full flex justify-center py-2">
      <M3FlashCard
        question={question}
        answer={answer}
        explanation={explanation}
        isFlipped={isFlipped}
        onFlip={onFlip}
        boxLevel={boxLevel}
        subjectName={subjectName}
      />
    </div>
  );
};
