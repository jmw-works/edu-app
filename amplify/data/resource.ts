// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Question: a
    .model({
      id: a.id().required(),
      text: a.string().required(),
      section: a.integer().required(),
      xpValue: a.integer().default(10),
      difficulty: a.enum(['easy', 'medium', 'hard']),
      answers: a.hasMany('Answer', 'questionId'),
    })
    .authorization(allow => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
    ]),

  Answer: a
    .model({
      id: a.id().required(),
      content: a.string().required(),
      isCorrect: a.boolean().required(),
      questionId: a.id().required(),
      question: a.belongsTo('Question', 'questionId'),
    })
    .authorization(allow => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
    ]),

  UserProgress: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      totalXP: a.integer().default(0),
      answeredQuestions: a.id().array(),
    })
    .authorization(allow => [
      allow.owner(),
    ]),

  UserProfile: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      displayName: a.string(), // can be undefined until set
      email: a.string(),
    })
    .authorization(allow => [
      allow.owner(), // only the logged-in user can access their own profile
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});








