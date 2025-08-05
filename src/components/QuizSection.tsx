import { QuestionComponent } from './QuestionComponent';
import { AccordionSection } from './AccordionSection';
import type { QuestionUI, ProgressShape } from '../hooks/useQuizData';

interface QuizSectionProps {
  title: string;
  questions: QuestionUI[];
  progress: ProgressShape;
  handleAnswer: (args: {
    questionId: string;
    isCorrect: boolean;
    xp?: number;
  }) => void | Promise<void>;
  isLocked: boolean;
  initialOpen: boolean;
  educationalText: string;
  sectionNumber: number; // kept for compatibility
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
          onSubmit={(questionId, _userAnswer, _correctAnswer, xpValue) => {
            // QuestionComponent only calls onSubmit when the user is correct.
            // So we can safely mark isCorrect = true here.
            handleAnswer({
              questionId,
              isCorrect: true,
              xp: xpValue ?? 0,
            });
          }}
          isAnswered={progress?.answeredQuestions?.includes(question.id) || false}
        />
      ))}
    </AccordionSection>
  );
}








