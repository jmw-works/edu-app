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
  percentage: number; // overall completion; not used for XP math
  headerHeight: number;
  spacing: number;
}

/** Gold, animated XP bar */
function XPBar({
  percent,
  label,
  fillColor = '#e7bb73', // gold to match header titles
}: {
  percent: number; // 0..100 (fractional allowed)
  label?: string;
  fillColor?: string;
}) {
  const { tokens } = useTheme();

  const clamped = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  const shown = Math.round(clamped);

  const barBg = tokens.colors.neutral['20'].value; // light gray track
  const barHeight = '12px';
  const radius = tokens.radii.small.value;

  return (
    <div
      aria-label={label ?? 'XP progress'}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      style={{ width: '100%' }}
    >
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
            {label}
          </Text>
          <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
            {shown}%
          </Text>
        </div>
      )}

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
            width: `${clamped}%`,
            height: '100%',
            background: fillColor,
            transition: 'width 450ms ease',
          }}
        />
      </div>
    </div>
  );
}

/** Map user level → Title + Notes (from your table) */
function getRankForLevel(level: number): { title: string; notes: string; tier: number } {
  if (level >= 91) return { tier: 12, title: 'Eternal Keeper of Secrets', notes: 'Final endgame grind' };
  if (level >= 71) return { tier: 11, title: 'Mythic Treasure Hunter', notes: 'Big prestige; XP curve steep' };
  if (level >= 61) return { tier: 10, title: 'Legendary Expedition Leader', notes: 'Small player % reach here' };
  if (level >= 51) return { tier: 9, title: 'Lost City Adventurer', notes: 'Feels elite' };
  if (level >= 41) return { tier: 8, title: 'Tomb Raider', notes: 'Start of serious grind' };
  if (level >= 31) return { tier: 7, title: 'Artifact Appraiser', notes: 'More commitment required' };
  if (level >= 21) return { tier: 6, title: 'Crypt Delver', notes: 'Mid-game pace' };
  if (level >= 16) return { tier: 5, title: 'Temple Cartographer', notes: 'Starts feeling like an achievement' };
  if (level >= 11) return { tier: 4, title: 'Ruins Explorer', notes: 'Slightly longer per level' };
  if (level >= 6) return { tier: 3, title: 'Jungle Scout', notes: 'Still feels quick' };
  if (level >= 2) return { tier: 2, title: 'Desert Pathfinder', notes: 'Very fast to get' };
  return { tier: 1, title: 'Novice Relic Seeker', notes: 'First login/first XP gain' };
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

  // Defensive defaults
  const safeXP = Number.isFinite(currentXP) ? Math.max(0, currentXP) : 0;
  const safeMax = Number.isFinite(maxXP) && maxXP > 0 ? maxXP : 100;

  // Prefer saved display name; fall back to username/email
  const shownName =
    (typeof user.attributes?.name === 'string' && user.attributes.name) ||
    user.username ||
    (typeof user.attributes?.email === 'string' ? user.attributes.email : '') ||
    'N/A';

  // Per-level math
  const level = Math.floor(safeXP / safeMax) + 1;
  const progressWithinLevel = safeXP % safeMax;
  const levelPercent = (progressWithinLevel / safeMax) * 100; // fractional for smooth animation
  const nextLevelIn = Math.max(0, safeMax - progressWithinLevel);

  const rank = getRankForLevel(level);

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
          {progressWithinLevel}/{safeMax} XP this level
        </Text>
      </Flex>

      <XPBar percent={levelPercent} label={`Progress to Level ${level + 1}`} fillColor="#e7bb73" />

      <Text marginTop="xs" color={tokens.colors.font.secondary} fontSize="0.9rem">
        {nextLevelIn === 0
          ? 'Level up ready — keep going!'
          : `Only ${nextLevelIn} XP to reach Level ${level + 1}`}
      </Text>

      <Divider marginTop="medium" marginBottom="small" />

      {/* Dynamic Rank Title */}
      <Flex
        direction="column"
        gap="0.25rem"
        padding="0.75rem"
        borderRadius="0.75rem"
        style={{
          background: 'rgba(231,187,115,0.12)', // subtle gold tint
          border: '1px solid rgba(231,187,115,0.35)',
        }}
        marginBottom="small"
      >
        <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
          Current Title
        </Text>
        <Text
          fontWeight={800}
          style={{ fontSize: '1.05rem', color: '#e7bb73', lineHeight: 1.1 }}
        >
          {rank.tier} – {rank.title}
        </Text>
        <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
          {rank.notes}
        </Text>
      </Flex>

      <Divider marginTop="small" marginBottom="small" />

      <Text color={tokens.colors.font.secondary} fontSize="0.9rem">
        Email: {typeof user.attributes?.email === 'string' ? user.attributes.email : 'N/A'}
      </Text>
    </View>
  );
}
















