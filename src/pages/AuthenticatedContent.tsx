// src/pages/AuthenticatedContent.tsx

import { useMemo, useRef, useState } from 'react';
import { Header } from '../components/Header';
import { QuizSection } from '../components/QuizSection';
import { useQuizData } from '../hooks/useQuizData';
import { sections } from '../constants/sections';
import { useHeaderHeight } from '../hooks/useHeaderHeight';
import { calculateXPProgress } from '../utils/xp';
import { LevelUpBanner } from '../components/LevelUpBanner';
import { UserStatsPanel } from '../components/UserStatsPanel';
import { Flex, Heading } from '@aws-amplify/ui-react';
import type { QuestionWithAnswers } from '../types/QuestionTypes';
import type { UserProgress } from '../types/UserProgressTypes';

interface AuthenticatedContentProps {
  user: {
    userId: string;
    username?: string;
    attributes: {
      name?: string;
      email?: string;
      [key: string]: unknown;
    };
  };
  signOut?: () => void;
}

export function AuthenticatedContent({ user, signOut }: AuthenticatedContentProps) {
  const { questions, progress, handleAnswer } = useQuizData(user.userId);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 50;

  const userName = useMemo(() => {
    return (
      user.username ||
      user.attributes?.name ||
      user.attributes?.email?.split('@')[0] ||
      'User'
    );
  }, [user]);

  const [showBanner, setShowBanner] = useState(true);
  const maxXP = 100;
  const currentXP = progress.totalXP ?? 0;
  const percentage = calculateXPProgress(currentXP, maxXP);

  const sectionCompletions = useMemo(() => {
    return sections.map((sec) => {
      const secQuestions = questions.filter((q: QuestionWithAnswers) => q.section === sec.number);
      return (
        secQuestions.length === 0 ||
        secQuestions.every((q: QuestionWithAnswers) =>
          progress.answeredQuestions?.includes(q.id)
        )
      );
    });
  }, [questions, progress.answeredQuestions]);

  return (
    <>
      <Header ref={headerRef} signOut={signOut} />

      <Flex
        direction="row"
        gap="large"
        paddingTop={`${headerHeight + spacing}px`}
        padding="xl"
        maxWidth="1400px"
        margin="0 auto"
      >
        {/* Left Column */}
        <Flex direction="column" flex="1">
          {showBanner && (
            <LevelUpBanner onClose={() => setShowBanner(false)} />
          )}

          <Heading level={2} marginBottom="medium">
            Hey {userName}! Let's jump in.
          </Heading>

          {sections.map((sec, index) => {
            const secQuestions = questions.filter((q: QuestionWithAnswers) => q.section === sec.number);
            const isLocked = index > 0 && !sectionCompletions[index - 1];
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

        {/* Right Sidebar */}
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





