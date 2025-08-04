// src/components/QuizSection.tsx
import { QuestionComponent } from './QuestionComponent';
import { AccordionSection } from './AccordionSection';
import type { QuestionWithAnswers } from '../types/QuestionTypes';

interface UserProgress {
  id: string;
  userId: string;
  totalXP?: number | null;
  answeredQuestions?: (string | null)[] | null;
}

interface QuizSectionProps {
  title: string;
  questions: QuestionWithAnswers[];
  progress: UserProgress;
  handleAnswer: (
    questionId: string,
    userAnswer: string,
    correctAnswer: string,
    xpValue: number
  ) => void;
  isLocked: boolean;
  initialOpen: boolean;
  educationalText: string;
}

export function QuizSection({
  title,
  questions,
  progress,
  handleAnswer,
  isLocked,
  initialOpen,
  educationalText,
}: QuizSectionProps) {
  return (
    <AccordionSection
      title={title}
      educationalText={educationalText}
      isLocked={isLocked}
      initialOpen={initialOpen}
    >
      {questions.map((q) => (
        <QuestionComponent
          key={q.id}
          question={q}
          onSubmit={handleAnswer}
          isAnswered={progress?.answeredQuestions?.includes(q.id) ?? false}
        />
      ))}
    </AccordionSection>
  );
}



