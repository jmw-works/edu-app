// src/components/XPBar.tsx
import React from 'react';
import { Text, useTheme } from '@aws-amplify/ui-react';

/** Gold, animated XP bar (extracted from UserStatsPanel) */
export default function XPBar({
  percent, // 0..100 (fractional allowed)
  label,
  fillColor = '#e7bb73', // gold to match header titles
}: {
  percent: number;
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

