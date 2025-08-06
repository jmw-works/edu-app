// src/hooks/useCampaignQuizData.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAmplifyClient } from './useAmplifyClient';
import type {
  Question as QuestionUI,
  HandleAnswer,
  SubmitArgs,
} from '../types/QuestionTypes';

type ProgressShape = {
  id: string;
  userId: string;
  totalXP: number;
  answeredQuestions: string[];
  completedSections: number[];
  dailyStreak: number;
  lastBlazeAt: string | null;
};

function startOfDay(d: Date) { const t = new Date(d); t.setHours(0, 0, 0, 0); return t; }
function toStringArray(a: (string | null | undefined)[] | null | undefined): string[] {
  return (a ?? []).filter((x): x is string => typeof x === 'string');
}

function buildOrIdFilter(fieldName: 'sectionId' | 'campaignId', ids: string[]) {
  if (ids.length === 0) return undefined;
  if (ids.length === 1) return { [fieldName]: { eq: ids[0] } } as any;
  return { or: ids.map((id) => ({ [fieldName]: { eq: id } })) } as any;
}

export function useCampaignQuizData(userId: string, activeCampaignId?: string | null) {
  const client = useAmplifyClient();
  const [questions, setQuestions] = useState<QuestionUI[]>([]);
  const [progressBase, setProgressBase] = useState<Omit<ProgressShape, 'completedSections'> | null>(null);
  const [completedSectionNumbers, setCompletedSectionNumbers] = useState<number[]>([]);
  const [orderedSectionNumbers, setOrderedSectionNumbers] = useState<number[]>([]);
  const [sectionIdByNumber, setSectionIdByNumber] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<Error | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadContentForCampaign(campaignId: string) {
      setLoading(true);
      setErr(null);
      try {
        const sRes = await client.models.Section.list({
          filter: { campaignId: { eq: campaignId } },
          selectionSet: ['id', 'number', 'order', 'isActive'],
        });

        const sections = (sRes.data ?? [])
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order ?? a.number ?? 0) - (b.order ?? b.number ?? 0));

        const numToId = new Map<number, string>();
        const orderedNums: number[] = [];
        for (const s of sections) {
          const n = (s.number ?? 0) as number;
          numToId.set(n, s.id);
          orderedNums.push(n);
        }
        if (cancelled) return;
        setSectionIdByNumber(numToId);
        setOrderedSectionNumbers(orderedNums);

        const sectionIds = sections.map((s) => s.id);
        if (sectionIds.length === 0) {
          if (!cancelled) {
            setQuestions([]);
            setCompletedSectionNumbers([]);
          }
          return;
        }

        const qFilter = buildOrIdFilter('sectionId', sectionIds);
        const qRes = await client.models.Question.list({
          ...(qFilter ? { filter: qFilter } : {}),
          selectionSet: [
            'id', 'text', 'section', 'xpValue', 'sectionRef.number',
            'answers.id', 'answers.content', 'answers.isCorrect',
          ],
        });

        const qs: QuestionUI[] = (qRes.data ?? []).map((q: any) => ({
          id: q.id,
          text: q.text,
          section: (q.section ?? q.sectionRef?.number ?? 0) as number,
          xpValue: q.xpValue ?? 10,
          answers: (q.answers ?? []).map((a: any) => ({
            id: a.id,
            content: a.content,
            isCorrect: !!a.isCorrect,
          })),
        }));
        if (!cancelled) setQuestions(qs);

        const spBaseFilter = buildOrIdFilter('sectionId', sectionIds);
        const spRes = await client.models.SectionProgress.list({
          filter: spBaseFilter ? { and: [{ userId: { eq: userId } }, spBaseFilter] } : { userId: { eq: userId } },
          selectionSet: ['sectionId', 'completed'],
        });

        const doneNumbers: number[] = [];
        for (const row of spRes.data ?? []) {
          if (row.completed) {
            const entry = [...numToId.entries()].find(([, id]) => id === row.sectionId);
            if (entry) doneNumbers.push(entry[0]);
          }
        }
        if (!cancelled) setCompletedSectionNumbers(doneNumbers);
      } catch (e) {
        if (!cancelled) setErr(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!activeCampaignId) {
      setQuestions([]);
      setCompletedSectionNumbers([]);
      setOrderedSectionNumbers([]);
      setSectionIdByNumber(new Map());
      setLoading(false);
      return;
    }

    loadContentForCampaign(activeCampaignId);
    return () => { cancelled = true; };
  }, [activeCampaignId, userId, client]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function loadProgress() {
      setLoading(true);
      setErr(null);
      try {
        const list = await client.models.UserProgress.list({
          filter: { userId: { eq: userId } },
          selectionSet: ['id', 'userId', 'totalXP', 'answeredQuestions', 'dailyStreak', 'lastBlazeAt'],
        });

        let row = list.data?.[0] ?? null;
        if (!row) {
          const created = await client.models.UserProgress.create({
            userId,
            totalXP: 0,
            answeredQuestions: [],
            dailyStreak: 0,
            lastBlazeAt: null,
          });
          row = created.data!;
        }

        if (mountedRef.current && row) {
          setProgressBase({
            id: row.id,
            userId: row.userId,
            totalXP: row.totalXP ?? 0,
            answeredQuestions: toStringArray(row.answeredQuestions as any),
            dailyStreak: row.dailyStreak ?? 0,
            lastBlazeAt: (row.lastBlazeAt as string | null) ?? null,
          });
        }
      } catch (e) {
        if (mountedRef.current) setErr(e as Error);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    loadProgress();
    return () => { cancelled = true; };
  }, [userId, client]);

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

  const byId = useMemo(() => {
    const m = new Map<string, QuestionUI>();
    questions.forEach((q) => m.set(q.id, q));
    return m;
  }, [questions]);

  const pushCompletedSection = useCallback((n: number) => {
    setCompletedSectionNumbers((prev) => (prev.includes(n) ? prev : [...prev, n]));
  }, []);

  const handleAnswer: HandleAnswer = useCallback(async ({ questionId, isCorrect, xp }: SubmitArgs) => {
    if (!progressBase || !userId) return;
    if (!isCorrect) return;

    const alreadyAnswered = progressBase.answeredQuestions.includes(questionId);
    const newAnswered = alreadyAnswered ? progressBase.answeredQuestions : [...progressBase.answeredQuestions, questionId];

    const question = byId.get(questionId);
    const sectionNum = question?.section ?? null;

    if (sectionNum != null) {
      const qIds = sectionToIds.get(sectionNum) ?? [];
      const allAnswered = qIds.every((id) => newAnswered.includes(id));

      const sectionId = sectionIdByNumber.get(sectionNum);
      if (sectionId) {
        const list = await client.models.SectionProgress.list({
          filter: { and: [{ userId: { eq: userId } }, { sectionId: { eq: sectionId } }] },
          selectionSet: ['id', 'completed'],
        });
        const row = list.data?.[0] ?? null;
        if (row) {
          if (row.completed !== allAnswered) {
            await client.models.SectionProgress.update({ id: row.id, completed: allAnswered });
          }
        } else {
          await client.models.SectionProgress.create({ userId, sectionId, completed: allAnswered });
        }
      }
      if (allAnswered) pushCompletedSection(sectionNum);
    }

    const award = Number.isFinite(xp as number) ? (xp as number) : (question?.xpValue ?? 10);
    const newXP = alreadyAnswered ? progressBase.totalXP : (progressBase.totalXP ?? 0) + award;

    const now = new Date();
    const todayStart = startOfDay(now);
    const last = progressBase.lastBlazeAt ? new Date(progressBase.lastBlazeAt) : null;
    let newDailyStreak = progressBase.dailyStreak ?? 0;
    if (!last) newDailyStreak = 1;
    else {
      const lastStart = startOfDay(last);
      const diff = Math.floor((todayStart.getTime() - lastStart.getTime()) / 86400000);
      if (diff === 1) newDailyStreak = Math.max(1, newDailyStreak) + 1;
      else if (diff > 1) newDailyStreak = 1;
      else newDailyStreak = Math.max(1, newDailyStreak);
    }
    const newLastBlazeAt = now.toISOString();

    const optimisticBase = {
      ...progressBase,
      totalXP: newXP,
      answeredQuestions: newAnswered,
      dailyStreak: newDailyStreak,
      lastBlazeAt: newLastBlazeAt,
    };
    setProgressBase(optimisticBase);

    try {
      await client.models.UserProgress.update({
        id: progressBase.id,
        totalXP: newXP,
        answeredQuestions: newAnswered,
        dailyStreak: newDailyStreak,
        lastBlazeAt: newLastBlazeAt,
      });
    } catch (e) {
      console.warn('Failed to persist answer/progress', e);
    }
  }, [
    progressBase, userId, byId, sectionToIds, sectionIdByNumber, pushCompletedSection, client
  ]);

  const uiProgress: ProgressShape | null = useMemo(() => {
    if (!progressBase) return null;
    return { ...progressBase, completedSections: completedSectionNumbers };
  }, [progressBase, completedSectionNumbers]);

  return {
    questions,
    progress: uiProgress,
    loading,
    error,
    handleAnswer,
    orderedSectionNumbers,
  };
}
