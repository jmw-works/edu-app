import { useMemo, useRef, useState, useEffect } from 'react';
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

  // Display name logic
  const localStorageKey = `displayName_${user.userId}`;
  const attrName = typeof user?.attributes?.name === 'string' ? user.attributes.name : '';
  const storedName = localStorage.getItem(localStorageKey) || '';
  const initialDisplayName = attrName || storedName;

  const [displayName, setDisplayName] = useState<string>(initialDisplayName);

  // Show modal until displayName exists
  const showSetName = !displayName;

  useEffect(() => {
    if (displayName) {
      localStorage.setItem(localStorageKey, displayName);
    }
    // Do NOT call setDisplayName here or you'll get an infinite loop!
  }, [displayName, localStorageKey]);

  // Modal blocks app until a name is set
  if (showSetName) {
    return (
      <>
        <Header ref={headerRef} signOut={signOut} />
        <SetNameForm onSubmit={setDisplayName} />
      </>
    );
  }

  // Normal app display after name is set
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

      {/* Level up banner */}
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
        {/* Main Quiz Content */}
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

        {/* Sidebar: User Stats */}
        <UserStatsPanel
          user={user}
          userName={displayName}
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



























