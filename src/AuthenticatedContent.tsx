// src/AuthenticatedContent.tsx
import { useEffect, useRef, useState } from 'react';
import { Header } from './Header';
import { QuizSection } from './QuizSection';
import { useQuizData } from './useQuizData';
import { View, useTheme, Flex, Heading, Text, Card, Badge, Icon } from '@aws-amplify/ui-react';

interface AuthenticatedContentProps {
  user: any;
  signOut?: (data?: any) => void;
}

export function AuthenticatedContent({ user, signOut }: AuthenticatedContentProps) {
  const { questions, progress, handleAnswer } = useQuizData(user.userId);

  // Define section configs for scalability (add more as needed)
  const sections = [
    { number: 1, title: 'Section 1 – Introduction', educationalText: 'Ciphers are methods of transforming information to keep it secret from unintended recipients. At their core, ciphers work by replacing, rearranging, or otherwise altering the characters or structure of a message in a way that can only be reversed by someone who knows the specific rules—or "key"—used to encode it. There are two main types of ciphers: substitution ciphers, which replace each element of the plaintext with another character or symbol (as in the Caesar cipher), and transposition ciphers, which rearrange the order of characters in the message. In either case, the goal is to make the original message unreadable to anyone without the key.\nModern ciphers, used in digital communication and data protection, rely on complex mathematical algorithms and keys that are often hundreds or thousands of bits long. These encryption techniques ensure that even if a message is intercepted, decrypting it without the correct key would take impractical amounts of time and computing power. Cryptographic systems often use symmetric encryption (where the same key encrypts and decrypts) or asymmetric encryption (where a public key encrypts and a private key decrypts). Through these systems, ciphers play a foundational role in securing everything from online banking to private messaging.' },
    { number: 2, title: 'Section 2 – Continued Learning', educationalText: 'Building on the intro, this section covers math and literature fundamentals.' },
    { number: 3, title: 'Section 3 – Advanced Topics', educationalText: 'Dive deeper into science and history with these challenging concepts.' },
    // Add future sections with their own text...
  ];

  // Compute completions for all sections
  const sectionCompletions = sections.map((sec) => {
    const secQuestions = questions.filter((q) => q.section === sec.number);
    return secQuestions.length === 0 || secQuestions.every((q) => progress.answeredQuestions?.includes(q.id)); // Handles empty sections
  });

  // Hardcode maxXP to 100 for now
  const maxXP = 100;
  const currentXP = progress.totalXP || 0;
  // Calculate percentage (clamp to 0-100)
  const percentage = Math.min(100, (currentXP / maxXP) * 100);

  const { tokens } = useTheme(); // For theme-aware styling

  const headerRef = useRef<HTMLDivElement>(null); // Ref for header
  const [headerHeight, setHeaderHeight] = useState(60); // Fallback minimum height

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
        console.log('Updated header height:', height); // Debug log
      }
    };

    updateHeight(); // Initial check

    // Observer for DOM changes (e.g., image load)
    const observer = new MutationObserver(updateHeight);
    if (headerRef.current) {
      observer.observe(headerRef.current, { childList: true, subtree: true, attributes: true });
    }

    // Listen for resize and load
    window.addEventListener('resize', updateHeight);
    window.addEventListener('load', updateHeight);

    // Polling backup
    const interval = setInterval(updateHeight, 200);
    const timeout = setTimeout(() => clearInterval(interval), 2000);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('load', updateHeight);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const spacing = 50; // Minimum extra spacing

  // Placeholder user name
  const userName = user.attributes?.name || user.attributes?.email?.split('@')[0] || 'User';

  // State for hiding the banner (optional interactivity)
  const [showBanner, setShowBanner] = useState(true);

  return (
    <>
      {/* Header with ref */}
      <Header ref={headerRef} signOut={signOut} />

      {/* Main container Flex - row for main + sidebar */}
      <Flex 
        direction="row" 
        gap="large" 
        paddingTop={`${headerHeight + spacing}px`} 
        padding="xl" 
        maxWidth="1400px" 
        margin="0 auto"
      >
        {/* Left main content (banner, greeting, sections) */}
        <Flex direction="column" flex="1">
          {/* Banner */}
          {showBanner && (
            <Card 
  variation="elevated" 
  padding="xl" 
  borderRadius="l" 
  boxShadow="medium"
  marginBottom="large"
  style={{ background: 'linear-gradient(to right, #1e2a3a, #1e2a3a)', color: '#ffffff', position: 'relative' }}
>
  <Flex direction="row" justifyContent="space-between" alignItems="center">
    
    {/* XP, Badge, Streak section */}
    <Flex direction="row" gap="large" alignItems="center" width="40%">
      <Flex direction="column" alignItems="center" gap="xs">
        <Badge variation="success" style={{
          width: '60px', height: '60px', fontSize: '1.1rem',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>XP</Badge>
        <Text fontSize="small">Experience</Text>
      </Flex>
      <Flex direction="column" alignItems="center" gap="xs">
        <Badge variation="info" style={{
          width: '60px', height: '60px', fontSize: '1.1rem',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>Badge</Badge>
        <Text fontSize="small">Achievements</Text>
      </Flex>
      <Flex direction="column" alignItems="center" gap="xs">
        <Badge variation="warning" style={{
          width: '60px', height: '60px', fontSize: '1.1rem',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>Streak</Badge>
        <Text fontSize="small">Consistency</Text>
      </Flex>
    </Flex>

    {/* Motivational text */}
    <Flex direction="column" width="50%">
      <Heading level={3} style={{ color: '#ffffff', marginBottom: 'small' }}>Ready to Level Up?</Heading>
      <Text style={{ color: '#ffffff' }}>
        Dive into our gamified quizzes! Earn XP, unlock new sections, and show off your badges as you build a streak!
      </Text>
    </Flex>

  </Flex>

  {/* Close icon */}
  <Icon 
    ariaLabel="Close"
    pathData="M6 18L18 6M6 6l12 12"
    viewBox={{ minX: 0, minY: 0, width: 24, height: 24 }}
    style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', color: '#ffffff' }}
    onClick={() => setShowBanner(false)}
  />
</Card>

          )}

          {/* Greeting below banner */}
          <Heading level={2} marginBottom="medium">
            Hey {userName}! Let's jump in.
          </Heading>

          {/* Question sections below greeting */}
          {sections.map((sec, index) => {
            const secQuestions = questions.filter((q) => q.section === sec.number);
            const isLocked = index > 0 && !sectionCompletions[index - 1];
            const initialOpen = index === 0;

            return (
              <QuizSection
                key={sec.number}
                title={sec.title}
                sectionNumber={sec.number}
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

        {/* Right sidebar, sticky starting at banner level */}
        <Flex 
          direction="column" 
          width="250px" 
          padding="medium" 
          backgroundColor="#f0f0f0" // Light gray for contrast
          borderRadius="m"
          boxShadow="small"
          style={{
            position: "sticky",
            top: `${headerHeight + spacing}px`, // Aligns with banner top
            alignSelf: "start", // Starts at top of row
            minHeight: '300px' // Ensures it spans down
          }}
        >
          <Heading level={4} marginBottom="small">User Stats</Heading>
          <Text fontSize="small" marginBottom="xs">Email: {user.attributes?.email || 'N/A'}</Text>
          <Text fontWeight="bold" marginBottom="xs">XP: {currentXP} / {maxXP}</Text>
          <View
            as="progress"
            max={100}
            value={percentage}
            width="100%"
            height="medium"
            backgroundColor="#ddd" // Gray track for visibility
            color="#4caf50" // Green fill
            borderRadius="s"
            marginBottom="medium"
          />
          <Text fontSize="small" color={tokens.colors.font.secondary} marginBottom="small">
            Well done! You're on your way to mastering the quiz. Keep the streak going!
          </Text>
          <Flex direction="column" gap="xs">
            <Text fontSize="small">✔ Enroll in a section</Text>
            <Text fontSize="small">✔ Answer a question</Text>
            <Text fontSize="small">○ Complete a section</Text>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}



