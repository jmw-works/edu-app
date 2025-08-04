import { useRef, useState } from 'react';
import { Header } from './components/Header';
import { QuizSection } from './components/QuizSection';
import { useQuizData } from './hooks/useQuizData';
import { sections } from './constants/sections';
import { useHeaderHeight } from './hooks/useHeaderHeight';
import { calculateXPProgress } from './utils/xp';
import { LevelUpBanner } from './components/LevelUpBanner';
import { UserStatsPanel } from './components/UserStatsPanel';
import { Flex, Heading } from '@aws-amplify/ui-react';



interface AuthenticatedContentProps {
  user: {
    userId: string;
    attributes: {
      name?: string;
      email?: string;
      [key: string]: any;
    };
  };
  signOut?: (data?: any) => void;
}



export function AuthenticatedContent({ user, signOut }: AuthenticatedContentProps) {
  const { questions, progress, handleAnswer } = useQuizData(user.userId);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 50;

  const userName =
    user.attributes?.name ||
    user.attributes?.email?.split('@')[0] ||
    'User';

  const [showBanner, setShowBanner] = useState(true);
  const maxXP = 100;
  const currentXP = progress.totalXP || 0;
  const percentage = calculateXPProgress(currentXP, maxXP);

  const sectionCompletions = sections.map((sec) => {
    const secQuestions = questions.filter(q => q.section === sec.number);
    return (
      secQuestions.length === 0 ||
      secQuestions.every(q => progress.answeredQuestions?.includes(q.id))
    );
  });

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
        {/* Left Column: Content */}
        <Flex direction="column" flex="1">
          {showBanner && (
            <LevelUpBanner onClose={() => setShowBanner(false)} />
          )}

          <Heading level={2} marginBottom="medium">
            Hey {userName}! Let's jump in.
          </Heading>

          {sections.map((sec, index) => {
            const secQuestions = questions.filter(q => q.section === sec.number);
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









