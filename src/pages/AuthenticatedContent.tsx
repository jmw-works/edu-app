// src/pages/AuthenticatedContent.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuthenticator, Heading, Text, useTheme } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

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

import type { HandleAnswer, Question } from '../types/QuestionTypes';

export default function AuthenticatedContent() {
  const { user, signOut, authStatus } = useAuthenticator((ctx) => [ctx.user, ctx.authStatus]);
  const userId = user?.userId ?? '';
  const client = useAmplifyClient();

  const [attrs, setAttrs] = useState<Record<string, string> | null>(null);
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
        if (mounted) setAttrs((a ?? {}) as Record<string, string>);

      } catch (e) {
        if (mounted) setAttrsError(e as Error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [authStatus]);

  const emailFromAttrs: string | null = attrs?.email ?? null;

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updateDisplayName,
  } = useUserProfile(userId, emailFromAttrs);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 50;

  const [showBanner, setShowBanner] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  const {
    questions,
    progress,
    loading: quizLoading,
    error: quizError,
    handleAnswer,
    orderedSectionNumbers,
  } = useCampaignQuizData(userId, activeCampaignId);

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

  const maxXP = 100;
  const currentXP = safeProgress.totalXP;
  const percentage = calculateXPProgress(currentXP, maxXP);
  const bountiesCompleted = safeProgress.completedSections?.length ?? 0;
  const streak = safeProgress.dailyStreak ?? 0;

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
    } catch {}
    setShowNameModal(false);
  }

  const mergedError = profileError ?? quizError ?? attrsError ?? null;
  const loading = quizLoading;

  const onSelectCampaign = useCallback((id: string, locked: boolean) => {
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

        <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: spacing, marginBottom: 12 }}>
          <Heading level={2}>Hey {displayName}! Let&apos;s jump in.</Heading>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingLeft: spacing, paddingRight: spacing }}>
            {loading || !activeCampaignId ? (
              <div style={{ padding: '16px 0' }}>
                {loading ? 'Loading…' : 'Select a campaign from the gallery to begin.'}
              </div>
            ) : (
              questions.map((question) => (
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
              ))
            )}
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
