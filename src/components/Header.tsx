// src/components/Header.tsx
import { forwardRef, useMemo } from 'react';
import { Button, Flex, Text } from '@aws-amplify/ui-react';

export interface HeaderProps {
  signOut?: () => void;

  // Stats passed from AuthenticatedContent
  currentXP?: number;
  maxXP?: number;
  bountiesCompleted?: number; // <-- important
  streakDays?: number;        // <-- important
}

function computeLevel(currentXP = 0, maxXP = 100) {
  if (maxXP <= 0) return 1;
  return Math.max(1, Math.floor(currentXP / maxXP) + 1);
}

function StatPill({
  icon,
  label,
  sublabel,
}: { icon: string; label: string; sublabel?: string }) {
  return (
    <Flex
      alignItems="center"
      gap="0.5rem"
      padding="0.4rem 0.75rem"
      borderRadius="9999px"
      backgroundColor="#0f172a"
      color="#e5e7eb"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
      <Flex direction="column" lineHeight="1.1">
        <Text fontSize="0.85rem" fontWeight={600}>{label}</Text>
        {sublabel && <Text fontSize="0.72rem" color="#cbd5e1">{sublabel}</Text>}
      </Flex>
    </Flex>
  );
}

export const Header = forwardRef<HTMLDivElement, HeaderProps>(
  ({ signOut, currentXP = 0, maxXP = 100, bountiesCompleted = 0, streakDays = 0 }, ref) => {
    const level = useMemo(() => computeLevel(currentXP, maxXP), [currentXP, maxXP]);
    const xpSub = `${currentXP}/${maxXP} XP`;

    return (
      <header ref={ref} className="main-header">
        {/* Left: logo + title */}
        <Flex alignItems="center" gap="0.75rem">
          <img
            src="/logo.png"
            alt="Raccoon Bounty"
            className="logo"
            style={{ height: 44, width: 44, objectFit: 'contain' }}
          />
          <Text as="h1" fontSize="1.25rem" fontWeight={700} color="#fff" margin="0" lineHeight="1.1" style={{ letterSpacing: 0.2 }}>
            Raccoon Bounty | <span style={{ color: '#e7bb73', fontWeight: 700 }}>Treasure Hunter Gym</span>
          </Text>
        </Flex>

        {/* Center: stat pills */}
        <Flex alignItems="center" justifyContent="center" gap="0.75rem" style={{ minWidth: 0, flex: '1 1 auto' }}>
          <StatPill icon="🪙" label={`Level ${level}`} sublabel={xpSub} />
          <StatPill icon="💰" label={`${bountiesCompleted} Bounties`} sublabel="completed" />
          <StatPill icon="🔥" label={`${streakDays} Day Blaze`} sublabel="daily streak" />
        </Flex>

        {/* Right: actions */}
        <Flex alignItems="center" gap="0.75rem">
          <Button
            onClick={signOut}
            variation="primary"
            size="small"
            style={{ backgroundColor: '#e7bb73', border: 'none', color: '#111827', fontWeight: 700 }}
          >
            Sign Out
          </Button>
        </Flex>
      </header>
    );
  }
);

Header.displayName = 'Header';




