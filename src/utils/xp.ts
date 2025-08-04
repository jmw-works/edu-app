export function calculateXPProgress(currentXP: number, maxXP: number = 100): number {
  return Math.min(100, (currentXP / maxXP) * 100);
}

