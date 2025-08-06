// src/types/AppContentTypes.ts
import type { Schema } from '../amplify/data/resource';

export type DBCampaign = Schema['Campaign']['type'];
export type DBSection  = Schema['Section']['type'];
export type DBQuestion = Schema['Question']['type'];
export type DBAnswer   = Schema['Answer']['type'];

export type QuestionWithAnswers = Omit<DBQuestion, 'answers'> & {
  answers: DBAnswer[];
};

export type UISection = Pick<DBSection, 'number' | 'title' | 'educationalText'>;

