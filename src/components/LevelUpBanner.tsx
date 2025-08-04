import { Card, Flex, Heading, Text, Badge, Icon, type BadgeProps } from '@aws-amplify/ui-react';

interface LevelUpBannerProps {
  onClose: () => void;
}

export function LevelUpBanner({ onClose }: LevelUpBannerProps) {
  const labels = ['XP', 'Badge', 'Streak'] as const;
  const descriptions = ['Experience', 'Achievements', 'Consistency'] as const;
  const variations: [BadgeProps['variation'], BadgeProps['variation'], BadgeProps['variation']] = [
    'success',
    'info',
    'warning',
  ];

  return (
    <Card
      variation="elevated"
      padding="xl"
      borderRadius="l"
      boxShadow="medium"
      marginBottom="large"
      style={{
        background: 'linear-gradient(to right, #1e2a3a, #1e2a3a)',
        color: '#ffffff',
        position: 'relative',
      }}
    >
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Flex direction="column" width="50%">
          <Heading level={3} marginBottom="small" color="#fff">
            Ready to Level Up?
          </Heading>
          <Text color="#fff">
            Dive into our gamified quizzes! Earn XP, unlock new sections, and show off your badges as you build a streak!
          </Text>
        </Flex>

        <Flex direction="row" gap="large" alignItems="center" width="40%">
          {labels.map((label, i) => (
            <Flex direction="column" alignItems="center" gap="xs" key={label}>
              <Badge
                variation={variations[i]}
                style={{
                  width: '60px',
                  height: '60px',
                  fontSize: '1.1rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {label}
              </Badge>
              <Text fontSize="small" color="#fff">
                {descriptions[i]}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>

      <Icon
        ariaLabel="Close"
        pathData="M6 18L18 6M6 6l12 12"
        viewBox={{ minX: 0, minY: 0, width: 24, height: 24 }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          cursor: 'pointer',
          color: '#ffffff',
        }}
        onClick={onClose}
      />
    </Card>
  );
}



