import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource'; // Adjust path as needed
import type { QuestionWithAnswers } from '../types/QuestionTypes';

const client = generateClient<Schema>();

type UserProgress = Schema['UserProgress']['type'];

const defaultProgress: UserProgress = {
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
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

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

      const questionsList = questionData as QuestionWithAnswers[];

      const hasSection1 = questionsList.some((q) => q.section === 1);
      const hasSection2 = questionsList.some((q) => q.section === 2);
      const hasSection3 = questionsList.some((q) => q.section === 3);

      if (!hasSection1 || !hasSection2 || !hasSection3) {
        await seedFakeQuestions(hasSection1, hasSection2, hasSection3);
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
        setQuestions(questionsList);
      }

      const { data: progressData, errors: progressErrors } = await client.models.UserProgress.list({
        filter: { userId: { eq: userId } },
      });
      if (progressErrors) console.error('Progress fetch errors:', progressErrors);

      let userProgress = progressData[0] as UserProgress | undefined;

      if (!userProgress) {
        const { data: createdProgress, errors: createErrors } = await client.models.UserProgress.create({
          userId,
          totalXP: 0,
          answeredQuestions: [],
        });
        if (createErrors) console.error('Progress create errors:', createErrors);

        userProgress = !Array.isArray(createdProgress)
          ? createdProgress
          : createdProgress[0]; // fallback if create returns array
      }

      setProgress({
        ...defaultProgress,
        ...userProgress,
      });
    } catch (error) {
      console.error('Fetch data error:', error);
      setProgress(defaultProgress);
    }
  }

  async function seedFakeQuestions(
    hasSection1 = true,
    hasSection2 = true,
    hasSection3 = true
  ) {
    try {
      if (!hasSection1) {
        const { data: q1 } = await client.models.Question.create({
          text: 'What is the capital of France?',
          section: 1,
          xpValue: 10,
          difficulty: 'easy',
        });

        const question = !Array.isArray(q1) ? q1 : q1[0];
        if (question?.id) {
          await createAnswers(question.id, [
            { content: 'Paris', isCorrect: true },
            { content: 'London', isCorrect: false },
            { content: 'Berlin', isCorrect: false },
            { content: 'Madrid', isCorrect: false },
          ]);
        }
      }

      if (!hasSection2) {
        const { data: q2 } = await client.models.Question.create({
          text: 'What is the square root of 16?',
          section: 2,
          xpValue: 15,
          difficulty: 'medium',
        });

        const question = !Array.isArray(q2) ? q2 : q2[0];
        if (question?.id) {
          await createAnswers(question.id, [
            { content: '4', isCorrect: true },
            { content: '2', isCorrect: false },
            { content: '8', isCorrect: false },
            { content: '16', isCorrect: false },
          ]);
        }
      }

      if (!hasSection3) {
        const { data: q3 } = await client.models.Question.create({
          text: 'What is the speed of light?',
          section: 3,
          xpValue: 20,
          difficulty: 'hard',
        });

        const question = !Array.isArray(q3) ? q3 : q3[0];
        if (question?.id) {
          await createAnswers(question.id, [
            { content: '299792458 m/s', isCorrect: true },
            { content: '150000000 m/s', isCorrect: false },
            { content: '300000000 m/s', isCorrect: false },
            { content: '100000000 m/s', isCorrect: false },
          ]);
        }
      }
    } catch (error) {
      console.error('Seeding error:', error);
    }
  }

  async function createAnswers(
    questionId: string,
    answers: { content: string; isCorrect: boolean }[]
  ) {
    for (const answer of answers) {
      await client.models.Answer.create({
        content: answer.content,
        isCorrect: answer.isCorrect,
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
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();

    if (normalizedUserAnswer === normalizedCorrectAnswer && progress) {
      const updatedAnswered = [...(progress.answeredQuestions || []), questionId];
      const updatedXP = (progress.totalXP || 0) + xpValue;

      const { data: updatedProgressRaw } = await client.models.UserProgress.update({
        id: progress.id,
        answeredQuestions: updatedAnswered,
        totalXP: updatedXP,
      });

      const updatedProgress = !Array.isArray(updatedProgressRaw)
        ? updatedProgressRaw
        : updatedProgressRaw[0];

      setProgress({
        ...progress,
        ...updatedProgress,
        totalXP: updatedXP,
        answeredQuestions: updatedAnswered,
      });
    }
  }

  return {
    questions,
    progress,
    handleAnswer,
  };
}

