import { Card } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';

interface StreakIndicatorProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export function StreakIndicator({ currentStreak, longestStreak, lastActivityDate }: StreakIndicatorProps) {
  const isStreakActive = lastActivityDate ? isToday(new Date(lastActivityDate)) : false;

  function isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Current Streak */}
      <Card className={`p-4 text-center border-2 ${isStreakActive ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className={`w-5 h-5 ${isStreakActive ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
          <span className="text-xs font-medium text-muted-foreground">Current Streak</span>
        </div>
        <p className={`text-3xl font-bold ${isStreakActive ? 'text-orange-600' : 'text-gray-600'}`}>
          {currentStreak}
        </p>
        <p className="text-xs text-muted-foreground mt-1">days 🔥</p>
      </Card>

      {/* Longest Streak */}
      <Card className="p-4 text-center border-2 border-yellow-200 bg-yellow-50">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <span className="text-xs font-medium text-muted-foreground">Best Streak</span>
        </div>
        <p className="text-3xl font-bold text-yellow-700">{longestStreak}</p>
        <p className="text-xs text-muted-foreground mt-1">days 👑</p>
      </Card>
    </div>
  );
}
