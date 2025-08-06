// src/pages/AuthenticatedContent.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuthenticator, Heading, Text, useTheme } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { getUrl } from 'aws-amplify/storage';

import { Header } from '../components/Header';
import { QuizSection } from '../components/QuizSection';
import LevelUpBanner from '../components/LevelUpBanner';
import UserStatsPanel from '../components/UserStatsPanel';
import { SetDisplayNameModal } from '../components/SetDisplayNameModal';

import { useUserProfile } from '../hooks/useUserProfile';
import { useCampaignQuizData } from '../hooks/useCampaignQuizData';
import { useAmplifyClient } from '../hooks/useAmplifyClient';

import { useHeaderHeight } from '../hooks/useHeaderHeight';
import { calculateXPProgress } from '../utils/xp';

type Attrs = Partial<Record<string, string>>;

type CampaignCard = {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  order?: number | null;
  isActive?: boolean | null;
  thumbnailKey?: string | null; // stored in DB
  thumbnailUrl?: string | null; // resolved via Storage.getUrl at runtime
  isLocked: boolean;
  isCompleted: boolean;
};

type UISectionMeta = {
  id: string;
  number: number;
  title: string;
  educationalText?: string | null;
  order?: number | null;
  isActive?: boolean | null;
};

type CampaignQuestionStats = {
  totalQuestions: number;
  answeredInCampaign: number;
  percent: number; // 0..100
};

/** Local XP bar (same look as the one in UserStatsPanel) */
function XPBar({
  percent,
  label,
  fillColor = '#e7bb73',
}: {
  percent: number;
  label?: string;
  fillColor?: string;
}) {
  const { tokens } = useTheme();
  const clamped = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  const shown = Math.round(clamped);
  const barBg = tokens.colors.neutral['20'].value;
  const barHeight = '12px';
  const radius = tokens.radii.small.value;

  return (
    <div
      aria-label={label ?? 'progress'}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      style={{ width: '100%' }}
    >
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
            {label}
          </Text>
          <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
            {shown}%
          </Text>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: barHeight,
          background: barBg,
          borderRadius: radius,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            background: fillColor,
            transition: 'width 450ms ease',
          }}
        />
      </div>
    </div>
  );
}

export default function AuthenticatedContent() {
  // --- Auth state ---
  const { user, signOut, authStatus } = useAuthenticator((ctx) => [
    ctx.user,
    ctx.authStatus,
  ]);
  const userId = user?.userId ?? '';

  // --- Amplify Data client (ensures Amplify.configure ran) ---
  const client = useAmplifyClient();

  // --- Attributes (email fallback) ---
  const [attrs, setAttrs] = useState<Attrs | null>(null);
  const [attrsError, setAttrsError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    if (authStatus !== 'authenticated') {
      setAttrs(null);
      setAttrsError(null);
      return;
    }
    (async () => {
      try {
        const a = await fetchUserAttributes();
        if (mounted) setAttrs(a || {});
      } catch (e) {
        if (mounted) setAttrsError(e as Error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [authStatus]);

  const emailFromAttrs: string | null = attrs?.email ?? null;

  // --- Profile (displayName, etc.) ---
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updateDisplayName,
  } = useUserProfile(userId, emailFromAttrs);

  // --- Header spacing ---
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 50;

  // --- Level-up banner state ---
  const [showBanner, setShowBanner] = useState(true);

  // --- Celebration / toast state ---
  const [showCompletionToast, setShowCompletionToast] = useState(false);

  // --- Campaign gallery state ---
  const [campaigns, setCampaigns] = useState<CampaignCard[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [campaignsLoading, setCampaignsLoading] = useState<boolean>(true);
  const [campaignsError, setCampaignsError] = useState<Error | null>(null);

  // --- Sections for active campaign (metadata for titles/text) ---
  const [sectionsMeta, setSectionsMeta] = useState<UISectionMeta[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState<boolean>(false);
  const [sectionsError, setSectionsError] = useState<Error | null>(null);

  // --- Per-campaign question stats for gallery progress bars ---
  const [campaignStats, setCampaignStats] = useState<Record<string, CampaignQuestionStats>>({});

  // --- Quiz data (campaign-aware) ---
  const {
    questions,
    progress,
    loading: quizLoading,
    error: quizError,
    handleAnswer, // from hook
    orderedSectionNumbers,
  } = useCampaignQuizData(userId, activeCampaignId);

  // NOTE: No local adapter; we pass `handleAnswer` directly.

  // Stable safe progress for initial render
  const safeProgress = useMemo(() => {
    if (progress) return progress;
    return {
      id: 'temp',
      userId: userId || 'unknown',
      totalXP: 0,
      answeredQuestions: [] as string[],
      completedSections: [] as number[],
      dailyStreak: 0,
      lastBlazeAt: null as string | null,
    };
  }, [progress, userId]);

  // --- XP & stats ---
  const maxXP = 100;
  const currentXP = Number(safeProgress.totalXP ?? 0);
  const percentage = calculateXPProgress(currentXP, maxXP);
  const bountiesCompleted = Array.isArray(safeProgress.completedSections)
    ? safeProgress.completedSections.length
    : 0;
  const streak =
    typeof safeProgress.dailyStreak === 'number' ? safeProgress.dailyStreak : 0;

  // --- Display name ---
  const displayName = useMemo(() => {
    const fromProfile = (profile?.displayName ?? '').trim();
    if (fromProfile) return fromProfile;
    if (emailFromAttrs && emailFromAttrs.includes('@')) {
      return emailFromAttrs.split('@')[0]!;
    }
    return 'Friend';
  }, [profile?.displayName, emailFromAttrs]);

  // --- Name prompt gating ---
  const [showNameModal, setShowNameModal] = useState(false);
  const needsDisplayName = useMemo(() => {
    if (profileLoading) return false;
    const v = (profile?.displayName ?? '').trim().toLowerCase();
    return v === '' || v === 'demo user';
  }, [profile?.displayName, profileLoading]);

  useEffect(() => {
    if (!userId || authStatus !== 'authenticated') {
      setShowNameModal(false);
      return;
    }
    if (profileLoading) {
      setShowNameModal(false);
      return;
    }

    const key = `rb:namePrompted:${userId}`;
    const alreadyPrompted = localStorage.getItem(key) === '1';

    if (!alreadyPrompted && needsDisplayName) {
      setShowNameModal(true);
    } else {
      setShowNameModal(false);
    }
  }, [userId, authStatus, profileLoading, needsDisplayName]);

  async function handleSaveDisplayName(name: string) {
    await updateDisplayName(name);
    try {
      if (userId) localStorage.setItem(`rb:namePrompted:${userId}`, '1');
    } catch {
      // ignore
    }
    setShowNameModal(false);
  }

  // -------------------------
  // Load Campaigns + CampaignProgress + Thumbnails
  // -------------------------
  const resolveThumbUrl = useCallback(async (thumbnailKey?: string | null) => {
    if (!thumbnailKey) return null;
    try {
      const res = await getUrl({ key: thumbnailKey });
      return res?.url?.toString() ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (authStatus !== 'authenticated' || !userId) {
        if (alive) {
          setCampaigns([]);
          setActiveCampaignId(null);
          setCampaignsLoading(false);
          setCampaignsError(null);
          setCampaignStats({});
        }
        return;
      }

      setCampaignsLoading(true);
      setCampaignsError(null);

      try {
        // 1) Load active campaigns
        const cRes = await client.models.Campaign.list({
          filter: { isActive: { eq: true } },
          selectionSet: [
            'id',
            'slug',
            'title',
            'description',
            'order',
            'isActive',
            'thumbnailKey',
          ],
        });

        let list = (cRes.data ?? []).slice();
        list.sort((a, b) => {
          const oA = a.order ?? 0;
          const oB = b.order ?? 0;
          if (oA !== oB) return oA - oB;
          const tA = (a.title ?? '').toLowerCase();
          const tB = (b.title ?? '').toLowerCase();
          return tA.localeCompare(tB);
        });

        // 2) Load campaign progress for this user
        const pRes = await client.models.CampaignProgress.list({
          filter: { userId: { eq: userId } },
          selectionSet: ['id', 'campaignId', 'completed'],
        });
        const progMap = new Map<string, boolean>();
        for (const r of (pRes.data ?? [])) {
          if (r.campaignId) progMap.set(r.campaignId, !!r.completed);
        }

        // 3) Compute locked/unlocked chain
        const cardsBase: CampaignCard[] = list.map((c) => ({
          id: c.id,
          slug: c.slug ?? null,
          title: c.title ?? 'Untitled',
          description: c.description ?? null,
          order: c.order ?? 0,
          isActive: c.isActive ?? true,
          thumbnailKey: (c as any).thumbnailKey ?? null,
          thumbnailUrl: null,
          isLocked: true,
          isCompleted: !!progMap.get(c.id),
        }));

        for (let i = 0; i < cardsBase.length; i++) {
          if (i === 0) {
            cardsBase[i].isLocked = false; // first unlocked by default
          } else {
            const prevCompleted = cardsBase[i - 1].isCompleted === true;
            cardsBase[i].isLocked = !prevCompleted;
          }
        }

        // 4) Resolve S3 thumbnails
        const withThumbs = await Promise.all(
          cardsBase.map(async (card) => ({
            ...card,
            thumbnailUrl: await resolveThumbUrl(card.thumbnailKey),
          }))
        );

        if (alive) {
          setCampaigns(withThumbs);
          if (!activeCampaignId) {
            const firstUnlocked = withThumbs.find((c) => !c.isLocked);
            setActiveCampaignId(firstUnlocked?.id ?? null);
          }
        }
      } catch (e) {
        if (alive) setCampaignsError(e as Error);
      } finally {
        if (alive) setCampaignsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [authStatus, userId, resolveThumbUrl, client, activeCampaignId]);

  // -------------------------
  // Load Sections metadata for the active campaign
  // -------------------------
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!activeCampaignId) {
        if (alive) {
          setSectionsMeta([]);
          setSectionsLoading(false);
          setSectionsError(null);
        }
        return;
      }
      setSectionsLoading(true);
      setSectionsError(null);

      try {
        const res = await client.models.Section.list({
          filter: { campaignId: { eq: activeCampaignId } },
          selectionSet: ['id', 'number', 'title', 'educationalText', 'order', 'isActive'],
        });

        const items = (res.data ?? [])
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order ?? a.number ?? 0) - (b.order ?? b.number ?? 0))
          .map((s) => ({
            id: s.id,
            number: s.number ?? 0,
            title: s.title ?? 'Section',
            educationalText: s.educationalText ?? '',
            order: s.order ?? 0,
            isActive: s.isActive ?? true,
          })) as UISectionMeta[];

        if (alive) setSectionsMeta(items);
      } catch (e) {
        if (alive) setSectionsError(e as Error);
      } finally {
        if (alive) setSectionsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeCampaignId, client]);

  // -------------------------
  // Helpers to compute campaign question stats
  // -------------------------
  const computeCampaignStats = useCallback(
    async (campaignId: string): Promise<CampaignQuestionStats> => {
      // 1) Sections for campaign
      const sectionsRes = await client.models.Section.list({
        filter: { campaignId: { eq: campaignId }, isActive: { eq: true } },
        selectionSet: ['id', 'number', 'order', 'isActive'],
      });
      const sections = (sectionsRes.data ?? [])
        .filter((s) => s.isActive !== false)
        .sort((a, b) => (a.order ?? a.number ?? 0) - (b.order ?? b.number ?? 0));

      // 2) Question counts per section
      let totalQuestions = 0;
      for (const s of sections) {
        const qRes = await client.models.Question.list({
          filter: { sectionId: { eq: s.id }, isActive: { eq: true } },
          selectionSet: ['id'],
        });
        totalQuestions += (qRes.data ?? []).length;
      }

      // 3) SectionProgress for user -> answered IDs
      const answeredIds = new Set<string>();
      for (const s of sections) {
        const spRes = await client.models.SectionProgress.list({
          filter: { userId: { eq: userId }, sectionId: { eq: s.id } },
          selectionSet: ['answeredQuestionIds'],
        });
        for (const row of spRes.data ?? []) {
          (row.answeredQuestionIds ?? []).forEach((qid) => {
            if (qid) answeredIds.add(qid);
          });
        }
      }

      const answeredInCampaign = answeredIds.size;
      const percent =
        totalQuestions > 0 ? Math.round((answeredInCampaign / totalQuestions) * 100) : 0;

      return { totalQuestions, answeredInCampaign, percent };
    },
    [client, userId]
  );

  // -------------------------
  // Initial (or campaigns changed) — compute stats for all campaigns
  // -------------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!userId || campaigns.length === 0) {
        if (alive) setCampaignStats({});
        return;
      }
      const next: Record<string, CampaignQuestionStats> = {};
      for (const c of campaigns) {
        try {
          next[c.id] = await computeCampaignStats(c.id);
        } catch {
          next[c.id] = { totalQuestions: 0, answeredInCampaign: 0, percent: 0 };
        }
      }
      if (alive) setCampaignStats(next);
    })();
    return () => {
      alive = false;
    };
  }, [campaigns, userId, computeCampaignStats]);

  // -------------------------
  // Live updates while answering — recompute active campaign only
  // -------------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!activeCampaignId || !userId) return;
      try {
        const updated = await computeCampaignStats(activeCampaignId);
        if (alive) {
          setCampaignStats((prev) => ({ ...prev, [activeCampaignId]: updated }));
        }
      } catch {
        // keep previous on failure
      }
    })();
    // Re-run when the set of answered questions or completed sections changes
  }, [
    activeCampaignId,
    userId,
    computeCampaignStats,
    safeProgress.answeredQuestions,
    safeProgress.completedSections,
  ]);

  // -------------------------
  // Derived view state
  // -------------------------
  const mergedError =
    profileError ?? quizError ?? attrsError ?? campaignsError ?? sectionsError ?? null;
  const loading =
    campaignsLoading || (activeCampaignId ? (quizLoading || sectionsLoading) : false);

  // Click handlers
  const onSelectCampaign = useCallback((id: string, locked: boolean) => {
    if (locked) return;
    setActiveCampaignId(id);
  }, []);

  // -------------------------
  // INSTANT UNLOCK + TOAST
  // -------------------------
  useEffect(() => {
    if (!activeCampaignId) return;
    if (orderedSectionNumbers.length === 0) return;

    const allDone = orderedSectionNumbers.every((n) =>
      safeProgress.completedSections.includes(n)
    );
    if (!allDone) return;

    setCampaigns((prev) => {
      const idx = prev.findIndex((c) => c.id === activeCampaignId);
      if (idx === -1) return prev;

      // If already marked completed, nothing to do
      if (prev[idx].isCompleted) return prev;

      const next = prev.map((c) => ({ ...c }));
      next[idx].isCompleted = true;

      // Unlock the next campaign (by current gallery order), if any
      if (idx + 1 < next.length && next[idx + 1].isLocked) {
        next[idx + 1].isLocked = false;
      }

      // 🎉 Trigger toast/celebration for 3 seconds
      setShowCompletionToast(true);
      setTimeout(() => setShowCompletionToast(false), 3000);

      return next;
    });
  }, [activeCampaignId, orderedSectionNumbers, safeProgress.completedSections]);

  // --- Guard: only render for authenticated users ---
  if (authStatus !== 'authenticated') {
    return null;
  }

  // --- Rendering helpers ---
  const renderCampaignGallery = () => {
    return (
      <div style={{ padding: `0 ${spacing}px`, marginBottom: 16 }}>
        <Heading level={3} style={{ margin: '8px 0 12px 0', fontWeight: 500 }}>
          Campaigns
        </Heading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
            maxHeight: 260,
            overflowY: 'auto',
            paddingRight: 6,
          }}
        >
          {campaigns.map((c) => {
            const isActive = activeCampaignId === c.id;
            const border = isActive ? '2px solid #4F46E5' : '1px solid #E5E7EB';
            const opacity = c.isLocked ? 0.55 : 1;
            const cursor = c.isLocked ? 'not-allowed' : 'pointer';

            const stats = campaignStats[c.id] ?? {
              totalQuestions: 0,
              answeredInCampaign: 0,
              percent: 0,
            };

            return (
              <div
                key={c.id}
                onClick={() => onSelectCampaign(c.id, c.isLocked)}
                role="button"
                aria-disabled={c.isLocked}
                style={{
                  border,
                  borderRadius: 12,
                  padding: 12,
                  background: '#fff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  opacity,
                  cursor,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    background: '#F3F4F6',
                    overflow: 'hidden',
                    flex: '0 0 auto',
                    filter: c.isLocked ? 'grayscale(80%) brightness(0.9)' : 'none',
                  }}
                >
                  {c.thumbnailUrl ? (
                    <img
                      src={c.thumbnailUrl}
                      alt={c.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#6B7280',
                      }}
                    >
                      No Image
                    </div>
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
                  {c.description && (
                    <div
                      style={
                        {
                          fontSize: 12,
                          color: '#4B5563',
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        } as React.CSSProperties
                      }
                    >
                      {c.description}
                    </div>
                  )}

                  {/* Per-campaign progress bar */}
                  <div style={{ marginTop: 8 }}>
                    <XPBar percent={stats.percent} label="Campaign progress" />
                    <div style={{ marginTop: 6, fontSize: 12, color: '#4B5563' }}>
                      {stats.answeredInCampaign} / {stats.totalQuestions} questions
                    </div>
                  </div>

                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    {c.isCompleted ? '✅ Completed' : c.isLocked ? '🔒 Locked' : '🟢 Available'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header
        ref={headerRef}
        signOut={signOut}
        currentXP={currentXP}
        maxXP={maxXP}
        bountiesCompleted={bountiesCompleted}
        streakDays={streak}
      />

      <main>
        {showBanner && (
          <div style={{ padding: '0 50px' }}>
            <LevelUpBanner
              currentXP={currentXP}
              maxXP={maxXP}
              onDismiss={() => setShowBanner(false)}
            />
          </div>
        )}

        {/* Celebration Toast */}
        {showCompletionToast && (
          <div
            style={{
              background: '#e7bb73',
              color: '#1f2937',
              padding: '12px 20px',
              borderRadius: 8,
              position: 'relative',
              margin: '0 auto 16px auto',
              textAlign: 'center',
              maxWidth: 420,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            🎉 Campaign Completed! The next one is now unlocked.
          </div>
        )}

        {mergedError && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'fixed',
              top: headerHeight + 12,
              right: 12,
              zIndex: 1100,
              background: '#FDEAEA',
              color: '#7A2525',
              border: '1px solid #F5C2C2',
              borderRadius: 10,
              padding: '12px 16px',
              maxWidth: 'min(520px, 90vw)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
            }}
          >
            <strong>Something went wrong:</strong>{' '}
            {String((mergedError as any)?.message ?? mergedError)}
          </div>
        )}

        {/* Greeting */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            paddingLeft: spacing,
            marginBottom: 12,
          }}
        >
          <Heading level={2} style={{ margin: 0, fontWeight: 500 }}>
            Hey {displayName}! Let&apos;s jump in.
          </Heading>
        </div>

        {/* Campaign gallery */}
        {renderCampaignGallery()}

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Left column: Sections + Questions */}
          <div style={{ flex: 1, paddingLeft: spacing, paddingRight: spacing }}>
            {loading ? (
              <div>Loading…</div>
            ) : !activeCampaignId ? (
              <div style={{ padding: '16px 0' }}>
                Select a campaign from the gallery to begin.
              </div>
            ) : (
              sectionsMeta.map((sec, index) => {
                const secQuestions = (questions ?? []).filter(
                  (q) => q.section === sec.number
                );

                // Unlock rule: ALL_PREV_CORRECT (chain within campaign)
                const prevNumbers = orderedSectionNumbers.filter((n) => n < sec.number);
                const prevComplete =
                  index === 0
                    ? true
                    : prevNumbers.every((n) => safeProgress.completedSections.includes(n));

                const isLocked = !prevComplete;
                const initialOpen = index === 0;

                return (
                  <QuizSection
                    key={sec.id}
                    title={sec.title}
                    educationalText={sec.educationalText ?? ''}
                    questions={secQuestions}
                    progress={safeProgress}
                    handleAnswer={handleAnswer}
                    isLocked={isLocked}
                    initialOpen={initialOpen}
                  />
                );
              })
            )}
          </div>

          {/* Right column: Stats panel */}
          <UserStatsPanel
            user={{
              username: user?.username,
              attributes: {
                name: displayName,
                email: emailFromAttrs ?? undefined,
              },
            }}
            currentXP={currentXP}
            maxXP={maxXP}
            percentage={percentage}
            headerHeight={headerHeight}
            spacing={spacing}
          />
        </div>

        {/* Name modal */}
        {showNameModal && (
          <SetDisplayNameModal loading={profileLoading} onSubmit={handleSaveDisplayName} />
        )}
      </main>
    </>
  );
}





























































