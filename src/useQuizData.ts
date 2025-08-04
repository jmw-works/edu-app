// src/useQuizData.ts
import { useState, useEffect } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/api';

const client = generateClient<Schema>();

type QuestionWithAnswers = Omit<Schema['Question']['type'], 'answers'> & {
  answers: Schema['Answer']['type'][];
};

type UserProgressResponse = {
  id: string;
  userId: string;
  totalXP?: number | null | undefined;
  answeredQuestions?: (string | null)[] | null | undefined;
  owner?: string | null | undefined;
  readonly createdAt: string;
  readonly updatedAt: string;
};

const defaultProgress: Schema['UserProgress']['type'] = {
  id: '',
  userId: '',
  totalXP: 0,
  answeredQuestions: [],
  owner: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useQuizData(userId: string) {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [progress, setProgress] = useState<Schema['UserProgress']['type']>(defaultProgress);

  useEffect(() => {
    fetchData();
  }, [userId]);

  async function fetchData() {
    try {
      const { data: questionData, errors } = await client.models.Question.list({
        selectionSet: [
          'id',
          'text',
          'section',
          'xpValue',
          'difficulty',
          'createdAt',
          'updatedAt',
          'answers.*',
        ],
      });
      if (errors) console.error('Question fetch errors:', errors);

      // Check per section if questions exist
      const hasSection1 = questionData.some(q => q.section === 1);
      const hasSection2 = questionData.some(q => q.section === 2);
      const hasSection3 = questionData.some(q => q.section === 3); // Add for more sections as needed

      if (!hasSection1 || !hasSection2 || !hasSection3) {
        await seedFakeQuestions(hasSection1, hasSection2, hasSection3);
        // Re-fetch after seeding
        const { data: updatedQuestionData, errors: updatedErrors } = await client.models.Question.list({
          selectionSet: [
            'id',
            'text',
            'section',
            'xpValue',
            'difficulty',
            'createdAt',
            'updatedAt',
            'answers.*',
          ],
        });
        if (updatedErrors) console.error('Updated question fetch errors:', updatedErrors);
        setQuestions(updatedQuestionData as QuestionWithAnswers[]);
      } else {
        setQuestions(questionData as QuestionWithAnswers[]);
      }

      const { data: progressData, errors: progressErrors } = await client.models.UserProgress.list({
        filter: { userId: { eq: userId } },
      });
      if (progressErrors) console.error('Progress fetch errors:', progressErrors);

      let userProgressRaw = progressData[0] as UserProgressResponse | undefined;
      if (!userProgressRaw) {
        const { data: createdProgressRaw, errors: createErrors } = await client.models.UserProgress.create({
          userId: userId,
          totalXP: 0,
          answeredQuestions: [],
        });
        if (createErrors) console.error('Progress create errors:', createErrors);
        userProgressRaw = createdProgressRaw as UserProgressResponse | undefined;
      }

      const userProgress: Schema['UserProgress']['type'] = {
        id: userProgressRaw?.id ?? '',
        userId: userProgressRaw?.userId ?? '',
        totalXP: userProgressRaw?.totalXP ?? 0,
        answeredQuestions: userProgressRaw?.answeredQuestions ?? [],
        owner: userProgressRaw?.owner ?? null,
        createdAt: userProgressRaw?.createdAt ?? new Date().toISOString(),
        updatedAt: userProgressRaw?.updatedAt ?? new Date().toISOString(),
      };

      setProgress(userProgress);
    } catch (error) {
      console.error('Fetch data error:', error);
      setProgress(defaultProgress);
    }
  }

  async function seedFakeQuestions(hasSection1 = true, hasSection2 = true, hasSection3 = true) {
    try {
      if (!hasSection1) {
        // Seed Section 1 questions
        const { data: q1 } = await client.models.Question.create({
          text: 'What is the capital of France?',
          section: 1,
          xpValue: 10,
          difficulty: 'easy',
        });
        if (q1)
          await createAnswers(q1.id, [
            { content: 'Paris', isCorrect: true },
            { content: 'London', isCorrect: false },
            { content: 'Berlin', isCorrect: false },
            { content: 'Madrid', isCorrect: false },
          ]);

        // q2 and q3 similarly...
      }

      if (!hasSection2) {
        // Seed Section 2 questions
        const { data: q4 } = await client.models.Question.create({
          text: 'What is the square root of 16?',
          section: 2,
          xpValue: 15,
          difficulty: 'medium',
        });
        if (q4)
          await createAnswers(q4.id, [
            { content: '4', isCorrect: true },
            { content: '2', isCorrect: false },
            { content: '8', isCorrect: false },
            { content: '16', isCorrect: false },
          ]);

        // q5 and q6 similarly...
      }

      if (!hasSection3) {
        // Seed Section 3 questions (example; add your own)
        const { data: q7 } = await client.models.Question.create({
          text: 'What is the speed of light?',
          section: 3,
          xpValue: 20,
          difficulty: 'hard',
        });
        if (q7)
          await createAnswers(q7.id, [
            { content: '299792458 m/s', isCorrect: true },
            { content: '150000000 m/s', isCorrect: false },
            { content: '300000000 m/s', isCorrect: false },
            { content: '100000000 m/s', isCorrect: false },
          ]);

        // Add more q8, q9, etc., as needed for Section 3
      }
    } catch (error) {
      console.error('Seeding error:', error);
    }
  }

  async function createAnswers(questionId: string, answers: { content: string; isCorrect: boolean }[]) {
    for (const ans of answers) {
      await client.models.Answer.create({
        content: ans.content,
        isCorrect: ans.isCorrect,
        questionId,
      });
    }
  }

  async function handleAnswer(
    questionId: string,
    userAnswer: string,
    correctAnswer: string,
    xpValue: number
  ) {
    const userNormalized = userAnswer.trim().toLowerCase();
    const correctNormalized = correctAnswer.trim().toLowerCase();

    if (userNormalized === correctNormalized && progress) {
      const updatedAnswered = [...(progress.answeredQuestions || []), questionId];
      const updatedXP = (progress.totalXP || 0) + xpValue;

      const { data: updatedProgressRaw } = await client.models.UserProgress.update({
        id: progress.id,
        answeredQuestions: updatedAnswered,
        totalXP: updatedXP,
      });

      const updatedProgress: Schema['UserProgress']['type'] = {
        ...updatedProgressRaw ?? progress,
        totalXP: (updatedProgressRaw?.totalXP ?? progress.totalXP) ?? 0,
        answeredQuestions: updatedProgressRaw?.answeredQuestions ?? progress.answeredQuestions ?? [],
        owner: updatedProgressRaw?.owner ?? progress.owner ?? null,
      };

      setProgress(updatedProgress);
    }
  }

  return {
    questions,
    progress,
    handleAnswer,
  };
}