/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createAnswer = /* GraphQL */ `mutation CreateAnswer(
  $condition: ModelAnswerConditionInput
  $input: CreateAnswerInput!
) {
  createAnswer(condition: $condition, input: $input) {
    content
    createdAt
    id
    isCorrect
    question {
      createdAt
      difficulty
      id
      section
      text
      updatedAt
      xpValue
      __typename
    }
    questionId
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateAnswerMutationVariables,
  APITypes.CreateAnswerMutation
>;
export const createQuestion = /* GraphQL */ `mutation CreateQuestion(
  $condition: ModelQuestionConditionInput
  $input: CreateQuestionInput!
) {
  createQuestion(condition: $condition, input: $input) {
    answers {
      nextToken
      __typename
    }
    createdAt
    difficulty
    id
    section
    text
    updatedAt
    xpValue
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateQuestionMutationVariables,
  APITypes.CreateQuestionMutation
>;
export const createUserProgress = /* GraphQL */ `mutation CreateUserProgress(
  $condition: ModelUserProgressConditionInput
  $input: CreateUserProgressInput!
) {
  createUserProgress(condition: $condition, input: $input) {
    answeredQuestions
    createdAt
    id
    owner
    totalXP
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserProgressMutationVariables,
  APITypes.CreateUserProgressMutation
>;
export const deleteAnswer = /* GraphQL */ `mutation DeleteAnswer(
  $condition: ModelAnswerConditionInput
  $input: DeleteAnswerInput!
) {
  deleteAnswer(condition: $condition, input: $input) {
    content
    createdAt
    id
    isCorrect
    question {
      createdAt
      difficulty
      id
      section
      text
      updatedAt
      xpValue
      __typename
    }
    questionId
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteAnswerMutationVariables,
  APITypes.DeleteAnswerMutation
>;
export const deleteQuestion = /* GraphQL */ `mutation DeleteQuestion(
  $condition: ModelQuestionConditionInput
  $input: DeleteQuestionInput!
) {
  deleteQuestion(condition: $condition, input: $input) {
    answers {
      nextToken
      __typename
    }
    createdAt
    difficulty
    id
    section
    text
    updatedAt
    xpValue
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteQuestionMutationVariables,
  APITypes.DeleteQuestionMutation
>;
export const deleteUserProgress = /* GraphQL */ `mutation DeleteUserProgress(
  $condition: ModelUserProgressConditionInput
  $input: DeleteUserProgressInput!
) {
  deleteUserProgress(condition: $condition, input: $input) {
    answeredQuestions
    createdAt
    id
    owner
    totalXP
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserProgressMutationVariables,
  APITypes.DeleteUserProgressMutation
>;
export const updateAnswer = /* GraphQL */ `mutation UpdateAnswer(
  $condition: ModelAnswerConditionInput
  $input: UpdateAnswerInput!
) {
  updateAnswer(condition: $condition, input: $input) {
    content
    createdAt
    id
    isCorrect
    question {
      createdAt
      difficulty
      id
      section
      text
      updatedAt
      xpValue
      __typename
    }
    questionId
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateAnswerMutationVariables,
  APITypes.UpdateAnswerMutation
>;
export const updateQuestion = /* GraphQL */ `mutation UpdateQuestion(
  $condition: ModelQuestionConditionInput
  $input: UpdateQuestionInput!
) {
  updateQuestion(condition: $condition, input: $input) {
    answers {
      nextToken
      __typename
    }
    createdAt
    difficulty
    id
    section
    text
    updatedAt
    xpValue
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateQuestionMutationVariables,
  APITypes.UpdateQuestionMutation
>;
export const updateUserProgress = /* GraphQL */ `mutation UpdateUserProgress(
  $condition: ModelUserProgressConditionInput
  $input: UpdateUserProgressInput!
) {
  updateUserProgress(condition: $condition, input: $input) {
    answeredQuestions
    createdAt
    id
    owner
    totalXP
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserProgressMutationVariables,
  APITypes.UpdateUserProgressMutation
>;
