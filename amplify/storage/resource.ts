// amplify/storage/resource.ts
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'thumbnailFiles',
  access: (allow) => ({
    // ✅ Allow upload and read access to public files
    'public/*': [
      allow.authenticated.to(['read', 'write']),
      allow.guest.to(['read']),
    ],
    // ✅ Allow full access to protected and private areas
    'protected/*': [allow.authenticated.to(['read', 'write'])],
    'private/*': [allow.authenticated.to(['read', 'write', 'delete'])],
  }),
});






