// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // ------------------------------------------------------------
  // Content hierarchy: Campaign -> Section -> Question -> Answer
  // ------------------------------------------------------------

  Campaign: a
    .model({
      id: a.id().required(),
      slug: a.string().required(),            // keep as before if you already have slugs
      title: a.string().required(),
      description: a.string(),
      order: a.integer().default(0),
      isActive: a.boolean().default(true),

      // New (optional) thumbnail fields — safe for existing data
      thumbnailKey: a.string(),               // S3 key (e.g., "campaign-thumbnails/foo.jpg")
      thumbnailUrl: a.string(),               // optional absolute URL fallback
      thumbnailAlt: a.string(),               // accessible alt text

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

      // Keep legacy numeric section index (existing UI depends on it)
      number: a.integer().required(),

      // Make these OPTIONAL to avoid breaking existing rows
      title: a.string(),
      educationalText: a.string(),
      order: a.integer().default(0),
      isActive: a.boolean().default(true),

      // New unlock controls kept OPTIONAL (no default to avoid migration issues)
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

      // Legacy field still available for your current filters
      section: a.integer(),

      // Future-proof relational link (optional so existing data keeps working)
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
  // User-owned state and progress (unchanged)
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

      // Gen2 emits Nullable<T>[]; your hooks already normalize these
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

  // Optional legacy model kept intact
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















