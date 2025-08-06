// src/pages/AuthenticatedContent.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuthenticator, Heading } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { Header } from '../components/Header';
import { QuizSection } from '../components/QuizSection';
import LevelUpBanner from '../components/LevelUpBanner';
import UserStatsPanel from '../components/UserStatsPanel';
import { SetDisplayNameModal } from '../components/SetDisplayNameModal';

import { useQuizData } from '../hooks/useQuizData';
import { useUserProfile } from '../hooks/useUserProfile';

import { sections } from '../constants/sections';
import { useHeaderHeight } from '../hooks/useHeaderHeight';
import { calculateXPProgress } from '../utils/xp';

type Attrs = Partial<Record<string, string>>;

export default function AuthenticatedContent() {
  // --------------------------
  // Auth state (Amplify v6)
  // --------------------------
  const { user, signOut, authStatus } = useAuthenticator((ctx) => [
    ctx.user,
    ctx.authStatus,
  ]);
  const userId = user?.userId ?? '';

  // --------------------------
  // Attributes (email fallback)
  // --------------------------
  const [attrs, setAttrs] = useState<Attrs | null>(null);
  const [attrsError, setAttrsError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    // Always run this effect in the same order; bail out inside without returning component early
    if (authStatus !== 'authenticated') {
      if (mounted) {
        setAttrs(null);
        setAttrsError(null);
      }
      return () => {
        mounted = false;
      };
    }

    (async () => {
      try {
        const a = await fetchUserAttributes(); // v6 API
        if (mounted) setAttrs(a || {});
      } catch (e) {
        if (mounted) setAttrsError(e as Error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authStatus]);

  const emailFromAttrs = attrs?.email ?? null;

  // --------------------------
  // Profile
  // --------------------------
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updateDisplayName,
  } = useUserProfile(userId, emailFromAttrs);

  // --------------------------
  // Quiz data (questions & progress)
  // --------------------------
  const {
    questions,
    progress,
    loading: quizLoading,
    error: quizError,
    handleAnswer,
  } = useQuizData(userId);

  // --------------------------
  // Header spacing
  // --------------------------
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 50;

  // --------------------------
  // Level-up banner state
  // --------------------------
  const [showBanner, setShowBanner] = useState(true);

  // --------------------------
  // Safe progress & questions
  // --------------------------
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

  const safeQuestions = Array.isArray(questions) ? questions : [];

  // --------------------------
  // XP & stats
  // --------------------------
  const maxXP = 100;
  const currentXP = Number(safeProgress.totalXP ?? 0);
  const percentage = calculateXPProgress(currentXP, maxXP);
  const bountiesCompleted = Array.isArray(safeProgress.completedSections)
    ? safeProgress.completedSections.length
    : 0;
  const streak =
    typeof safeProgress.dailyStreak === 'number' ? safeProgress.dailyStreak : 0;

  // --------------------------
  // Display name (profile > email local-part > fallback)
  // --------------------------
  const displayName = useMemo(() => {
    const fromProfile = (profile?.displayName ?? '').trim();
    if (fromProfile) return fromProfile;
    if (emailFromAttrs && emailFromAttrs.includes('@')) {
      return emailFromAttrs.split('@')[0];
    }
    return 'Friend';
  }, [profile?.displayName, emailFromAttrs]);

  // --------------------------
  // Name prompt gating
  // --------------------------
  const [showNameModal, setShowNameModal] = useState(false);

  const needsDisplayName = useMemo(() => {
    if (profileLoading) return false; // still unknown → don't show yet
    const v = (profile?.displayName ?? '').trim().toLowerCase();
    return v === '' || v === 'demo user';
  }, [profile?.displayName, profileLoading]);

  useEffect(() => {
    // Do not conditionally skip this hook; gate inside the effect body
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

  const handleSaveDisplayName = useCallback(
    async (name: string) => {
      await updateDisplayName(name);
      try {
        if (userId) localStorage.setItem(`rb:namePrompted:${userId}`, '1');
      } catch {
        // ignore storage failures
      }
      setShowNameModal(false);
    },
    [updateDisplayName, userId]
  );

  // --------------------------
  // Back-compat: handleAnswer signature bridge
  // --------------------------
  const submitAnswer = useCallback(
    async (args: { questionId: string; isCorrect: boolean; xp?: number }) => {
      const fn: any = handleAnswer as any;
      if (typeof fn !== 'function') return;

      // If it accepts one arg, assume the new shape ({ questionId, isCorrect, xp? })
      if (fn.length <= 1) return fn(args);

      // Otherwise call legacy signature (questionId, userAnswer, correctAnswer, xpValue)
      const ua = args.isCorrect ? 'correct' : 'incorrect';
      const ca = args.isCorrect ? 'correct' : 'incorrect';
      return fn(args.questionId, ua, ca, args.xp ?? 0);
    },
    [handleAnswer]
  );

  // --------------------------
  // Merge errors for small toast
  // --------------------------
  const mergedError = profileError ?? quizError ?? attrsError ?? null;
  const loading = quizLoading;

  // --------------------------
  // Render (single return; gate content inside JSX)
  // --------------------------
  return (
    <>
      {/* Header is present but can show minimal info when not authenticated */}
      <Header
        ref={headerRef}
        signOut={signOut}
        currentXP={currentXP}
        maxXP={maxXP}
        bountiesCompleted={bountiesCompleted}
        streakDays={streak}
      />

      {/* Only render the authed UI when authenticated */}
      {authStatus === 'authenticated' && (
        <main>
          {/* Banner sits below the header thanks to main's padding in App.css */}
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

          {/* Greeting heading aligned with left content */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              paddingLeft: 50,
              marginBottom: 20,
            }}
          >
            <Heading
              level={2}
              style={{
                margin: 0,
                fontWeight: 500,
              }}
            >
              Hey {displayName}! Let&apos;s jump in.
            </Heading>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, paddingLeft: 50, paddingRight: 50 }}>
              {loading ? (
                <div>Loading…</div>
              ) : (
                sections.map((sec, index) => {
                  const secQuestions = safeQuestions.filter(
                    (q) => q.section === sec.number
                  );

                  // Robust previous-section completion:
                  const prevSectionNumbers = sections
                    .slice(0, index)
                    .map((s) => s.number);
                  const prevSectionQuestions = safeQuestions.filter((q) =>
                    prevSectionNumbers.includes(q.section)
                  );
                  const prevComplete =
                    index === 0
                      ? true
                      : prevSectionQuestions.length > 0 &&
                        prevSectionQuestions.every((q) =>
                          safeProgress.answeredQuestions?.includes(q.id)
                        );

                  const isLocked = !prevComplete;
                  const initialOpen = index === 0;

                  return (
                    <QuizSection
                      key={sec.number}
                      title={sec.title ?? `Section ${sec.number}`}
                      educationalText={sec.educationalText ?? ''}
                      sectionNumber={sec.number}
                      questions={secQuestions}
                      progress={safeProgress}
                      handleAnswer={submitAnswer}
                      isLocked={isLocked}
                      initialOpen={initialOpen}
                    />
                  );
                })
              )}
            </div>

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
              spacing={50}
            />
          </div>

          {/* Name modal: shown only after profileLoading has settled, and only if not prompted before */}
          {showNameModal && (
            <SetDisplayNameModal
              loading={profileLoading}
              onSubmit={handleSaveDisplayName}
            />
          )}
        </main>
      )}
    </>
  );
}



















































