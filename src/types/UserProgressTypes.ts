// src/types/UserProgressTypes.ts
export type UserProgress = {
  id: string;
  userId: string;
  totalXP?: number | null;
  answeredQuestions?: (string | null)[] | null;
  displayName?: string | null; // <- Add this line!
  owner?: string | null;
  createdAt: string;
  updatedAt: string;
};





