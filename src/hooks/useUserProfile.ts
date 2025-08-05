// src/hooks/useUserProfile.ts
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import type { UserProfile } from '../types/UserProfileTypes'; // update path as needed

const client = generateClient<Schema>();

export function useUserProfile(userId: string, email: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function fetchUserProfile() {
    setLoading(true);
    setError(null);
    try {
      const { data, errors } = await client.models.UserProfile.list({
        filter: { userId: { eq: userId } },
      });

      if (errors) {
        setError('Failed to fetch user profile');
        setLoading(false);
        return;
      }

      let userProfile = Array.isArray(data) ? data[0] : data;

      if (!userProfile && email) {
        // Create profile if not exists
        const { data: created, errors: createErrors } = await client.models.UserProfile.create({
          userId,
          email,
          displayName: undefined,
        });
        if (createErrors) {
          setError('Failed to create user profile');
          setLoading(false);
          return;
        }
        userProfile = Array.isArray(created) ? created[0] : created;
      }

      setProfile(userProfile as UserProfile);
      setLoading(false);
    } catch (err) {
      setError('Error fetching profile');
      setLoading(false);
    }
  }

  async function updateDisplayName(newName: string) {
    if (!profile) return;
    try {
      const { data, errors } = await client.models.UserProfile.update({
        id: profile.id,
        displayName: newName,
      });
      if (errors) throw new Error('Failed to update name');
      setProfile(prev => prev ? { ...prev, displayName: newName } : prev);
    } catch (err) {
      setError('Could not update name');
    }
  }

  return {
    profile,
    loading,
    error,
    updateDisplayName,
    refetch: fetchUserProfile,
  };
}






