// src/hooks/useUserProfile.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource'; // <- make sure this path is correct

type UserProfileModel = Schema['UserProfile']['type'];

const client = generateClient<Schema>(); // <- typed client; exposes client.models.UserProfile

export function useUserProfile(userId?: string, email?: string | null) {
  const [profile, setProfile] = useState<UserProfileModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const hasIdentity = Boolean(userId);

  useEffect(() => {
    if (!hasIdentity) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.models.UserProfile.list({
          filter: { userId: { eq: userId! } },
        });
        const first = (res?.data ?? [])[0] ?? null;
        if (!cancelled) setProfile(first);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasIdentity, userId]);

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      if (!hasIdentity) return;
      setLoading(true);
      setError(null);
      try {
        if (profile?.id) {
          // Update existing profile
          const updated = await client.models.UserProfile.update({
            id: profile.id,
            displayName,
          });
          setProfile((updated as any)?.data ?? updated ?? profile);
        } else {
          // Create first-time profile
          const created = await client.models.UserProfile.create({
            userId: userId!,                 // required by your schema
            email: (email ?? null) as any,   // many schemas use Nullable<string>
            displayName,
          });
          setProfile((created as any)?.data ?? created ?? null);
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    [profile?.id, hasIdentity, userId, email]
  );

  return useMemo(
    () => ({ profile, loading, error, updateDisplayName }),
    [profile, loading, error, updateDisplayName]
  );
}















