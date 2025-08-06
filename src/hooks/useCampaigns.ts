// src/hooks/useCampaigns.ts
import { useEffect, useMemo, useState, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type UICampaign = {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  order: number;
  isActive: boolean;
  locked: boolean;      // derived for UI
  completed: boolean;   // derived from CampaignProgress
};

export function useCampaigns(userId?: string | null) {
  const [campaigns, setCampaigns] = useState<UICampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // 1) fetch all active campaigns
      const cRes = await client.models.Campaign.list({
        selectionSet: ['id', 'title', 'description', 'thumbnailUrl', 'order', 'isActive'],
      });
      const raw = (cRes.data ?? [])
        .filter(c => c.isActive !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      // 2) fetch user campaign progress
      let completedIds = new Set<string>();
      if (userId) {
        const pRes = await client.models.CampaignProgress.list({
          filter: { userId: { eq: userId } },
          selectionSet: ['id', 'campaignId', 'completed'],
        });
        for (const row of pRes.data ?? []) {
          if (row.completed) completedIds.add(row.campaignId);
        }
      }

      // 3) derive locked/unlocked based on order + completions
      // Rule: campaign is unlocked if all campaigns with a LOWER order are completed.
      const ordered = raw.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description ?? null,
        thumbnailUrl: r.thumbnailUrl ?? null,
        order: r.order ?? 0,
        isActive: r.isActive !== false,
      }));

      const unlocked: boolean[] = [];
      const isCompleted: boolean[] = [];
      ordered.forEach((c, idx) => {
        const prevAllCompleted = idx === 0 ? true : ordered.slice(0, idx).every(x => completedIds.has(x.id));
        unlocked.push(prevAllCompleted);
        isCompleted.push(completedIds.has(c.id));
      });

      const ui: UICampaign[] = ordered.map((c, i) => ({
        ...c,
        locked: !unlocked[i],
        completed: isCompleted[i],
      }));

      setCampaigns(ui);
    } catch (e) {
      setErr(e as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const markCampaignCompleted = useCallback(async (campaignId: string) => {
    if (!userId) return;
    // upsert: try to find existing row
    const list = await client.models.CampaignProgress.list({
      filter: { userId: { eq: userId }, campaignId: { eq: campaignId } },
      selectionSet: ['id', 'completed'],
    });
    const row = list.data?.[0] ?? null;
    if (row) {
      if (!row.completed) {
        await client.models.CampaignProgress.update({ id: row.id, completed: true });
      }
    } else {
      await client.models.CampaignProgress.create({ userId, campaignId, completed: true });
    }
    await load(); // refresh gallery lock state
  }, [userId, load]);

  return { campaigns, loading, error, refresh: load, markCampaignCompleted };
}

