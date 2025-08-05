// src/hooks/useQuizData.ts
import { useEffect, useMemo, useState, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type AnswerUI = {
  id: string;
  content: string;
  isCorrect: boolean;
  questionId: string;
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
  totalXP: number | null;
  answeredQuestions: string[] | null;
};

type State<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export function useQuizData(userId: string) {
  const [questionsState, setQuestionsState] = useState<State<QuestionUI[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const [progressState, setProgressState] = useState<State<ProgressShape>>({
    data: null,
    loading: true,
    error: null,
  });

  // 1) Load Questions with Answers (flatten to UI shape)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qRes = await client.models.Question.list({
          // selectionSet ensures answers come back populated in v6
          selectionSet: [
            'id',
            'text',
            'section',
            'xpValue',
            'answers.id',
            'answers.content',
            'answers.isCorrect',
            'answers.questionId',
          ],
        });

        const ui: QuestionUI[] =
          qRes.data?.map((q) => ({
            id: q.id,
            text: q.text,
            section: q.section,
            xpValue: q.xpValue ?? 10,
            answers:
              (Array.isArray((q as any).answers) ? (q as any).answers : [])?.map((a: any) => ({
                id: a.id,
                content: a.content,
                isCorrect: !!a.isCorrect,
                questionId: a.questionId,
              })) ?? [],
          })) ?? [];

        if (!cancelled) {
          setQuestionsState({ data: ui, loading: false, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setQuestionsState({ data: null, loading: false, error: e as Error });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Load or create UserProgress
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        // Try to find existing progress for this user
        const list = await client.models.UserProgress.list({
          filter: { userId: { eq: userId } },
        });

        let progress = list.data?.[0] ?? null;

        // Create if missing
        if (!progress) {
          const created = await client.models.UserProgress.create({
            userId,
            totalXP: 0,
            answeredQuestions: [],
          });
          progress = created.data!;
        }

        if (!cancelled) {
          setProgressState({
            data: {
              id: progress.id,
              userId: progress.userId,
              totalXP: progress.totalXP ?? 0,
              answeredQuestions: (progress.answeredQuestions as string[]) ?? [],
            },
            loading: false,
            error: null,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setProgressState({ data: null, loading: false, error: e as Error });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 3) Handle Answer (optimistic + persist)
  const handleAnswer = useCallback(
    async (args: { questionId: string; isCorrect: boolean; xp?: number }) => {
      const { questionId, isCorrect, xp = 0 } = args;
      if (!isCorrect) return;
      if (!progressState.data) return; // not ready yet

      const prev = progressState.data;
      const already = (prev.answeredQuestions ?? []).includes(questionId);
      const newAnswered = already
        ? prev.answeredQuestions ?? []
        : [...(prev.answeredQuestions ?? []), questionId];
      const newXP = prev.totalXP! + (already ? 0 : xp);

      // Optimistic UI update
      setProgressState((s) =>
        s.data
          ? {
              ...s,
              data: {
                ...s.data,
                totalXP: newXP,
                answeredQuestions: newAnswered,
              },
            }
          : s
      );

      // Persist in background
      try {
        await client.models.UserProgress.update({
          id: prev.id,
          userId: prev.userId,
          totalXP: newXP,
          answeredQuestions: newAnswered,
        });
      } catch (e) {
        // Soft-rollback: refetch (keeps code simple and resilient)
        try {
          const fresh = await client.models.UserProgress.get({ id: prev.id });
          if (fresh.data) {
            setProgressState((s) => ({
              ...s,
              data: {
                id: fresh.data!.id,
                userId: fresh.data!.userId,
                totalXP: fresh.data!.totalXP ?? 0,
                answeredQuestions: (fresh.data!.answeredQuestions as string[]) ?? [],
              },
              loading: false,
              error: null,
            }));
          }
        } catch (inner) {
          setProgressState((s) => ({ ...s, error: (e as Error) ?? (inner as Error) }));
        }
      }
    },
    [progressState.data]
  );

  // Public shape
  return {
    questions: questionsState.data ?? [],
    progress: progressState.data ?? {
      id: '',
      userId,
      totalXP: 0,
      answeredQuestions: [],
    },
    loading: questionsState.loading || progressState.loading,
    error: questionsState.error ?? progressState.error ?? null,
    handleAnswer,
  };
}








