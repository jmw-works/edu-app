// src/hooks/useAmplifyClient.ts
import { useMemo } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

/**
 * Throws if Amplify.configure(...) hasn't run yet.
 * Ensures we don't touch Amplify APIs before configuration.
 */
function assertAmplifyConfigured() {
  // v6 exposes getConfig; if empty, we consider Amplify unconfigured.
  const cfg = (Amplify as any).getConfig?.() ?? {};
  if (!cfg || Object.keys(cfg).length === 0) {
    throw new Error(
      'Amplify is not configured. Ensure Amplify.configure(...) is called in main.tsx before using Amplify APIs.'
    );
  }
}

/**
 * useAmplifyClient
 * Creates a typed Data client only after confirming Amplify is configured.
 */
export function useAmplifyClient() {
  return useMemo(() => {
    assertAmplifyConfigured();
    return generateClient<Schema>();
  }, []);
}


