// src/components/UserStatsPanel.tsx
import { Flex, Heading, Text, View, useTheme, Divider, Badge } from '@aws-amplify/ui-react';

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
  percentage: number; // 0-100 overall
  headerHeight: number;
  spacing: number;
}

/**
 * Accessible XP progress bar.
 * Use variant = 'compact' (solid) or 'segmented' (ticks).
 */
function XPBar({
  percent,
  label,
  variant = 'compact',
}: {
  percent: number; // 0..100
  label?: string;
  variant?: 'compact' | 'segmented';
}) {
  const { tokens } = useTheme();
  const safe = Math.max(0, Math.min(100, Math.round(percent)));

  // Use .value when injecting tokens into inline styles
  const barBg = tokens.colors.neutral['20'].value;
  // Brand color: use CSS variable string to stay theme-aware without type issues
  const barFill = 'var(--amplify-colors-brand-primary-60)';
  const barHeight = '12px';
  const radius = tokens.radii.small.value;

  const segments = 10;
  const activeSegments = Math.round((safe / 100) * segments);

  return (
    <div
      aria-label={label ?? 'XP progress'}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safe}
      style={{ width: '100%' }}
    >
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
            {label}
          </Text>
          <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
            {safe}%
          </Text>
        </div>
      )}

      {variant === 'compact' ? (
        <div
          style={{
            width: '100%',
            height: barHeight,
            background: barBg,
            borderRadius: radius,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${safe}%`,
              height: '100%',
              background: barFill,
              transition: 'width 300ms ease',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${segments}, 1fr)`,
            gap: 4,
            width: '100%',
          }}
        >
          {Array.from({ length: segments }).map((_, i) => {
            const on = i < activeSegments;
            return (
              <div
                key={i}
                style={{
                  height: barHeight,
                  borderRadius: radius,
                  background: on ? barFill : barBg,
                  transition: 'background-color 250ms ease',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
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

  // Prefer persisted displayName (provided via user.attributes.name)
  const shownName =
    (typeof user.attributes?.name === 'string' && user.attributes.name) ||
    user.username ||
    (typeof user.attributes?.email === 'string' ? user.attributes.email : '') ||
    'N/A';

  // Level math (Level 1 starts at 0 XP; each level requires `maxXP`)
  const level = Math.floor(currentXP / maxXP) + 1;
  const currentLevelBase = (level - 1) * maxXP;
  const progressWithinLevel = currentXP - currentLevelBase; // 0..maxXP-1
  const nextLevelIn = Math.max(0, maxXP - progressWithinLevel);
  const levelPercent = Math.max(0, Math.min(100, Math.round((progressWithinLevel / maxXP) * 100)));

  // Choose bar style: 'compact' | 'segmented'
  const barVariant: 'compact' | 'segmented' = 'compact';

  return (
    <View
      padding={spacing}
      style={{
        position: 'sticky',
        top: headerHeight + spacing,
        maxWidth: '320px',
      }}
    >
      <Heading level={3} marginBottom="small">
        User Stats
      </Heading>
      <Text marginBottom="xxs" color={tokens.colors.font.secondary}>
        Welcome,
      </Text>
      <Heading level={4} marginTop="xxs" marginBottom="small">
        {shownName}
      </Heading>

      <Flex direction="row" alignItems="center" gap="small" marginBottom="small">
        <Badge variation="info">Level {level}</Badge>
        <Text color={tokens.colors.font.secondary} fontSize="0.9rem">
          {currentXP} / {maxXP * level} XP total
        </Text>
      </Flex>

      <XPBar
        percent={levelPercent}
        label={`Progress to Level ${level + 1}`}
        variant={barVariant}
      />

      <Text marginTop="xs" color={tokens.colors.font.secondary} fontSize="0.9rem">
        {nextLevelIn === 0
          ? 'Level up ready — keep going!'
          : `Only ${nextLevelIn} XP to reach Level ${level + 1}`}
      </Text>

      <Divider marginTop="medium" marginBottom="small" />

      <Text marginBottom="small">
        Keep the streak going! Earn XP by completing sections and answering questions.
      </Text>

      <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: 0 }}>
        <li>✔ Enroll in a section</li>
        <li>✔ Answer a question</li>
        <li>{percentage >= 100 ? '✔' : '○'} Complete a section</li>
      </ul>

      <Divider marginTop="medium" marginBottom="small" />

      <Text color={tokens.colors.font.secondary} fontSize="0.9rem">
        Email: {typeof user.attributes?.email === 'string' ? user.attributes.email : 'N/A'}
      </Text>
    </View>
  );
}













