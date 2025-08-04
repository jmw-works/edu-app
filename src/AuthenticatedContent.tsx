// src/AuthenticatedContent.tsx
import { Header } from './Header';
import { QuizSection } from './QuizSection';
import { useQuizData } from './useQuizData';

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

  return (
    <div>
      <Header signOut={signOut} />

      <h1>Gamified Quiz MVP</h1>
      <p>Total XP: {progress.totalXP || 0}</p>

      {sections.map((sec, index) => {
        const secQuestions = questions.filter((q) => q.section === sec.number);
        // Lock if previous section not complete (Section 1 always unlocked)
        const isLocked = index > 0 && !sectionCompletions[index - 1];
        // Initial open: true for first, false for others
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
    </div>
  );
}



