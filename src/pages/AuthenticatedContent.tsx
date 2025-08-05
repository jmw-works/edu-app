// src/pages/AuthenticatedContent.tsx

import { useMemo, useRef, useState } from 'react';
import { Header } from '../components/Header';
import { QuizSection } from '../components/QuizSection';
import { useQuizData } from '../hooks/useQuizData';
import { sections } from '../constants/sections';
import { useHeaderHeight } from '../hooks/useHeaderHeight';
import { calculateXPProgress } from '../utils/xp';
import LevelUpBanner from '../components/LevelUpBanner';
import UserStatsPanel from '../components/UserStatsPanel';
import SetNameForm from '../components/SetNameForm';
import { Flex, Heading } from '@aws-amplify/ui-react';

// If using a user profile hook:
// import { useUserProfile } from '../hooks/useUserProfile';

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
}

export default function AuthenticatedContent({ user, signOut }: AuthenticatedContentProps) {
  const { questions, progress, handleAnswer } = useQuizData(user.userId);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 50;
  const [showBanner, setShowBanner] = useState(true);

  // --- If using a user profile hook for displayName ---
  // const { profile, loading, updateDisplayName } = useUserProfile(user.userId, user.attributes.email);
  // const displayName = profile?.displayName;

  // For this version, we'll just use the name from attributes or fallback:
  const displayName =
    user?.attributes?.name ||
    user?.username ||
    (user?.attributes?.email ? user.attributes.email.split('@')[0] : undefined);

  const [showSetName, setShowSetName] = useState(!displayName);

  // Call this when SetNameForm submits:
  const handleNameSubmit = (name: string) => {
    // Save the name via your API/hook if needed!
    // await updateDisplayName(name);
    user.attributes.name = name; // For demo purposes; use your real API!
    setShowSetName(false);
  };

  const maxXP = 100;
  const currentXP = progress.totalXP ?? 0;
  const percentage = calculateXPProgress(currentXP, maxXP);

  // Section lock logic for quiz sections
  const sectionCompletions = useMemo(() => {
    return sections.map((sec) => {
      const secQuestions = questions.filter((q) => q.section === sec.number);
      return (
        secQuestions.length === 0 ||
        secQuestions.every((q) => progress.answeredQuestions?.includes(q.id))
      );
    });
  }, [questions, progress.answeredQuestions]);

  return (
    <>
      <Header ref={headerRef} signOut={signOut} />

      {/* Modal to set display name if not present */}
      {showSetName && (
        <SetNameForm
          onSubmit={handleNameSubmit}
        />
      )}

      {/* LevelUpBanner with headroom */}
      {showBanner && (
        <div style={{ marginTop: `${headerHeight + spacing}px` }}>
          <LevelUpBanner onClose={() => setShowBanner(false)} />
        </div>
      )}

      <Flex
        direction="row"
        gap="large"
        paddingTop={`${headerHeight + spacing}px`}
        padding="xl"
        maxWidth="1400px"
        margin="0 auto"
      >
        {/* Left/Main Content */}
        <Flex direction="column" flex="1">
          <Heading level={2} marginBottom="medium">
            Hey {displayName || 'User'}! Let's jump in.
          </Heading>

          {sections.map((sec, index) => {
            const secQuestions = questions.filter((q) => q.section === sec.number);
            const prevComplete =
              index === 0 ||
              sections
                .slice(0, index)
                .every((s) =>
                  questions
                    .filter((q) => q.section === s.number)
                    .every((q) => progress.answeredQuestions?.includes(q.id))
                );
            const isLocked = !prevComplete;
            const initialOpen = index === 0;

            return (
              <QuizSection
                key={sec.number}
                title={sec.title}
                questions={secQuestions}
                progress={progress}
                handleAnswer={handleAnswer}
                isLocked={isLocked}
                initialOpen={initialOpen}
                educationalText={sec.educationalText}
              />
            );
          })}
        </Flex>

        {/* Right Sidebar: User Stats */}
        <UserStatsPanel
          user={user}
          currentXP={currentXP}
          maxXP={maxXP}
          percentage={percentage}
          headerHeight={headerHeight}
          spacing={spacing}
        />
      </Flex>
    </>
  );
}

















