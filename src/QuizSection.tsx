// src/QuizSection.tsx
import { QuestionComponent } from './QuestionComponent';
import { AccordionSection } from './AccordionSection';
import type { Schema } from '../amplify/data/resource';

type QuestionWithAnswers = Omit<Schema['Question']['type'], 'answers'> & {
  answers: Schema['Answer']['type'][];
};

interface QuizSectionProps {
  title: string;
  sectionNumber: number;
  questions: QuestionWithAnswers[]; // Filtered questions for this section
  progress: Schema['UserProgress']['type'];
  handleAnswer: (
    questionId: string,
    userAnswer: string,
    correctAnswer: string,
    xpValue: number
  ) => void;
  isLocked: boolean; // Passed from parent based on previous section completion
  initialOpen: boolean; // Control starting state
  educationalText: string; // New prop for prep reading (could be JSX if needed)
}

export function QuizSection({
  title,
  sectionNumber,
  questions,
  progress,
  handleAnswer,
  isLocked,
  initialOpen,
  educationalText,
}: QuizSectionProps) {
  return (
    <AccordionSection title={title} isLocked={isLocked} initialOpen={initialOpen}>
      {/* Render educational text first */}
      <div className="educational-reading" style={{ marginBottom: '1rem' }}>
        <p>{educationalText}</p> {/* Style as needed, e.g., add CSS for formatting */}
      </div>
      {questions.map((q) => (
        <QuestionComponent
          key={q.id}
          question={q}
          onSubmit={handleAnswer}
          isAnswered={progress.answeredQuestions?.includes(q.id) || false}
        />
      ))}
    </AccordionSection>
  );
}
