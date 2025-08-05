// src/types/UserProfileTypes.ts

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string | null;
  email?: string | null;
  owner?: string | null;
  createdAt: string;
  updatedAt: string;
}

