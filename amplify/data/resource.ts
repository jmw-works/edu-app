// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // ------------------------------------------------------------
  // Content hierarchy: Campaign -> Section -> Question -> Answer
  // ------------------------------------------------------------

  Campaign: a
    .model({
      id: a.id().required(),
      slug: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      order: a.integer().default(0),
      isActive: a.boolean().default(true),

      // Optional thumbnails
      thumbnailKey: a.string(),
      thumbnailUrl: a.string(),
      thumbnailAlt: a.string(),

      sections: a.hasMany('Section', 'campaignId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
    ]),

  Section: a
    .model({
      id: a.id().required(),
      campaignId: a.id().required(),
      campaign: a.belongsTo('Campaign', 'campaignId'),

      // Legacy numeric index used by UI
      number: a.integer().required(),

      title: a.string(),
      educationalText: a.string(),
      order: a.integer().default(0),
      isActive: a.boolean().default(true),

      // Optional unlock controls
      unlockRule: a.enum(['ALL_PREV_CORRECT', 'PERCENT', 'MANUAL']),
      unlockThreshold: a.integer().default(100),

      questions: a.hasMany('Question', 'sectionId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
    ]),

  Question: a
    .model({
      id: a.id().required(),

      // Legacy field for compatibility
      section: a.integer(),

      // Relational link (preferred)
      sectionId: a.id(),
      sectionRef: a.belongsTo('Section', 'sectionId'),

      text: a.string().required(),
      xpValue: a.integer().default(10),
      difficulty: a.enum(['easy', 'medium', 'hard']),
      order: a.integer().default(0),
      isActive: a.boolean().default(true),

      answers: a.hasMany('Answer', 'questionId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
    ]),

  Answer: a
    .model({
      id: a.id().required(),
      questionId: a.id().required(),
      question: a.belongsTo('Question', 'questionId'),
      content: a.string().required(),
      isCorrect: a.boolean().default(false),
      order: a.integer().default(0),
      isActive: a.boolean().default(true),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
    ]),

  // ------------------------------------------------------------
  // User-owned state and progress
  // ------------------------------------------------------------

  UserProfile: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      email: a.string(),
      displayName: a.string(),
      avatarUrl: a.string(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  UserProgress: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      totalXP: a.integer().default(0),

      answeredQuestions: a.string().array(),
      completedSections: a.integer().array(),

      dailyStreak: a.integer().default(0),
      lastBlazeAt: a.datetime(), // nullable
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  SectionProgress: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      sectionId: a.id().required(),
      answeredQuestionIds: a.string().array(),
      correctCount: a.integer().default(0),
      completed: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  CampaignProgress: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      campaignId: a.id().required(),
      completed: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  // Optional legacy model
  UserStats: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      totalXP: a.integer().default(0),
      correctAnswers: a.integer().default(0),
      incorrectAnswers: a.integer().default(0),
      completedSections: a.integer().default(0),
      streakCount: a.integer().default(0),
      lastActiveDate: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
});
