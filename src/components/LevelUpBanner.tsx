// src/components/LevelUpBanner.tsx
import { Card, Button, Heading, Text } from '@aws-amplify/ui-react';

type LevelUpBannerProps = {
  currentXP: number;
  maxXP: number;
  onDismiss?: () => void;
};

export default function LevelUpBanner({
  currentXP,
  maxXP,
  onDismiss,
}: LevelUpBannerProps) {
  const pct = Math.max(
    0,
    Math.min(100, Math.round((currentXP / Math.max(1, maxXP)) * 100))
  );

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
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          aria-hidden
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            border: '2px solid #3776ff',
            fontWeight: 800,
          }}
        >
          {pct}%
        </div>

        <div style={{ textAlign: 'left', flex: 1 }}>
          <Heading level={4} style={{ margin: 0 }}>
            Leveling up!
          </Heading>
          <Text>
            You’ve earned <strong>{currentXP}</strong> XP toward{' '}
            <strong>{maxXP}</strong>. Keep going to unlock the next section.
          </Text>
        </div>

        {onDismiss && (
          <Button onClick={onDismiss} variation="link">
            Dismiss
          </Button>
        )}
      </div>
    </Card>
  );
}
















