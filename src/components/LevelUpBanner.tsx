// src/components/LevelUpBanner.tsx
import { Card, Heading, Text, Button } from '@aws-amplify/ui-react';

interface LevelUpBannerProps {
  onClose: () => void;
}

function LevelUpBanner({ onClose }: LevelUpBannerProps) {
  return (
    <Card
      variation="elevated"
      borderRadius="l"
      boxShadow="medium"
      marginBottom="large"
      style={{
        background: '#f9fbfd',
        border: '2px solid #3776ff',
        textAlign: 'center'
      }}
    >
      <Heading level={3} marginBottom="small">
        🎉 Welcome! Level Up!
      </Heading>
      <Text marginBottom="small">
        You’re on your way to mastering new skills. Keep going and earn more XP!
      </Text>
      <Button onClick={onClose} variation="primary">
        Close
      </Button>
    </Card>
  );
}

export default LevelUpBanner;









