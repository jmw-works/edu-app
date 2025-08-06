// src/pages/AuthenticatedContent.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  useAuthenticator,
  Heading,
  Text,
  useTheme,
  Card,
} from '@aws-amplify/ui-react';
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

type CampaignCard = {
  id: string;
  title: string;
  description?: string | null;
  thumbnailKey?: string | null;
  isLocked?: boolean;
};

export default function AuthenticatedContent() {
  const { user, signOut, authStatus } = useAuthenticator((ctx) => [
    ctx.user,
    ctx.authStatus,
  ]);
  const userId = user?.userId ?? '';
  const { tokens } = useTheme();
  const client = useAmplifyClient();

  const [attrs, setAttrs] = useState<Record<string, string> | null>(null);
  const [attrsError, setAttrsError] = useState<Error | null>(null);

  const [campaigns, setCampaigns] = useState<CampaignCard[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
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
  } = useCampaignQuizData(userId, activeCampaignId);

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
    const exampleCampaigns: CampaignCard[] = [
      {
        id: 'demo-campaign-1',
        title: 'Treasure Hunt Basics',
        description: 'Learn the basics of treasure hunting.',
        thumbnailKey: 'thumbnails/campaign1.png',
        isLocked: false,
      },
      {
        id: 'demo-campaign-2',
        title: 'Advanced Clue Solving',
        description: 'Put your clue-decoding skills to the test.',
        thumbnailKey: 'thumbnails/campaign2.png',
        isLocked: false,
      },
      {
        id: 'demo-campaign-3',
        title: 'Legendary Bounty',
        description: 'A mythical treasure awaits the worthy.',
        thumbnailKey: 'thumbnails/campaign3.png',
        isLocked: true,
      },
    ];
    setCampaigns(exampleCampaigns);
  }, []);

  useEffect(() => {
    async function fetchThumbnails() {
      const urls: Record<string, string> = {};
      await Promise.all(
        campaigns.map(async (campaign) => {
          if (campaign.thumbnailKey) {
            try {
              const { url } = await getUrl({ key: campaign.thumbnailKey });
              urls[campaign.id] = url.href;
            } catch {
              urls[campaign.id] = '';
            }
          }
        })
      );
      setThumbnails(urls);
    }

    if (campaigns.length) {
      fetchThumbnails();
    }
  }, [campaigns]);

  const displayName = useMemo(() => {
    const fromProfile = (profile?.displayName ?? '').trim();
    if (fromProfile) return fromProfile;
    if (emailFromAttrs && emailFromAttrs.includes('@')) {
      return emailFromAttrs.split('@')[0]!;
    }
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
            <div style={{ width: 130, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {campaigns.map((campaign) => {
                const isLocked = campaign.isLocked;
                const imgUrl = thumbnails[campaign.id];

                return (
                  <div
                    key={campaign.id}
                    onClick={() => onSelectCampaign(campaign.id, isLocked)}
                    style={{
                      opacity: isLocked ? 0.4 : 1,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                    title={campaign.description || ''}
                  >
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        alt={campaign.title}
                        width={100}
                        height={100}
                        style={{
                          objectFit: 'contain',
                          marginBottom: 8,
                        }}
                      />
                    )}
                    <Text fontSize="0.75rem">{campaign.title}</Text>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ flex: 2 }}>
            <div style={{ marginBottom: 16 }}>
              <Heading level={2}>Hey {displayName}! Let&apos;s jump in.</Heading>
            </div>
            {activeCampaignId && questions.map((question) => (
              <QuizSection
                key={question.id}
                title={`Section ${question.section}`}
                educationalText=""
                questions={[question]}
                progress={safeProgress}
                handleAnswer={handleAnswer}
                isLocked={false}
                initialOpen={true}
              />
            ))}
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





