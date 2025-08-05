import { Flex, Heading, Text, View, useTheme } from '@aws-amplify/ui-react';

interface UserAttributes {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

interface UserStatsPanelProps {
  user: {
    username?: string;
    attributes: UserAttributes;
  };
  currentXP: number;
  maxXP: number;
  percentage: number;
  headerHeight: number;
  spacing: number;
}

export default function UserStatsPanel({
  user,
  currentXP,
  maxXP,
  percentage,
  headerHeight,
  spacing,
}: UserStatsPanelProps) {
  const { tokens } = useTheme();

  const shownName =
    user.attributes?.name ||
    user.username ||
    user.attributes?.email ||
    'N/A';

  return (
    <Flex
      direction="column"
      width="250px"
      padding="medium"
      backgroundColor="#f0f0f0"
      borderRadius="m"
      boxShadow="small"
      style={{
        position: 'sticky',
        top: `${headerHeight + spacing}px`,
        alignSelf: 'start',
        minHeight: '300px',
      }}
    >
      <Heading level={4} marginBottom="small">User Stats</Heading>
      <Text fontSize="small" marginBottom="xs">
        <strong>User:</strong> {shownName}
      </Text>
      <Text fontSize="small" marginBottom="xs" color={tokens.colors.font.secondary}>
        <strong>Email:</strong> {user.attributes?.email ?? 'N/A'}
      </Text>
      <Text fontWeight="bold" marginBottom="xs">
        XP: {currentXP} / {maxXP}
      </Text>
      <View
        as="progress"
        max={100}
        value={percentage}
        width="100%"
        height="medium"
        backgroundColor="#ddd"
        color="#4caf50"
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
  );
}








