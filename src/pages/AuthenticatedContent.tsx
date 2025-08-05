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
import { Flex, Heading, View } from '@aws-amplify/ui-react';
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
}

export default function AuthenticatedContent({ user, signOut }: AuthenticatedContentProps) {
  const { questions, progress, handleAnswer } = useQuizData(user.userId);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 50;

  const [showBanner, setShowBanner] = useState(true);

  const {
    profile,
    loading: profileLoading,
    updateDisplayName,
  } = useUserProfile(
    user.userId,
    user.attributes?.email as string | undefined,
  );

  if (profileLoading) {
    return (
      <>
        <Header ref={headerRef} signOut={signOut} />
        <View padding={spacing}>Loading profile…</View>
      </>
    );
  }

  const displayName = profile?.displayName ?? '';
  const showSetName = !displayName;

  if (showSetName) {
    return (
      <>
        <Header ref={headerRef} signOut={signOut} />
        <Flex direction="column" alignItems="center" padding={spacing}>
          <Heading level={3}>Welcome!</Heading>
          <SetNameForm onSubmit={(name) => updateDisplayName(name)} />
        </Flex>
      </>
    );
  }

  const maxXP = 100;
  const currentXP = progress.totalXP ?? 0;
  const percentage = calculateXPProgress(currentXP, maxXP);

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

      {showBanner && (
        <LevelUpBanner
          currentXP={currentXP}
          maxXP={maxXP}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      <Flex
        direction={{ base: 'column', large: 'row' }}
        alignItems={{ large: 'flex-start' }}
      >
        <Flex direction="column" flex="1" padding={spacing}>
          <Heading level={2}>Hey {displayName}! Let&apos;s jump in.</Heading>
          {sections.map((sec, index) => {
            const secQuestions = questions.filter(
              (q) => q.section === sec.number,
            );
            const prevComplete =
              index === 0 ||
              sections
                .slice(0, index)
                .every((s) =>
                  questions
                    .filter((q) => q.section === s.number)
                    .every((q) =>
                      progress.answeredQuestions?.includes(q.id),
                    ),
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
                progress={progress}
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
              name: displayName,
            },
          }}
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































