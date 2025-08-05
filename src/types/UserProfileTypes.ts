// src/types/UserProfileTypes.ts
export type UserProfile = {
  id: string;
  userId: string;
  email: string;
  displayName?: string; // Make optional (can be undefined if not set)
  owner?: string | null;
  createdAt: string;
  updatedAt: string;
};


