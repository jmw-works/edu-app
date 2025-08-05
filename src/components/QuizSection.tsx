import { QuestionComponent } from './QuestionComponent';
import { AccordionSection } from './AccordionSection';
import type { QuestionWithAnswers } from '../types/QuestionTypes';
import type { UserProgress } from '../types/UserProgressTypes';

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
  sectionNumber: number; // ✅ Added this to fix the TS error
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
      isLocked={isLocked}
      initialOpen={initialOpen}
      educationalText={educationalText}
    >
      {questions.map((question) => (
        <QuestionComponent
          key={question.id}
          question={question}
          onSubmit={handleAnswer}
          isAnswered={progress.answeredQuestions?.includes(question.id) || false}
        />
      ))}
    </AccordionSection>
  );
}






