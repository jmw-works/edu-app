// src/pages/AuthenticatedContent.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '../components/Header';
import { QuizSection } from '../components/QuizSection';
import { useQuizData } from '../hooks/useQuizData';
import { sections } from '../constants/sections';
import { useHeaderHeight } from '../hooks/useHeaderHeight';
import { calculateXPProgress } from '../utils/xp';
import LevelUpBanner from '../components/LevelUpBanner';
import UserStatsPanel from '../components/UserStatsPanel';
import SetNameForm from '../components/SetNameForm';
import { Flex, Heading, Text } from '@aws-amplify/ui-react';
import { useUserProfile } from '../hooks/useUserProfile';

interface AuthenticatedContentProps {
  user: {
    userId: string;
    username?: string;
    attributes: {
      [key: string]: unknown;
      name?: string;
      email?: string;
    };
  };
  signOut?: () => void;
  attrsError?: Error | null;
}

export default function AuthenticatedContent({
  user,
  signOut,
  attrsError,
}: AuthenticatedContentProps) {
  const { questions, progress, handleAnswer } = useQuizData(user.userId);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const [showBanner, setShowBanner] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);

  const email =
    (user.attributes?.email as string | undefined) ??
    (user as any)?.signInDetails?.loginId ??
    undefined;

  const {
    profile,
    loading: profileLoading,
    updateDisplayName,
    error: profileError,
  } = useUserProfile(user.userId, email);

  const mergedError = profileError ?? attrsError ?? null;

  useEffect(() => {
    setErrorVisible(!!mergedError);
  }, [mergedError]);

  const safeProgress = progress ?? { totalXP: 0, answeredQuestions: [] as string[] };
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const maxXP = 100;
  const currentXP = Number(safeProgress.totalXP ?? 0);
  const percentage = calculateXPProgress(currentXP, maxXP);

  const sectionCompletions = useMemo(() => {
    return sections.map((sec) => {
      const secQuestions = safeQuestions.filter((q) => q.section === sec.number);
      return (
        secQuestions.length === 0 ||
        secQuestions.every((q) => safeProgress.answeredQuestions?.includes(q.id))
      );
    });
  }, [safeQuestions, safeProgress.answeredQuestions]);

  const displayName = profile?.displayName ?? '';
  const needsDisplayName = !displayName && !profileLoading;

  return (
    <>
      <Header ref={headerRef} signOut={signOut} />

      {showBanner && (
        <LevelUpBanner
          currentXP={currentXP}
          maxXP={maxXP}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {errorVisible && mergedError && (
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
            border: '1px solid #F5C2C2', // <-- fixed
            borderRadius: 10,
            padding: '12px 16px',
            maxWidth: 'min(520px, 90vw)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span aria-hidden="true" style={{ fontWeight: 700 }}>!</span>
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>
                Something went wrong
              </strong>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {String((mergedError as any)?.message ?? mergedError)}
              </div>
            </div>
            <button
              aria-label="Dismiss error"
              onClick={() => setErrorVisible(false)}
              style={{
                border: 0,
                background: 'transparent',
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
                color: '#7A2525',
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Flex direction={{ base: 'column', large: 'row' }} alignItems={{ large: 'flex-start' }}>
        <Flex direction="column" flex="1" padding={50} gap="1rem">
          <Heading level={2}>
            {profileLoading ? 'Loading your workspace…' : `Hey ${displayName || 'there'}! Let’s jump in.`}
          </Heading>
          {profileLoading && (
            <Text color="var(--amplify-colors-neutral-60)">
              Getting your profile ready. You can still browse sections below.
            </Text>
          )}

          {sections.map((sec, index) => {
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
                handleAnswer={handleAnswer}
                isLocked={isLocked}
                initialOpen={initialOpen}
              />
            );
          })}
        </Flex>

        <UserStatsPanel
          user={{
            username: user.username,
            attributes: {
              ...user.attributes,
              name: displayName || (user.attributes?.name as string | undefined),
            },
          }}
          currentXP={currentXP}
          maxXP={maxXP}
          percentage={percentage}
          headerHeight={headerHeight}
          spacing={50}
        />
      </Flex>

      {needsDisplayName && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Choose a display name"
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 24,
              width: 'min(560px, 92vw)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            }}
          >
            <Heading level={4} style={{ marginBottom: 8 }}>
              Choose a display name
            </Heading>
            <Text color="var(--amplify-colors-neutral-60)" style={{ marginBottom: 16, display: 'block' }}>
              This helps others recognize you. You can change it later.
            </Text>

            {mergedError && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  background: '#FDEAEA',
                  color: '#7A2525',
                  border: '1px solid #F5C2C2',
                  borderRadius: 10,
                  padding: '10px 12px',
                  marginBottom: 12,
                }}
              >
                {String((mergedError as any)?.message ?? mergedError)}
              </div>
            )}

            <SetNameForm
              onSubmit={async (name) => {
                await updateDisplayName(name);
              }}
            />

            <Text
              as="span"
              color="var(--amplify-colors-neutral-60)"
              style={{ display: 'block', marginTop: 12, fontSize: 12 }}
            >
              Having trouble? You can refresh and try again—your progress is saved.
            </Text>
          </div>
        </div>
      )}
    </>
  );
}




































