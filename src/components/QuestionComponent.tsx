import { useState, useLayoutEffect, useRef } from 'react';
import type { Schema } from '../../amplify/data/resource'; // Adjust path as needed

type QuestionWithAnswers = Omit<Schema['Question']['type'], 'answers'> & {
  answers: Schema['Answer']['type'][];
};

interface Props {
  question: QuestionWithAnswers;
  onSubmit: (
    questionId: string,
    userAnswer: string,
    correctAnswer: string,
    xpValue: number
  ) => void;
  isAnswered: boolean;
}

export function QuestionComponent({ question, onSubmit, isAnswered }: Props) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isIncorrect, setIsIncorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const correctAnswer = question.answers.find((ans) => ans.isCorrect)?.content?.trim() || '';
  const parts = correctAnswer.split(/\s+/);
  const lengths = parts.map((part) => part.length);
  const placeholderChar = '-';

  const buildDisplay = (typed: string) => {
    let s = '';
    let pos = 0;
    for (let i = 0; i < lengths.length; i++) {
      const l = lengths[i];
      s += typed.substring(pos, pos + l);
      s += placeholderChar.repeat(Math.max(0, l - (typed.length - pos)));
      pos += l;
      if (i < lengths.length - 1) s += ' ';
    }
    return s;
  };

  const buildFull = (typed: string) => {
    let s = '';
    let pos = 0;
    for (let i = 0; i < lengths.length; i++) {
      const l = lengths[i];
      s += typed.substring(pos, pos + l);
      pos += l;
      if (i < lengths.length - 1) s += ' ';
    }
    return s;
  };

  const getCursorPosition = (letters: number) => {
    let pos = 0;
    let remaining = letters;
    for (let i = 0; i < lengths.length; i++) {
      const l = lengths[i];
      const to_place = Math.min(l, remaining);
      pos += to_place;
      remaining -= to_place;
      if (remaining > 0 && i < lengths.length - 1) pos += 1;
    }
    return pos;
  };

  useLayoutEffect(() => {
    if (inputRef.current) {
      const cursorPos = getCursorPosition(userAnswer.length);
      inputRef.current.selectionStart = cursorPos;
      inputRef.current.selectionEnd = cursorPos;
    }
  }, [userAnswer]);

  useLayoutEffect(() => {
    if (isIncorrect) {
      setUserAnswer('');
    }
  }, [isIncorrect]);

  const handleSubmit = () => {
    const fullUserAnswer = buildFull(userAnswer);
    if (!fullUserAnswer) return;

    const userNormalized = fullUserAnswer.trim().toLowerCase();
    const correctNormalized = correctAnswer.trim().toLowerCase();

    if (userNormalized === correctNormalized) {
      onSubmit(question.id, correctAnswer, correctAnswer, question.xpValue ?? 10);
      setIsIncorrect(false);
    } else {
      setIsIncorrect(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = e.target.value.replace(/[- ]/g, '');
    setUserAnswer(cleanedValue);
    if (isIncorrect) setIsIncorrect(false);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (userAnswer === '') {
      e.target.setSelectionRange(0, 0);
    }
  };

  const displayValue = isAnswered ? correctAnswer : buildDisplay(userAnswer);

  return (
    <div className="question-item">
      <p>{question.text}</p>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        disabled={isAnswered}
        style={{
          padding: '0.5rem',
          fontSize: '1rem',
          color: isAnswered ? '#888' : '#000',
          backgroundColor: isAnswered ? '#f5f5f5' : '#fff',
          border: '1px solid #ccc',
          fontFamily: 'monospace',
          marginRight: '1rem',
          width: '100%',
          maxWidth: '500px',
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={isAnswered || !userAnswer.trim()}
      >
        {isAnswered ? 'Correct!' : 'Submit'}
      </button>
      {isIncorrect && <p style={{ color: 'red' }}>Wrong!</p>}
    </div>
  );
}


