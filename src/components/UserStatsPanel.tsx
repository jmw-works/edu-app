// src/components/UserStatsPanel.tsx
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

  // Prefer the persisted displayName (provided via user.attributes.name)
  const shownName =
    (typeof user.attributes?.name === 'string' && user.attributes.name) ||
    user.username ||
    user.attributes?.email ||
    'N/A';

  return (
    <View
      padding={spacing}
      style={{
        position: 'sticky',
        top: headerHeight + spacing,
        maxWidth: '320px',
      }}
    >
      <Heading level={3}>User Stats</Heading>
      <Text>User: {shownName}</Text>
      <Text>Email: {user.attributes?.email ?? 'N/A'}</Text>
      <Text>
        XP: {currentXP} / {maxXP}
      </Text>
      <Text>
        Well done! You&apos;re on your way to mastering the quiz. Keep the
        streak going!
      </Text>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        <li>✔ Enroll in a section</li>
        <li>✔ Answer a question</li>
        <li>{percentage >= 100 ? '✔' : '○'} Complete a section</li>
      </ul>
    </View>
  );
}











