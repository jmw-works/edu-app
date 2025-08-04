/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateAnswer = /* GraphQL */ `subscription OnCreateAnswer($filter: ModelSubscriptionAnswerFilterInput) {
  onCreateAnswer(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateAnswerSubscriptionVariables,
  APITypes.OnCreateAnswerSubscription
>;
export const onCreateQuestion = /* GraphQL */ `subscription OnCreateQuestion($filter: ModelSubscriptionQuestionFilterInput) {
  onCreateQuestion(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateQuestionSubscriptionVariables,
  APITypes.OnCreateQuestionSubscription
>;
export const onCreateUserProgress = /* GraphQL */ `subscription OnCreateUserProgress(
  $filter: ModelSubscriptionUserProgressFilterInput
  $owner: String
) {
  onCreateUserProgress(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserProgressSubscriptionVariables,
  APITypes.OnCreateUserProgressSubscription
>;
export const onDeleteAnswer = /* GraphQL */ `subscription OnDeleteAnswer($filter: ModelSubscriptionAnswerFilterInput) {
  onDeleteAnswer(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteAnswerSubscriptionVariables,
  APITypes.OnDeleteAnswerSubscription
>;
export const onDeleteQuestion = /* GraphQL */ `subscription OnDeleteQuestion($filter: ModelSubscriptionQuestionFilterInput) {
  onDeleteQuestion(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteQuestionSubscriptionVariables,
  APITypes.OnDeleteQuestionSubscription
>;
export const onDeleteUserProgress = /* GraphQL */ `subscription OnDeleteUserProgress(
  $filter: ModelSubscriptionUserProgressFilterInput
  $owner: String
) {
  onDeleteUserProgress(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserProgressSubscriptionVariables,
  APITypes.OnDeleteUserProgressSubscription
>;
export const onUpdateAnswer = /* GraphQL */ `subscription OnUpdateAnswer($filter: ModelSubscriptionAnswerFilterInput) {
  onUpdateAnswer(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateAnswerSubscriptionVariables,
  APITypes.OnUpdateAnswerSubscription
>;
export const onUpdateQuestion = /* GraphQL */ `subscription OnUpdateQuestion($filter: ModelSubscriptionQuestionFilterInput) {
  onUpdateQuestion(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateQuestionSubscriptionVariables,
  APITypes.OnUpdateQuestionSubscription
>;
export const onUpdateUserProgress = /* GraphQL */ `subscription OnUpdateUserProgress(
  $filter: ModelSubscriptionUserProgressFilterInput
  $owner: String
) {
  onUpdateUserProgress(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserProgressSubscriptionVariables,
  APITypes.OnUpdateUserProgressSubscription
>;
