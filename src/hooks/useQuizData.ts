// src/hooks/useQuizData.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import type { QuestionWithAnswers } from '../types/AppContentTypes';

const client = generateClient<Schema>();

// ---- Public types (single source of truth) ----

export type QuestionUI = QuestionWithAnswers & {
  section: number;
};

export type ProgressShape = {
  id: string;
  userId: string;
  totalXP: number;
  answeredQuestions: string[];
  completedSections: number[];
  dailyStreak: number;
  lastBlazeAt: string | null;
};

// New unified object-arg signature for answering a question
export type SubmitArgs = {
  questionId: string;
  isCorrect: boolean;
  xp?: number;
};

export type HandleAnswer = (args: SubmitArgs) => void | Promise<void>;

// ---- Local helpers ----

function normalize(str: string) {
  return (str ?? '').trim().toLowerCase();
}

function startOfDay(d: Date) {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t;
}

// Helpers to coerce DB arrays (which may contain nulls) to non-null arrays for the UI
function toStringArray(a: (string | null | undefined)[] | null | undefined): string[] {
  return (a ?? []).filter((x): x is string => typeof x === 'string');
}
function toNumberArray(a: (number | null | undefined)[] | null | undefined): number[] {
  return (a ?? []).filter((n): n is number => typeof n === 'number');
}

// ---- Hook ----

export function useQuizData(userId: string) {
  const [questions, setQuestions] = useState<QuestionUI[]>([]);
  const [progress, setProgress] = useState<ProgressShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<Error | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load Questions
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await client.models.Question.list({
          selectionSet: [
            'id',
            'text',
            'section',
            'xpValue',
            'sectionRef.number',
            'answers.id',
            'answers.content',
            'answers.isCorrect',
          ],
        });

        if (cancelled) return;

        const items: QuestionUI[] = (res?.data ?? []).map((q: any) => ({
          id: q.id,
          text: q.text,
          section: (q.section ?? q.sectionRef?.number ?? 0) as number,
          xpValue: q.xpValue ?? 10,
          answers:
            (q.answers ?? []).map((a: any) => ({
              id: a.id,
              content: a.content,
              isCorrect: !!a.isCorrect,
            })) ?? [],
        }));

        if (mountedRef.current) setQuestions(items);
      } catch (e) {
        if (mountedRef.current) setErr(e as Error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load or create UserProgress
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const list = await client.models.UserProgress.list({
          filter: { userId: { eq: userId } },
          selectionSet: [
            'id',
            'userId',
            'totalXP',
            'answeredQuestions',
            'completedSections',
            'dailyStreak',
            'lastBlazeAt',
            'createdAt',
            'updatedAt',
          ],
        });

        if (cancelled) return;

        let record = (list?.data && list.data[0]) ? list.data[0] : null;

        // Create if missing
        if (!record) {
          const created = await client.models.UserProgress.create({
            userId,
            totalXP: 0,
            answeredQuestions: [],
            completedSections: [],
            dailyStreak: 0,
            lastBlazeAt: null,
          });
          if (!created.data) throw new Error('Failed to create UserProgress');
          record = created.data as any;
        }

        if (mountedRef.current && record) {
          const p: ProgressShape = {
            id: record.id as string,
            userId: record.userId as string,
            totalXP: (record.totalXP ?? 0) as number,
            answeredQuestions: toStringArray(record.answeredQuestions as any),
            completedSections: toNumberArray(record.completedSections as any),
            dailyStreak: (record.dailyStreak ?? 0) as number,
            lastBlazeAt: (record.lastBlazeAt as string | null) ?? null,
          };
          setProgress(p);
        }
      } catch (e) {
        if (mountedRef.current) setErr(e as Error);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Build quick lookup: section -> questionIds
  const sectionToIds = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const q of questions) {
      if (typeof q.section !== 'number') continue;
      const arr = map.get(q.section) ?? [];
      arr.push(q.id);
      map.set(q.section, arr);
    }
    return map;
  }, [questions]);

  // id -> question
  const byId = useMemo(() => {
    const m = new Map<string, QuestionUI>();
    questions.forEach((q) => m.set(q.id, q));
    return m;
  }, [questions]);

  // -------------------------
  // Handle Answer (new object-arg API)
  // -------------------------
  const handleAnswer: HandleAnswer = useCallback(
    async ({ questionId, isCorrect, xp }: SubmitArgs) => {
      if (!progress || !userId) return;

      // Only persist on correct answers (keeps previous behavior)
      if (!isCorrect) return;

      const alreadyAnswered = progress.answeredQuestions.includes(questionId);
      const newAnswered = alreadyAnswered
        ? progress.answeredQuestions
        : [...progress.answeredQuestions, questionId];

      const question = byId.get(questionId);
      const section = question?.section ?? null;

      let newCompletedSections = progress.completedSections;
      if (section != null) {
        const sectionQIds = sectionToIds.get(section) ?? [];
        const allInSectionAnswered = sectionQIds.every((id) => newAnswered.includes(id));
        const hasSection = newCompletedSections.includes(section);
        if (allInSectionAnswered && !hasSection) {
          newCompletedSections = [...newCompletedSections, section];
        }
      }

      // XP: do not double-award for re-answers of the same question
      const award = Number.isFinite(xp as number)
        ? (xp as number)
        : (question?.xpValue ?? 10);
      const newXP = alreadyAnswered ? progress.totalXP : (progress.totalXP ?? 0) + award;

      // --- Streak update (local calendar day) ---
      const now = new Date();
      const todayStart = startOfDay(now);
      const last = progress.lastBlazeAt ? new Date(progress.lastBlazeAt) : null;
      let newDailyStreak = progress.dailyStreak ?? 0;

      if (!last) {
        newDailyStreak = 1;
      } else {
        const lastStart = startOfDay(last);
        const diffDays = Math.floor((todayStart.getTime() - lastStart.getTime()) / 86400000);
        if (diffDays === 1) {
          newDailyStreak = Math.max(1, newDailyStreak) + 1;
        } else if (diffDays > 1) {
          newDailyStreak = 1;
        } else {
          newDailyStreak = Math.max(1, newDailyStreak);
        }
      }
      const newLastBlazeAt = now.toISOString();

      // Optimistic UI
      const optimistic: ProgressShape = {
        ...progress,
        totalXP: newXP,
        answeredQuestions: newAnswered,
        completedSections: newCompletedSections,
        dailyStreak: newDailyStreak,
        lastBlazeAt: newLastBlazeAt,
      };
      setProgress(optimistic);

      try {
        await client.models.UserProgress.update({
          id: progress.id,
          totalXP: newXP,
          answeredQuestions: newAnswered,
          completedSections: newCompletedSections,
          dailyStreak: newDailyStreak,
          lastBlazeAt: newLastBlazeAt,
        });
      } catch (e) {
        setProgress(progress); // rollback
        setErr(e as Error);
      }
    },
    [progress, userId, byId, sectionToIds]
  );

  return {
    questions,
    progress,
    loading,
    error,
    handleAnswer,
  };
}

















