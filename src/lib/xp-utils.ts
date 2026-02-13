/**
 * XP and Level Utility Functions
 * Implements a simple progression system where level = floor(sqrt(totalXP / 100)) + 1
 */

export interface LevelInfo {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercentage: number;
  xpToNextLevel: number;
}

/**
 * Calculate the total XP required to reach a specific level
 */
export function getTotalXPForLevel(level: number): number {
  if (level <= 1) return 0;
  // XP = 100 * (level - 1)^2
  return 100 * Math.pow(level - 1, 2);
}

/**
 * Calculate the current level based on total XP
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

/**
 * Get detailed level information for a given total XP
 */
export function getLevelInfo(totalXP: number): LevelInfo {
  const level = calculateLevel(totalXP);
  const currentLevelXP = getTotalXPForLevel(level);
  const nextLevelXP = getTotalXPForLevel(level + 1);
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    progressPercentage,
    xpToNextLevel: Math.max(0, nextLevelXP - totalXP),
  };
}

/**
 * Get XP reward based on chore difficulty
 */
export function getXPForDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
  const xpMap = {
    easy: 10,
    medium: 25,
    hard: 50,
  };
  return xpMap[difficulty];
}

/**
 * Check if a kid has leveled up and return the new level
 */
export function checkLevelUp(previousXP: number, newXP: number): { leveledUp: boolean; newLevel: number } {
  const previousLevel = calculateLevel(previousXP);
  const newLevel = calculateLevel(newXP);

  return {
    leveledUp: newLevel > previousLevel,
    newLevel,
  };
}
