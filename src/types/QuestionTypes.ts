// src/types/QuestionTypes.ts
import type { Schema } from '../amplify/data/resource';

export type QuestionWithAnswers = Omit<Schema['Question']['type'], 'answers'> & {
  answers: Schema['Answer']['type'][];
};


