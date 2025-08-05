// src/types/QuestionTypes.ts

// Make sure this path matches your local codegen output!
// If the file below does not exist, run: npx ampx codegen
import type { Schema } from '../amplify/data/resource';

export type QuestionWithAnswers = Omit<Schema['Question']['type'], 'answers'> & {
  answers: Schema['Answer']['type'][];
};










