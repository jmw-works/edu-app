// src/types/QuestionTypes.ts
// Unified, frontend Question/Answer types for the quiz.
// Back-compat aliases are exported at the bottom so current code keeps compiling.

/** A single possible answer to a question (UI shape). */
export interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
}

/** Core Question shape used across UI. `answers` is REQUIRED (never undefined). */
export interface Question {
  id: string;
  text: string;
  section: number;
  xpValue?: number | null;
  answers: Answer[]; // ← required
}

/** Object-based answer submission payload (shared across app). */
export type SubmitArgs = {
  questionId: string;
  isCorrect: boolean;
  xp?: number;
};



/** Shared handler signature for answering a question. */
export type HandleAnswer = (args: SubmitArgs) => void | Promise<void>;

/* -----------------------------
   Back-compat export aliases
   ----------------------------- */
export type AnswerUI = Answer;
export type QuestionUI = Question;













