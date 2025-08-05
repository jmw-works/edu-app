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
import { useUserProfile } from '../hooks/useUserProfile'; // <-- you may need to create this if not present
import { Flex, Heading } from '@aws-amplify/ui-react';

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
  // User Profile (from DB): allows for custom displayName
  const { profile, updateDisplayName, loading: profileLoading } = useUserProfile(
    user.userId,
    user.attributes?.email
  );
  const displayName = profile?.displayName || user.attributes?.name || user.username || (user.attributes?.email?.split('@')[0]) || 'User';

  const { questions, progress, handleAnswer } = useQuizData(user.userId);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 50;
  const [showBanner, setShowBanner] = useState(true);

  const maxXP = 100;
  const currentXP = progress.totalXP ?? 0;
  const percentage = calculateXPProgress(currentXP, maxXP);

  // If loading profile, show nothing (or loading state)
  if (profileLoading) return null;

  // If no display name, prompt for it
  if (!profile?.displayName) {
    return (
      <SetNameForm
        onSubmit={async (name) => {
          await updateDisplayName(name);
        }}
      />
    );
  }

  return (
    <>
      <Header ref={headerRef} signOut={signOut} />

      {/* Top margin to avoid overlap with header */}
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
            Hey {displayName}! Let's jump in.
          </Heading>
          {sections.map((sec, index) => {
            const secQuestions = questions.filter((q) => q.section === sec.number);
            // Section lock logic
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















