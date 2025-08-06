// src/components/Header.tsx
import { forwardRef, useMemo } from 'react';
import { Button, Flex, Text } from '@aws-amplify/ui-react';

export interface HeaderProps {
  signOut?: () => void;

  // Stats passed from AuthenticatedContent
  currentXP?: number;
  maxXP?: number;
  bountiesCompleted?: number;
  streakDays?: number;

  /** Controls overall header height (px). Default 140. */
  height?: number;
  /** Controls logo size (px square). Default 95. */
  logoSize?: number;
  /** Controls pill icon size (px square). Default 75. */
  iconSize?: number;
  /** Controls title font size (rem). Default 1.75. */
  titleSizeRem?: number;

  /** Color for the main label text inside each pill (e.g., "Level 3"). Default #ffffff. */
  pillLabelColor?: string;
  /** Color for the sublabel text inside each pill (e.g., "250/1000 XP"). Default #e0e0e0. */
  pillSubLabelColor?: string;
}

function computeLevel(currentXP = 0, maxXP = 100) {
  if (maxXP <= 0) return 1;
  return Math.max(1, Math.floor(currentXP / maxXP) + 1);
}

function StatPill({
  iconSrc,
  iconAlt,
  label,
  sublabel,
  iconSize = 22,
  labelColor = '#ffffff',
  sublabelColor = '#e0e0e0',
}: {
  iconSrc: string;
  iconAlt: string;
  label: string;
  sublabel?: string;
  iconSize?: number;
  labelColor?: string;
  sublabelColor?: string;
}) {
  return (
    <Flex
      alignItems="center"
      gap="0.5rem"
      padding="0.45rem 0.75rem"
      borderRadius="9999px"
      backgroundColor="#0f172a"
      color={labelColor}
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        whiteSpace: 'nowrap',
      }}
    >
      <img
        src={iconSrc}
        alt={iconAlt}
        width={iconSize}
        height={iconSize}
        style={{ display: 'block', objectFit: 'contain' }}
      />
      <Flex direction="column" lineHeight="1.1">
        <Text fontSize="0.85rem" fontWeight={700} color={labelColor}>
          {label}
        </Text>
        {sublabel && (
          <Text fontSize="0.72rem" color={sublabelColor}>
            {sublabel}
          </Text>
        )}
      </Flex>
    </Flex>
  );
}

export const Header = forwardRef<HTMLDivElement, HeaderProps>(
  (
    {
      signOut,
      currentXP = 0,
      maxXP = 100,
      bountiesCompleted = 0,
      streakDays = 0,
      height = 140,
      logoSize = 95,
      iconSize = 75,
      titleSizeRem = 1.75,
      pillLabelColor = '#ffffff',
      pillSubLabelColor = '#e0e0e0',
    },
    ref
  ) => {
    const level = useMemo(() => computeLevel(currentXP, maxXP), [currentXP, maxXP]);
    const xpSub = `${currentXP}/${maxXP} XP`;

    return (
      <header
        ref={ref}
        className="main-header"
        style={{
          height,
          minHeight: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0 40px', // Increase/decrease this to move logo/sign-out in from edges
          position: 'fixed',
          inset: '0 0 auto 0',
          backgroundColor: '#0b1526',
          color: '#fff',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}
      >
        {/* Left: logo + title */}
        <Flex alignItems="center" gap="0.75rem">
          <img
            src="/raccoon_bounty.png"
            alt="Raccoon Bounty"
            width={logoSize}
            height={logoSize}
            style={{ objectFit: 'contain', display: 'block' }}
          />
          <Text
            as="h1"
            fontWeight={800}
            color="#fff"
            margin="0"
            lineHeight="1.1"
            style={{ fontSize: `${titleSizeRem}rem`, letterSpacing: 0.2 }}
          >
            Raccoon Bounty |{' '}
            <span style={{ color: '#e7bb73', fontWeight: 800 }}>Treasure Hunting Gym</span>
          </Text>
        </Flex>

        {/* Center: stat pills */}
        <Flex
          alignItems="center"
          justifyContent="center"
          gap="0.75rem"
          style={{ minWidth: 0, flex: '1 1 auto' }}
        >
          <StatPill
            iconSrc="/raccoon.png"
            iconAlt="Experience"
            label={`Level ${level}`}
            sublabel={xpSub}
            iconSize={iconSize}
            labelColor={pillLabelColor}
            sublabelColor={pillSubLabelColor}
          />
          <StatPill
            iconSrc="/totem.png"
            iconAlt="Bounties completed"
            label={`${bountiesCompleted} completed`}
            sublabel="bounties"
            iconSize={iconSize}
            labelColor={pillLabelColor}
            sublabelColor={pillSubLabelColor}
          />
          <StatPill
            iconSrc="/blaze.png"
            iconAlt="Daily streak"
            label={`${streakDays} day blaze`}
            sublabel="daily streak"
            iconSize={iconSize}
            labelColor={pillLabelColor}
            sublabelColor={pillSubLabelColor}
          />
        </Flex>

        {/* Right: actions */}
        <Flex alignItems="center" gap="0.75rem">
          <Button
            onClick={signOut}
            variation="primary"
            size="small"
            style={{
              backgroundColor: '#e7bb73',
              border: 'none',
              color: '#eef1f3ff',
              fontWeight: 600,
            }}
          >
            Sign Out
          </Button>
        </Flex>
      </header>
    );
  }
);

Header.displayName = 'Header';






