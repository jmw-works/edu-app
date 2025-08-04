/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Answer = {
  __typename: "Answer",
  content: string,
  createdAt: string,
  id: string,
  isCorrect: boolean,
  question?: Question | null,
  questionId: string,
  updatedAt: string,
};

export type Question = {
  __typename: "Question",
  answers?: ModelAnswerConnection | null,
  createdAt: string,
  difficulty?: QuestionDifficulty | null,
  id: string,
  section: number,
  text: string,
  updatedAt: string,
  xpValue?: number | null,
};

export type ModelAnswerConnection = {
  __typename: "ModelAnswerConnection",
  items:  Array<Answer | null >,
  nextToken?: string | null,
};

export enum QuestionDifficulty {
  easy = "easy",
  hard = "hard",
  medium = "medium",
}


export type UserProgress = {
  __typename: "UserProgress",
  answeredQuestions?: Array< string | null > | null,
  createdAt: string,
  id: string,
  owner?: string | null,
  totalXP?: number | null,
  updatedAt: string,
  userId: string,
};

export type ModelAnswerFilterInput = {
  and?: Array< ModelAnswerFilterInput | null > | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  isCorrect?: ModelBooleanInput | null,
  not?: ModelAnswerFilterInput | null,
  or?: Array< ModelAnswerFilterInput | null > | null,
  questionId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelBooleanInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  eq?: boolean | null,
  ne?: boolean | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelQuestionFilterInput = {
  and?: Array< ModelQuestionFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  difficulty?: ModelQuestionDifficultyInput | null,
  id?: ModelIDInput | null,
  not?: ModelQuestionFilterInput | null,
  or?: Array< ModelQuestionFilterInput | null > | null,
  section?: ModelIntInput | null,
  text?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  xpValue?: ModelIntInput | null,
};

export type ModelQuestionDifficultyInput = {
  eq?: QuestionDifficulty | null,
  ne?: QuestionDifficulty | null,
};

export type ModelIntInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelQuestionConnection = {
  __typename: "ModelQuestionConnection",
  items:  Array<Question | null >,
  nextToken?: string | null,
};

export type ModelUserProgressFilterInput = {
  and?: Array< ModelUserProgressFilterInput | null > | null,
  answeredQuestions?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelUserProgressFilterInput | null,
  or?: Array< ModelUserProgressFilterInput | null > | null,
  owner?: ModelStringInput | null,
  totalXP?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type ModelUserProgressConnection = {
  __typename: "ModelUserProgressConnection",
  items:  Array<UserProgress | null >,
  nextToken?: string | null,
};

export type ModelAnswerConditionInput = {
  and?: Array< ModelAnswerConditionInput | null > | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  isCorrect?: ModelBooleanInput | null,
  not?: ModelAnswerConditionInput | null,
  or?: Array< ModelAnswerConditionInput | null > | null,
  questionId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateAnswerInput = {
  content: string,
  id?: string | null,
  isCorrect: boolean,
  questionId: string,
};

export type ModelQuestionConditionInput = {
  and?: Array< ModelQuestionConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  difficulty?: ModelQuestionDifficultyInput | null,
  not?: ModelQuestionConditionInput | null,
  or?: Array< ModelQuestionConditionInput | null > | null,
  section?: ModelIntInput | null,
  text?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  xpValue?: ModelIntInput | null,
};

export type CreateQuestionInput = {
  difficulty?: QuestionDifficulty | null,
  id?: string | null,
  section: number,
  text: string,
  xpValue?: number | null,
};

export type ModelUserProgressConditionInput = {
  and?: Array< ModelUserProgressConditionInput | null > | null,
  answeredQuestions?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  not?: ModelUserProgressConditionInput | null,
  or?: Array< ModelUserProgressConditionInput | null > | null,
  owner?: ModelStringInput | null,
  totalXP?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type CreateUserProgressInput = {
  answeredQuestions?: Array< string | null > | null,
  id?: string | null,
  totalXP?: number | null,
  userId: string,
};

export type DeleteAnswerInput = {
  id: string,
};

export type DeleteQuestionInput = {
  id: string,
};

export type DeleteUserProgressInput = {
  id: string,
};

export type UpdateAnswerInput = {
  content?: string | null,
  id: string,
  isCorrect?: boolean | null,
  questionId?: string | null,
};

export type UpdateQuestionInput = {
  difficulty?: QuestionDifficulty | null,
  id: string,
  section?: number | null,
  text?: string | null,
  xpValue?: number | null,
};

export type UpdateUserProgressInput = {
  answeredQuestions?: Array< string | null > | null,
  id: string,
  totalXP?: number | null,
  userId?: string | null,
};

export type ModelSubscriptionAnswerFilterInput = {
  and?: Array< ModelSubscriptionAnswerFilterInput | null > | null,
  content?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  isCorrect?: ModelSubscriptionBooleanInput | null,
  or?: Array< ModelSubscriptionAnswerFilterInput | null > | null,
  questionId?: ModelSubscriptionIDInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  eq?: boolean | null,
  ne?: boolean | null,
};

export type ModelSubscriptionQuestionFilterInput = {
  and?: Array< ModelSubscriptionQuestionFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  difficulty?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionQuestionFilterInput | null > | null,
  section?: ModelSubscriptionIntInput | null,
  text?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  xpValue?: ModelSubscriptionIntInput | null,
};

export type ModelSubscriptionIntInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionUserProgressFilterInput = {
  and?: Array< ModelSubscriptionUserProgressFilterInput | null > | null,
  answeredQuestions?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionUserProgressFilterInput | null > | null,
  owner?: ModelStringInput | null,
  totalXP?: ModelSubscriptionIntInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userId?: ModelSubscriptionStringInput | null,
};

export type GetAnswerQueryVariables = {
  id: string,
};

export type GetAnswerQuery = {
  getAnswer?:  {
    __typename: "Answer",
    content: string,
    createdAt: string,
    id: string,
    isCorrect: boolean,
    question?:  {
      __typename: "Question",
      createdAt: string,
      difficulty?: QuestionDifficulty | null,
      id: string,
      section: number,
      text: string,
      updatedAt: string,
      xpValue?: number | null,
    } | null,
    questionId: string,
    updatedAt: string,
  } | null,
};

export type GetQuestionQueryVariables = {
  id: string,
};

export type GetQuestionQuery = {
  getQuestion?:  {
    __typename: "Question",
    answers?:  {
      __typename: "ModelAnswerConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    difficulty?: QuestionDifficulty | null,
    id: string,
    section: number,
    text: string,
    updatedAt: string,
    xpValue?: number | null,
  } | null,
};

export type GetUserProgressQueryVariables = {
  id: string,
};

export type GetUserProgressQuery = {
  getUserProgress?:  {
    __typename: "UserProgress",
    answeredQuestions?: Array< string | null > | null,
    createdAt: string,
    id: string,
    owner?: string | null,
    totalXP?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type ListAnswersQueryVariables = {
  filter?: ModelAnswerFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListAnswersQuery = {
  listAnswers?:  {
    __typename: "ModelAnswerConnection",
    items:  Array< {
      __typename: "Answer",
      content: string,
      createdAt: string,
      id: string,
      isCorrect: boolean,
      questionId: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListQuestionsQueryVariables = {
  filter?: ModelQuestionFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListQuestionsQuery = {
  listQuestions?:  {
    __typename: "ModelQuestionConnection",
    items:  Array< {
      __typename: "Question",
      createdAt: string,
      difficulty?: QuestionDifficulty | null,
      id: string,
      section: number,
      text: string,
      updatedAt: string,
      xpValue?: number | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListUserProgressesQueryVariables = {
  filter?: ModelUserProgressFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListUserProgressesQuery = {
  listUserProgresses?:  {
    __typename: "ModelUserProgressConnection",
    items:  Array< {
      __typename: "UserProgress",
      answeredQuestions?: Array< string | null > | null,
      createdAt: string,
      id: string,
      owner?: string | null,
      totalXP?: number | null,
      updatedAt: string,
      userId: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateAnswerMutationVariables = {
  condition?: ModelAnswerConditionInput | null,
  input: CreateAnswerInput,
};

export type CreateAnswerMutation = {
  createAnswer?:  {
    __typename: "Answer",
    content: string,
    createdAt: string,
    id: string,
    isCorrect: boolean,
    question?:  {
      __typename: "Question",
      createdAt: string,
      difficulty?: QuestionDifficulty | null,
      id: string,
      section: number,
      text: string,
      updatedAt: string,
      xpValue?: number | null,
    } | null,
    questionId: string,
    updatedAt: string,
  } | null,
};

export type CreateQuestionMutationVariables = {
  condition?: ModelQuestionConditionInput | null,
  input: CreateQuestionInput,
};

export type CreateQuestionMutation = {
  createQuestion?:  {
    __typename: "Question",
    answers?:  {
      __typename: "ModelAnswerConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    difficulty?: QuestionDifficulty | null,
    id: string,
    section: number,
    text: string,
    updatedAt: string,
    xpValue?: number | null,
  } | null,
};

export type CreateUserProgressMutationVariables = {
  condition?: ModelUserProgressConditionInput | null,
  input: CreateUserProgressInput,
};

export type CreateUserProgressMutation = {
  createUserProgress?:  {
    __typename: "UserProgress",
    answeredQuestions?: Array< string | null > | null,
    createdAt: string,
    id: string,
    owner?: string | null,
    totalXP?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type DeleteAnswerMutationVariables = {
  condition?: ModelAnswerConditionInput | null,
  input: DeleteAnswerInput,
};

export type DeleteAnswerMutation = {
  deleteAnswer?:  {
    __typename: "Answer",
    content: string,
    createdAt: string,
    id: string,
    isCorrect: boolean,
    question?:  {
      __typename: "Question",
      createdAt: string,
      difficulty?: QuestionDifficulty | null,
      id: string,
      section: number,
      text: string,
      updatedAt: string,
      xpValue?: number | null,
    } | null,
    questionId: string,
    updatedAt: string,
  } | null,
};

export type DeleteQuestionMutationVariables = {
  condition?: ModelQuestionConditionInput | null,
  input: DeleteQuestionInput,
};

export type DeleteQuestionMutation = {
  deleteQuestion?:  {
    __typename: "Question",
    answers?:  {
      __typename: "ModelAnswerConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    difficulty?: QuestionDifficulty | null,
    id: string,
    section: number,
    text: string,
    updatedAt: string,
    xpValue?: number | null,
  } | null,
};

export type DeleteUserProgressMutationVariables = {
  condition?: ModelUserProgressConditionInput | null,
  input: DeleteUserProgressInput,
};

export type DeleteUserProgressMutation = {
  deleteUserProgress?:  {
    __typename: "UserProgress",
    answeredQuestions?: Array< string | null > | null,
    createdAt: string,
    id: string,
    owner?: string | null,
    totalXP?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type UpdateAnswerMutationVariables = {
  condition?: ModelAnswerConditionInput | null,
  input: UpdateAnswerInput,
};

export type UpdateAnswerMutation = {
  updateAnswer?:  {
    __typename: "Answer",
    content: string,
    createdAt: string,
    id: string,
    isCorrect: boolean,
    question?:  {
      __typename: "Question",
      createdAt: string,
      difficulty?: QuestionDifficulty | null,
      id: string,
      section: number,
      text: string,
      updatedAt: string,
      xpValue?: number | null,
    } | null,
    questionId: string,
    updatedAt: string,
  } | null,
};

export type UpdateQuestionMutationVariables = {
  condition?: ModelQuestionConditionInput | null,
  input: UpdateQuestionInput,
};

export type UpdateQuestionMutation = {
  updateQuestion?:  {
    __typename: "Question",
    answers?:  {
      __typename: "ModelAnswerConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    difficulty?: QuestionDifficulty | null,
    id: string,
    section: number,
    text: string,
    updatedAt: string,
    xpValue?: number | null,
  } | null,
};

export type UpdateUserProgressMutationVariables = {
  condition?: ModelUserProgressConditionInput | null,
  input: UpdateUserProgressInput,
};

export type UpdateUserProgressMutation = {
  updateUserProgress?:  {
    __typename: "UserProgress",
    answeredQuestions?: Array< string | null > | null,
    createdAt: string,
    id: string,
    owner?: string | null,
    totalXP?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnCreateAnswerSubscriptionVariables = {
  filter?: ModelSubscriptionAnswerFilterInput | null,
};

export type OnCreateAnswerSubscription = {
  onCreateAnswer?:  {
    __typename: "Answer",
    content: string,
    createdAt: string,
    id: string,
    isCorrect: boolean,
    question?:  {
      __typename: "Question",
      createdAt: string,
      difficulty?: QuestionDifficulty | null,
      id: string,
      section: number,
      text: string,
      updatedAt: string,
      xpValue?: number | null,
    } | null,
    questionId: string,
    updatedAt: string,
  } | null,
};

export type OnCreateQuestionSubscriptionVariables = {
  filter?: ModelSubscriptionQuestionFilterInput | null,
};

export type OnCreateQuestionSubscription = {
  onCreateQuestion?:  {
    __typename: "Question",
    answers?:  {
      __typename: "ModelAnswerConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    difficulty?: QuestionDifficulty | null,
    id: string,
    section: number,
    text: string,
    updatedAt: string,
    xpValue?: number | null,
  } | null,
};

export type OnCreateUserProgressSubscriptionVariables = {
  filter?: ModelSubscriptionUserProgressFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserProgressSubscription = {
  onCreateUserProgress?:  {
    __typename: "UserProgress",
    answeredQuestions?: Array< string | null > | null,
    createdAt: string,
    id: string,
    owner?: string | null,
    totalXP?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnDeleteAnswerSubscriptionVariables = {
  filter?: ModelSubscriptionAnswerFilterInput | null,
};

export type OnDeleteAnswerSubscription = {
  onDeleteAnswer?:  {
    __typename: "Answer",
    content: string,
    createdAt: string,
    id: string,
    isCorrect: boolean,
    question?:  {
      __typename: "Question",
      createdAt: string,
      difficulty?: QuestionDifficulty | null,
      id: string,
      section: number,
      text: string,
      updatedAt: string,
      xpValue?: number | null,
    } | null,
    questionId: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteQuestionSubscriptionVariables = {
  filter?: ModelSubscriptionQuestionFilterInput | null,
};

export type OnDeleteQuestionSubscription = {
  onDeleteQuestion?:  {
    __typename: "Question",
    answers?:  {
      __typename: "ModelAnswerConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    difficulty?: QuestionDifficulty | null,
    id: string,
    section: number,
    text: string,
    updatedAt: string,
    xpValue?: number | null,
  } | null,
};

export type OnDeleteUserProgressSubscriptionVariables = {
  filter?: ModelSubscriptionUserProgressFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserProgressSubscription = {
  onDeleteUserProgress?:  {
    __typename: "UserProgress",
    answeredQuestions?: Array< string | null > | null,
    createdAt: string,
    id: string,
    owner?: string | null,
    totalXP?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnUpdateAnswerSubscriptionVariables = {
  filter?: ModelSubscriptionAnswerFilterInput | null,
};

export type OnUpdateAnswerSubscription = {
  onUpdateAnswer?:  {
    __typename: "Answer",
    content: string,
    createdAt: string,
    id: string,
    isCorrect: boolean,
    question?:  {
      __typename: "Question",
      createdAt: string,
      difficulty?: QuestionDifficulty | null,
      id: string,
      section: number,
      text: string,
      updatedAt: string,
      xpValue?: number | null,
    } | null,
    questionId: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateQuestionSubscriptionVariables = {
  filter?: ModelSubscriptionQuestionFilterInput | null,
};

export type OnUpdateQuestionSubscription = {
  onUpdateQuestion?:  {
    __typename: "Question",
    answers?:  {
      __typename: "ModelAnswerConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    difficulty?: QuestionDifficulty | null,
    id: string,
    section: number,
    text: string,
    updatedAt: string,
    xpValue?: number | null,
  } | null,
};

export type OnUpdateUserProgressSubscriptionVariables = {
  filter?: ModelSubscriptionUserProgressFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserProgressSubscription = {
  onUpdateUserProgress?:  {
    __typename: "UserProgress",
    answeredQuestions?: Array< string | null > | null,
    createdAt: string,
    id: string,
    owner?: string | null,
    totalXP?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};
