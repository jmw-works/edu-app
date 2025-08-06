// src/hooks/useCampaignThumbnail.ts
import { useEffect, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';

type Options = {
  key?: string | null;
  fallbackUrl?: string | null; // optional absolute URL stored in Campaign
};

export function useCampaignThumbnail({ key, fallbackUrl }: Options) {
  const [url, setUrl] = useState<string | null>(fallbackUrl ?? null);
  const [loading, setLoading] = useState<boolean>(!!key);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!key) {
        setLoading(false);
        setUrl(fallbackUrl ?? null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // public level since our storage rule exposes public/*
        const result = await getUrl({ path: `public/${key}` });
        if (!cancelled) {
          setUrl(result.url.toString());
        }
      } catch (e) {
        if (!cancelled) {
          setError(e as Error);
          setUrl(fallbackUrl ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [key, fallbackUrl]);

  return { url, loading, error };
}

