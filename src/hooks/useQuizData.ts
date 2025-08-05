// src/hooks/useQuizData.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

/** UI-friendly types for components */
export type AnswerUI = {
  id: string;
  content: string;
  isCorrect: boolean;
};

export type QuestionUI = {
  id: string;
  text: string;
  section: number;
  xpValue?: number | null;
  answers: AnswerUI[];
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

function normalize(str: string) {
  return (str ?? '').trim().toLowerCase();
}

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

  // -------------------------
  // Load Questions
  // -------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await client.models.Question.list({
          // ✅ Use dot-path selectionSet, not nested objects
          selectionSet: [
            'id',
            'text',
            'section',
            'xpValue',
            'answers.id',
            'answers.content',
            'answers.isCorrect',
          ],
        });

        if (cancelled) return;

        const items: QuestionUI[] = (res?.data ?? []).map((q: any) => ({
          id: q.id,
          text: q.text,
          section: q.section,
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

  // -------------------------
  // Load or create UserProgress
  // -------------------------
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

        // ✅ Clean branch: create if missing, then ensure non-null
        if (!record) {
          const created = await client.models.UserProgress.create({
            userId,
            totalXP: 0,
            answeredQuestions: [],
            completedSections: [],
            dailyStreak: 0,
            lastBlazeAt: null,
          });
          if (!created.data) {
            throw new Error('Failed to create UserProgress');
          }
          record = created.data as any;
        }

        if (mountedRef.current && record) {
          const p: ProgressShape = {
            id: record.id as string,
            userId: record.userId as string,
            totalXP: (record.totalXP ?? 0) as number,
            answeredQuestions: (record.answeredQuestions ?? []) as string[],
            completedSections: (record.completedSections ?? []) as number[],
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
  // Handle Answer
  // -------------------------
  const handleAnswer = useCallback(
    async (
      questionId: string,
      userAnswer: string,
      correctAnswer: string,
      xpValue: number
    ) => {
      if (!progress || !userId) return;

      const isCorrect = normalize(userAnswer) === normalize(correctAnswer);
      if (!isCorrect) return; // UI shows "Wrong!" — no persistence

      const alreadyAnswered = progress.answeredQuestions.includes(questionId);
      const newAnswered = alreadyAnswered
        ? progress.answeredQuestions
        : [...progress.answeredQuestions, questionId];

      const question = byId.get(questionId);
      const section = question?.section ?? null;

      let newCompletedSections = progress.completedSections;
      if (section != null) {
        const sectionQIds = sectionToIds.get(section) ?? [];
        const allInSectionAnswered = sectionQIds.every((id) =>
          newAnswered.includes(id)
        );
        const hasSection = newCompletedSections.includes(section);
        if (allInSectionAnswered && !hasSection) {
          newCompletedSections = [...newCompletedSections, section];
        }
      }

      const newXP = alreadyAnswered
        ? progress.totalXP
        : (progress.totalXP ?? 0) + (xpValue ?? 10);

      // Optimistic UI
      const optimistic: ProgressShape = {
        ...progress,
        totalXP: newXP,
        answeredQuestions: newAnswered,
        completedSections: newCompletedSections,
      };
      setProgress(optimistic);

      try {
        await client.models.UserProgress.update({
          id: progress.id,
          totalXP: newXP,
          answeredQuestions: newAnswered,
          completedSections: newCompletedSections,
        });
      } catch (e) {
        // Roll back on failure
        setProgress(progress);
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










