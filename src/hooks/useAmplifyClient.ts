// src/hooks/useAmplifyClient.ts
import { useMemo } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

// Name the return type to avoid TS2742 on inferred anonymous types
type AmplifyDataClient = ReturnType<typeof generateClient<Schema>>;

/**
 * Throws if Amplify.configure(...) hasn't run yet.
 * Ensures we don't touch Amplify APIs before configuration.
 */
function assertAmplifyConfigured() {
  const cfg = (Amplify as any).getConfig?.() ?? {};
  if (!cfg || Object.keys(cfg).length === 0) {
    throw new Error(
      'Amplify is not configured. Call Amplify.configure(outputs) in your app entry (e.g., main.tsx) before using Amplify APIs.'
    );
  }
}

/**
 * useAmplifyClient
 * Creates a typed Data client after confirming Amplify is configured.
 */
export function useAmplifyClient(): AmplifyDataClient {
  return useMemo(() => {
    assertAmplifyConfigured();
    return generateClient<Schema>();
  }, []);
}





