// src/components/LevelUpBanner.tsx
import { Card, Heading, Text, Button } from '@aws-amplify/ui-react';

export interface LevelUpBannerProps {
  currentXP: number;
  maxXP: number;
  onDismiss: () => void;
}

export default function LevelUpBanner({
  currentXP,
  maxXP,
  onDismiss,
}: LevelUpBannerProps) {
  // Calculate current level (Level 1 starts at 0 XP)
  const level = Math.floor(currentXP / maxXP) + 1;

  let headingText = '';
  let bodyText = '';

  if (currentXP === 0 && level === 1) {
    // Starting player
    headingText = `You're currently Level ${level}`;
    bodyText = `Clear some bounties to earn your next level. XP Progress: ${currentXP}/${maxXP}`;
  } else if (currentXP % maxXP === 0 && currentXP !== 0) {
    // Exact multiple of maxXP — level up moment
    headingText = `🎉 You Leveled Up!`;
    bodyText = `Great job! You've reached Level ${level}. XP Progress: ${currentXP}/${maxXP}`;
  } else {
    // In-progress
    headingText = `Level ${level}`;
    bodyText = `Keep going to reach the next level! XP Progress: ${currentXP}/${maxXP}`;
  }

  return (
    <Card
      variation="elevated"
      borderRadius="l"
      boxShadow="medium"
      marginBottom="large"
      style={{
        background: '#f9fbfd',
        border: '2px solid #3776ff',
        textAlign: 'center',
        marginTop: 'var(--tg-header-height, 0px)', // respects header height
      }}
    >
      <Heading level={3} marginBottom="small">
        {headingText}
      </Heading>
      <Text marginBottom="small">{bodyText}</Text>
      <Button onClick={onDismiss} variation="primary">
        Continue
      </Button>
    </Card>
  );
}














