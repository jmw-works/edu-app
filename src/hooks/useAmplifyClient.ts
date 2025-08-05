// src/hooks/useAmplifyClient.ts
import { useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Amplify } from 'aws-amplify';

function assertAmplifyConfigured() {
  const config = (Amplify as any)._config;
  if (!config || Object.keys(config).length === 0) {
    throw new Error('Amplify is not configured. Ensure Amplify.configure() runs in main.tsx before using this hook.');
  }
}

export function useAmplifyClient() {
  return useMemo(() => {
    assertAmplifyConfigured();
    return generateClient<Schema>();
  }, []);
}

