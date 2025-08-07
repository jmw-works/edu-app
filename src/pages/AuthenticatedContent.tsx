import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  useAuthenticator,
  Heading,
  Text,
  useTheme,
} from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

import { Header } from '../components/Header';
import QuizSection from '../components/QuizSection';
import LevelUpBanner from '../components/LevelUpBanner';
import UserStatsPanel from '../components/UserStatsPanel';
import { SetDisplayNameModal } from '../components/SetDisplayNameModal';

import { useUserProfile } from '../hooks/useUserProfile';
import { useCampaignQuizData } from '../hooks/useCampaignQuizData';
import { useHeaderHeight } from '../hooks/useHeaderHeight';
import { calculateXPProgress } from '../utils/xp';

const THUMBNAIL_BASE_URL =
  'https://amplify-dg9xethdak0e7-mai-amplifydataamplifycodege-5wzlzqzwsqsa.s3.us-west-1.amazonaws.com/public/thumbnails';

const client = generateClient<Schema>();

export default function AuthenticatedContent() {
  const { user, signOut, authStatus } = useAuthenticator((ctx) => [
    ctx.user,
    ctx.authStatus,
  ]);
  const userId = user?.userId ?? '';
  const { tokens } = useTheme();

  const [attrs, setAttrs] = useState<Record<string, string> | null>(null);
  const [attrsError, setAttrsError] = useState<Error | null>(null);

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 50;

  const {
    questions,
    progress,
    loading: quizLoading,
    error: quizError,
    handleAnswer,
    orderedSectionNumbers,
    } = useCampaignQuizData(userId, activeCampaignId);
  const { sectionTextByNumber } = useCampaignQuizData(userId, activeCampaignId);


  const emailFromAttrs: string | null = attrs?.email ?? null;

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updateDisplayName,
  } = useUserProfile(userId, emailFromAttrs);

  useEffect(() => {
    let mounted = true;
    if (authStatus !== 'authenticated') return;

    fetchUserAttributes()
      .then((a) => mounted && setAttrs((a ?? {}) as Record<string, string>))
      .catch((e) => mounted && setAttrsError(e as Error));

    return () => {
      mounted = false;
    };
  }, [authStatus]);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const { data, errors } = await client.models.Campaign.list({
          filter: { isActive: { eq: true } },
        });

        if (errors) console.error('Campaign list errors:', errors);

        const parsed = (data ?? []).map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description ?? '',
          thumbnailFile: c.thumbnailKey ?? '',
          isLocked: false,
        }));

        setCampaigns(parsed);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
      }
    }

    if (authStatus === 'authenticated') {
      loadCampaigns();
    }
  }, [authStatus]);

  const displayName = useMemo(() => {
    const fromProfile = (profile?.displayName ?? '').trim();
    if (fromProfile) return fromProfile;
    if (emailFromAttrs?.includes('@')) return emailFromAttrs.split('@')[0]!;
    return 'Friend';
  }, [profile?.displayName, emailFromAttrs]);

  const needsDisplayName = useMemo(() => {
    if (profileLoading) return false;
    const v = (profile?.displayName ?? '').trim().toLowerCase();
    return v === '' || v === 'demo user';
  }, [profile?.displayName, profileLoading]);

  useEffect(() => {
    if (!userId || authStatus !== 'authenticated') return setShowNameModal(false);
    if (profileLoading) return setShowNameModal(false);
    const key = `rb:namePrompted:${userId}`;
    const alreadyPrompted = localStorage.getItem(key) === '1';
    setShowNameModal(!alreadyPrompted && needsDisplayName);
  }, [userId, authStatus, profileLoading, needsDisplayName]);

  async function handleSaveDisplayName(name: string) {
    await updateDisplayName(name);
    if (userId) localStorage.setItem(`rb:namePrompted:${userId}`, '1');
    setShowNameModal(false);
  }

  const safeProgress = useMemo(() => {
    if (progress) return progress;
    return {
      id: 'temp',
      userId: userId || 'unknown',
      totalXP: 0,
      answeredQuestions: [],
      completedSections: [],
      dailyStreak: 0,
      lastBlazeAt: null,
    };
  }, [progress, userId]);

  const currentXP = safeProgress.totalXP;
  const maxXP = 100;
  const percentage = calculateXPProgress(currentXP, maxXP);
  const bountiesCompleted = safeProgress.completedSections?.length ?? 0;
  const streak = safeProgress.dailyStreak ?? 0;

  const mergedError = profileError ?? quizError ?? attrsError ?? null;

  const onSelectCampaign = useCallback((id: string, locked?: boolean) => {
    if (locked) return;
    setActiveCampaignId(id);
  }, []);

  const groupedBySection = useMemo(() => {
    const map = new Map<number, ReturnType<typeof questions.filter>>();
    for (const q of questions) {
      const list = map.get(q.section) ?? [];
      map.set(q.section, [...list, q]);
    }
    return map;
  }, [questions]);

  if (authStatus !== 'authenticated') return null;

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

        {mergedError && (
          <div style={{ position: 'fixed', top: headerHeight + 12, right: 12 }}>
            <strong>Something went wrong:</strong> {String(mergedError?.message ?? mergedError)}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: `0 ${spacing}px` }}>
          {!activeCampaignId && (
            <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {campaigns.length > 0 ? (
  campaigns.map((campaign) => {
    const imgUrl = campaign.thumbnailFile
      ? `${THUMBNAIL_BASE_URL}/${campaign.thumbnailFile}`
      : '';
    return (
      <div
        key={campaign.id}
        onClick={() => onSelectCampaign(campaign.id, campaign.isLocked)}
        style={{
          opacity: campaign.isLocked ? 0.4 : 1,
          cursor: campaign.isLocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
        title={campaign.description || ''}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={campaign.title}
            width={200}
            height={200}
            style={{ objectFit: 'contain', marginBottom: 12 }}
          />
        ) : (
          <div style={{ width: 180, height: 200, background: '#eee', marginBottom: 12 }} />
        )}
        <Text fontSize="1rem">{campaign.title}</Text>
      </div>
    );
  })
) : (
  ['campaign1.png', 'campaign2.png', 'campaign3.png'].map((filename, idx) => (
    <div
      key={`fallback-${idx}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'default',
      }}
    >
      <img
        src={`/${filename}`}
        alt={`Fallback ${idx + 1}`}
        width={200}
        height={200}
        style={{ objectFit: 'contain', marginBottom: 12 }}
      />
      <Text fontSize="1rem" color="#888">
        Coming Soon
      </Text>
    </div>
  ))
)}

            </div>
          )}

          <div style={{ flex: 2 }}>
  <div style={{ marginBottom: 16, textAlign: 'center' }}>
    <Heading level={2}>Hey {displayName}! Let&apos;s jump in.</Heading>
    <Text fontSize="1rem" style={{ marginTop: 8, color: '#444' }}>
      Discover a world of learning and adventure as you hone your treasure hunting skills.
    </Text>
    <img
      src="/adventure_is_out_there.png"
      alt="Adventure is out there"
      style={{
        marginTop: 24,
        width: '85%', // 15% smaller than full width
        maxWidth: 600,
        height: 'auto',
      }}
    />
  </div>



            {activeCampaignId &&
              orderedSectionNumbers.map((sectionNum, idx) => {
                const questionsInSection = groupedBySection.get(sectionNum) ?? [];
                const isLocked = safeProgress.completedSections.includes(sectionNum) === false &&
                                 sectionNum !== orderedSectionNumbers[0] &&
                                 !safeProgress.completedSections.includes(orderedSectionNumbers[idx - 1]);

                return (
                  <QuizSection
                    key={`sec-${sectionNum}`}
                    title={`Section ${sectionNum}`}
                    educationalText={sectionTextByNumber.get(sectionNum) ?? ''}
                    questions={questionsInSection}
                    progress={safeProgress}
                    handleAnswer={handleAnswer}
                    isLocked={isLocked}
                    initialOpen={idx === 0}
                  />
                );
              })}
          </div>

          <UserStatsPanel
            user={{
              username: user?.username,
              attributes: { name: displayName, email: emailFromAttrs ?? undefined },
            }}
            currentXP={currentXP}
            maxXP={maxXP}
            percentage={percentage}
            headerHeight={headerHeight}
            spacing={spacing}
          />
        </div>

        {showNameModal && (
          <SetDisplayNameModal loading={profileLoading} onSubmit={handleSaveDisplayName} />
        )}
      </main>
    </>
  );
}








