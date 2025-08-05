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
      }}
    >
      <Heading level={3} marginBottom="small">
        🎉 You Leveled Up!
      </Heading>
      <Text marginBottom="small">
        Great job! You've reached a new level. XP Progress: {currentXP}/{maxXP}
      </Text>
      <Button onClick={onDismiss} variation="primary">
        Continue
      </Button>
    </Card>
  );
}











