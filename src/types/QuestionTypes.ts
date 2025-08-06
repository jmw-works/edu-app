// src/types/QuestionTypes.ts
// Frontend-only question/answer shapes that align with AppContentTypes.

import type { DBAnswer, DBQuestion } from './AppContentTypes';

export type AnswerUI = Required<Pick<DBAnswer, 'id' | 'content'>> & {
  isCorrect: boolean;
};

export type QuestionUI = Omit<DBQuestion, 'answers'> & {
  answers: AnswerUI[];
};












