export type UserProgress = {
  id: string;
  userId: string;
  totalXP?: number | null;
  answeredQuestions?: (string | null)[] | null;
  owner?: string | null;
  createdAt: string;
  updatedAt: string;
};



