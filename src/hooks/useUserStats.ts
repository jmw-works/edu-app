// src/hooks/useUserStats.ts
import { useEffect, useMemo, useState, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type ProgressShape = {
  id: string;
  userId: string;
  totalXP: number | null;
  answeredQuestions: (string | null)[] | null;
  completedSections: (number | null)[] | null;
  dailyStreak: number | null;
  lastBlazeAt: string | null;
  owner: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function makeDefaultProgress(userId: string): ProgressShape {
  const now = new Date().toISOString();
  return {
    id: `temp-${userId || 'unknown'}`,
    userId,
    totalXP: 0,
    answeredQuestions: [],
    completedSections: [],
    dailyStreak: 0,
    lastBlazeAt: null,
    owner: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function useUserStats(userId: string, maxXPPerLevel: number = 100) {
  const [progress, setProgress] = useState<ProgressShape>(makeDefaultProgress(userId));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (uid: string) => {
    if (!uid) {
      setProgress(makeDefaultProgress(uid));
      setLoading(false);
      return;
    }

    const res = await client.models.UserProgress.list({
      filter: { userId: { eq: uid } },
      limit: 1,
    });

    const row = res.data?.[0] ?? null;

    if (!row) {
      // Create a new baseline progress record so callers always get a non-null shape
      const createRes = await client.models.UserProgress.create({
        userId: uid,
        totalXP: 0,
        answeredQuestions: [],
        completedSections: [],
        dailyStreak: 0,
        lastBlazeAt: null,
      });
      const created = createRes.data!;
      setProgress({
        id: created.id,
        userId: created.userId,
        totalXP: created.totalXP ?? 0,
        answeredQuestions: created.answeredQuestions ?? [],
        completedSections: created.completedSections ?? [],
        dailyStreak: created.dailyStreak ?? 0,
        lastBlazeAt: (created as any).lastBlazeAt ?? null,
        owner: (created as any).owner ?? null,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      });
      return;
    }

    setProgress({
      id: row.id,
      userId: row.userId,
      totalXP: row.totalXP ?? 0,
      answeredQuestions: row.answeredQuestions ?? [],
      completedSections: row.completedSections ?? [],
      dailyStreak: row.dailyStreak ?? 0,
      lastBlazeAt: (row as any).lastBlazeAt ?? null,
      owner: (row as any).owner ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await load(userId);
      } catch (e) {
        if (alive) setError(e as Error);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId, load]);

  const stats = useMemo(() => {
    const totalXP = progress.totalXP ?? 0;
    const level = Math.max(1, Math.floor(totalXP / maxXPPerLevel) + 1);
    const levelBaseXP = (level - 1) * maxXPPerLevel;
    const xpIntoLevel = Math.max(0, totalXP - levelBaseXP);
    const percentage = Math.min(100, Math.round((xpIntoLevel / maxXPPerLevel) * 100));

    const completedSectionsCount = (progress.completedSections ?? []).filter(
      (n): n is number => typeof n === 'number'
    ).length;

    return {
      totalXP,
      level,
      xpIntoLevel,
      maxXPPerLevel,
      percentage,
      completedSectionsCount,
      dailyStreak: progress.dailyStreak ?? 0,
      lastBlazeAt: progress.lastBlazeAt ?? null,
    };
  }, [progress, maxXPPerLevel]);

  return {
    progress,  // never null
    stats,
    loading,
    error,
    refresh: () => load(userId),
  };
}



