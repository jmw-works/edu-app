// src/components/QuizSection.tsx
import { useCallback } from 'react';
import { QuestionComponent } from './QuestionComponent';
import { AccordionSection } from './AccordionSection';
import type { QuestionUI, ProgressShape } from '../hooks/useQuizData';

export type SubmitArgs = {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  xp: number;
  isCorrect: boolean;
};

interface QuizSectionProps {
  title: string;
  questions: QuestionUI[];
  progress: ProgressShape;
  /** Standardize on object-style handler to match parent usage */
  handleAnswer: (args: SubmitArgs) => void | Promise<void>;
  isLocked: boolean;
  initialOpen: boolean;
  educationalText: string;
  sectionNumber: number; // retained for compatibility
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
  // Adapter: receives positional args from QuestionComponent, forwards object to parent
  const forwardAnswer = useCallback(
    (
      questionId: string,
      userAnswer: string,
      correctAnswer: string,
      xpValue: number
    ) => {
      const isCorrect =
        (userAnswer ?? '').trim().toLowerCase() ===
        (correctAnswer ?? '').trim().toLowerCase();

      return handleAnswer({
        questionId,
        userAnswer,
        correctAnswer,
        xp: xpValue ?? 0,
        isCorrect,
      });
    },
    [handleAnswer]
  );

  return (
    <AccordionSection
      title={title}
      isLocked={isLocked}
      initialOpen={initialOpen}
      educationalText={educationalText}
    >
      {questions.map((question) => (
        <QuestionComponent
          key={question.id}
          question={question}
          onSubmit={forwardAnswer}
          isAnswered={
            Array.isArray(progress?.answeredQuestions)
              ? progress.answeredQuestions.includes(question.id)
              : false
          }
        />
      ))}
    </AccordionSection>
  );
}











