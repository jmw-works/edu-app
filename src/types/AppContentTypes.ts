// src/types/AppContentTypes.ts
// Frontend-only type definitions that mirror just the fields the UI uses.
// Avoids importing backend constructs (Amplify Gen2 best practice).

export type DBAnswer = {
  id: string;
  content: string;
  isCorrect?: boolean | null;
};

export type DBQuestion = {
  id: string;
  text: string;
  section: number;
  xpValue?: number | null;
  answers?: DBAnswer[] | null;
};

export type DBSection = {
  id: string;
  number: number;
  title: string;
  educationalText?: string | null;
};

export type DBCampaign = {
  id: string;
  title: string;
  description?: string | null;
  order?: number | null;
  isActive?: boolean | null;
  // Thumbnails
  thumbnailKey?: string | null;
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
};

// Helpers used by UI code
export type QuestionWithAnswers = Omit<DBQuestion, 'answers'> & {
  answers: DBAnswer[];
};

export type UISection = Pick<DBSection, 'number' | 'title' | 'educationalText'>;




