import { useState, useCallback } from 'react';
import { Kid } from '@/hooks/useFamily';
import { checkLevelUp } from '@/lib/xp-utils';

interface LevelUpEvent {
  kidId: string;
  kidName: string;
  previousLevel: number;
  newLevel: number;
  xpGained: number;
}

export function useXPTracking() {
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  const trackXPGain = useCallback((kid: Kid, previousXP: number, xpGained: number) => {
    const newXP = previousXP + xpGained;
    const { leveledUp, newLevel, previousLevel } = checkLevelUp(previousXP, newXP);

    if (leveledUp) {
      setLevelUpEvent({
        kidId: kid.id,
        kidName: kid.name,
        previousLevel,
        newLevel,
        xpGained,
      });

      // Auto-dismiss after 5 seconds
      setTimeout(() => setLevelUpEvent(null), 5000);
    }
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUpEvent(null);
  }, []);

  return {
    levelUpEvent,
    trackXPGain,
    dismissLevelUp,
  };
}
