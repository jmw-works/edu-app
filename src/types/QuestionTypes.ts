import type { Schema } from '@amplify/data/resource';

export type QuestionWithAnswers = Omit<Schema['Question']['type'], 'answers' | 'difficulty'> & {
  difficulty: 'easy' | 'medium' | 'hard'; // Required and narrowed to match runtime expectation
  answers: Schema['Answer']['type'][];
};










