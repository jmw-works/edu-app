// src/components/QuizSection.tsx
import { useState, useMemo } from 'react';
import QuestionComponent from './QuestionComponent';
import type { Question, HandleAnswer } from '../types/QuestionTypes';

type ProgressLite = {
  answeredQuestions: string[];
};

interface QuizSectionProps {
  title: string;
  educationalText?: string;
  questions: Question[]; // answers required
  progress: ProgressLite;
  handleAnswer: HandleAnswer;
  isLocked?: boolean;
  initialOpen?: boolean;
}

export function QuizSection({
  title,
  educationalText = '',
  questions,
  progress,
  handleAnswer,
  isLocked = false,
  initialOpen = false,
}: QuizSectionProps) {
  const [open, setOpen] = useState(initialOpen && !isLocked);

  const answeredSet = useMemo(
    () => new Set(progress?.answeredQuestions ?? []),
    [progress?.answeredQuestions]
  );

  return (
    <section
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        background: '#fff',
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <header
        onClick={() => !isLocked && setOpen((v) => !v)}
        style={{
          cursor: isLocked ? 'not-allowed' : 'pointer',
          background: isLocked ? '#f9fafb' : '#f3f4f6',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <strong style={{ flex: 1 }}>{title}</strong>
        {isLocked ? <span>🔒</span> : <span>{open ? '▾' : '▸'}</span>}
      </header>

      {!isLocked && open && (
        <div style={{ padding: '12px 16px' }}>
          {educationalText && (
            <p style={{ marginTop: 0, marginBottom: 12, color: '#4b5563' }}>
              {educationalText}
            </p>
          )}

          {questions.length === 0 ? (
            <div style={{ color: '#6b7280' }}>No questions in this section yet.</div>
          ) : (
            questions.map((q) => (
              <QuestionComponent
                key={q.id}
                question={q}
                isAnswered={answeredSet.has(q.id)}
                onSubmit={handleAnswer}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

export default QuizSection;































