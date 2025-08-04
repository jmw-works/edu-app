import type { Schema } from '../amplify/data/resource';

export type QuestionWithAnswers = Omit<Schema['Question']['type'], 'answers'> & {
  // Override/extend the difficulty to allow null (to match Amplify-generated types)
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  answers: Schema['Answer']['type'][];
};









