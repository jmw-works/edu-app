// src/pages/AuthenticatedContent.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Heading } from '@aws-amplify/ui-react';

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
  const { user, signOut } = useAuthenticator(); // v6: user.userId, user.username
  const [attrs, setAttrs] = useState<Attrs | null>(null);
  const [attrsError, setAttrsError] = useState<Error | null>(null);

  // Fetch Cognito attributes (email for fallback display name)
  useEffect(() => {
    let mounted = true;
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
  }, []);

  const userId = user?.userId ?? '';
  const emailFromAttrs = attrs?.email ?? null;

  // Profile (Amplify Data)
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updateDisplayName,
  } = useUserProfile(userId, emailFromAttrs);

  // Quiz data (questions + progress + answer handler)
  const {
    questions,
    progress,             // may be null while loading/first run
    loading: quizLoading,
    error: quizError,
    handleAnswer,         // could be new or legacy signature
  } = useQuizData(userId);

  // Header sizing
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 50;

  // Level-up banner (simple show/hide)
  const [showBanner, setShowBanner] = useState(true);

  // Build a type-safe fallback progress object to satisfy QuizSection prop types
  const safeProgress = useMemo(() => {
    if (progress) return progress;
    return {
      id: 'temp-progress',
      userId: userId || 'unknown',
      totalXP: 0,
      answeredQuestions: [] as string[],
      completedSections: [] as number[],
      dailyStreak: 0,
      lastBlazeAt: null as string | null,
    } as const;
  }, [progress, userId]);

  // Normalize questions list
  const safeQuestions = Array.isArray(questions) ? questions : [];

  // XP math
  const maxXP = 100;
  const currentXP = Number(safeProgress.totalXP ?? 0);
  const percentage = calculateXPProgress(currentXP, maxXP);

  // Header stats
  const bountiesCompleted = Array.isArray(safeProgress.completedSections)
    ? safeProgress.completedSections.length
    : 0;
  const streak = typeof safeProgress.dailyStreak === 'number'
    ? safeProgress.dailyStreak
    : 0;

  // Compute display name shown in UI
  const displayName = useMemo(() => {
    if (profile?.displayName && profile.displayName.trim().length > 0) {
      return profile.displayName.trim();
    }
    if (emailFromAttrs && emailFromAttrs.includes('@')) {
      return emailFromAttrs.split('@')[0];
    }
    return 'Friend';
  }, [profile?.displayName, emailFromAttrs]);

  // ---------- Name prompt logic (show once, and also when seeded/blank) ----------
  function needsDisplayNamePrompt(p?: { displayName?: string | null } | null) {
    const v = (p?.displayName ?? '').trim().toLowerCase();
    return v === '' || v === 'demo user';
  }

  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    if (!userId) return;          // wait for auth
    if (profileLoading) return;   // wait for profile load to settle

    const promptedKey = `tg:namePrompted:${userId}`;
    const alreadyPrompted = localStorage.getItem(promptedKey) === '1';

    if (!alreadyPrompted && (!profile || needsDisplayNamePrompt(profile))) {
      setShowNameModal(true);
    } else {
      setShowNameModal(false);
    }
  }, [userId, profileLoading, profile]);

  async function handleSaveDisplayName(name: string) {
    await updateDisplayName(name);
    try {
      if (userId) localStorage.setItem(`tg:namePrompted:${userId}`, '1');
    } catch {
      // ignore storage errors (private mode, etc.)
    }
    setShowNameModal(false);
  }
  // ------------------------------------------------------------------------------

  // --- TEMP SHIM: support either new or legacy handleAnswer signatures ---
  // New expected signature: ({ questionId, isCorrect, xp? })
  // Legacy signature: (questionId, userAnswer, correctAnswer, xpValue)
  const submitAnswer = async (args: { questionId: string; isCorrect: boolean; xp?: number }) => {
    const fn: any = handleAnswer as any;
    if (typeof fn !== 'function') return;

    // If function arity <= 1, assume new shape and pass the object
    if (fn.length <= 1) {
      return fn(args);
    }

    // Otherwise, call legacy signature (fill strings as needed)
    const userAns = args.isCorrect ? 'correct' : 'incorrect';
    const correctAns = args.isCorrect ? 'correct' : 'incorrect';
    return fn(args.questionId, userAns, correctAns, args.xp ?? 0);
  };
  // -----------------------------------------------------------------------

  const mergedError = profileError ?? quizError ?? attrsError ?? null;
  const loading = quizLoading;

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

      {/* Level-up banner (banner handles header offset internally; we only add horizontal padding) */}
      {showBanner && (
        <div style={{ padding: '0 50px' }}>
          <LevelUpBanner
            currentXP={currentXP}
            maxXP={maxXP}
            onDismiss={() => setShowBanner(false)}
          />
        </div>
      )}

      {/* Non-blocking error (still shows the page) */}
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
      <div style={{ padding: spacing }}>
        <Heading level={2}>Hey {displayName}! Let&apos;s jump in.</Heading>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, paddingLeft: spacing, paddingRight: spacing }}>
          {loading ? (
            <div>Loading…</div>
          ) : (
            sections.map((sec, index) => {
              const secQuestions = safeQuestions.filter((q) => q.section === sec.number);

              const prevComplete =
                index === 0 ||
                sections
                  .slice(0, index)
                  .every((s) =>
                    safeQuestions
                      .filter((q) => q.section === s.number)
                      .every((q) => safeProgress.answeredQuestions?.includes(q.id)),
                  );

              const isLocked = !prevComplete;
              const initialOpen = index === 0;

              return (
                <QuizSection
                  key={sec.number}
                  title={sec.title}
                  educationalText={sec.educationalText}
                  sectionNumber={sec.number}
                  questions={secQuestions}
                  progress={safeProgress}
                  handleAnswer={submitAnswer}  // <-- use shim
                  isLocked={isLocked}
                  initialOpen={initialOpen}
                />
              );
            })
          )}
        </div>

        {/* Right rail stats */}
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

      {/* Display Name Modal (first-time users or seeded/blank names) */}
      {showNameModal && (
        <SetDisplayNameModal
          loading={profileLoading}
          onSubmit={handleSaveDisplayName}
        />
      )}
    </>
  );
}

















































