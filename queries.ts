/* tslint:disable */
 
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getAnswer = /* GraphQL */ `query GetAnswer($id: ID!) {
  getAnswer(id: $id) {
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
` as GeneratedQuery<APITypes.GetAnswerQueryVariables, APITypes.GetAnswerQuery>;
export const getQuestion = /* GraphQL */ `query GetQuestion($id: ID!) {
  getQuestion(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetQuestionQueryVariables,
  APITypes.GetQuestionQuery
>;
export const getUserProgress = /* GraphQL */ `query GetUserProgress($id: ID!) {
  getUserProgress(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetUserProgressQueryVariables,
  APITypes.GetUserProgressQuery
>;
export const listAnswers = /* GraphQL */ `query ListAnswers(
  $filter: ModelAnswerFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listAnswers(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      content
      createdAt
      id
      isCorrect
      questionId
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAnswersQueryVariables,
  APITypes.ListAnswersQuery
>;
export const listQuestions = /* GraphQL */ `query ListQuestions(
  $filter: ModelQuestionFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listQuestions(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      createdAt
      difficulty
      id
      section
      text
      updatedAt
      xpValue
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListQuestionsQueryVariables,
  APITypes.ListQuestionsQuery
>;
export const listUserProgresses = /* GraphQL */ `query ListUserProgresses(
  $filter: ModelUserProgressFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listUserProgresses(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      answeredQuestions
      createdAt
      id
      owner
      totalXP
      updatedAt
      userId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserProgressesQueryVariables,
  APITypes.ListUserProgressesQuery
>;
