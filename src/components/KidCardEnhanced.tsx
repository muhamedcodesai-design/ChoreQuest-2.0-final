import { Kid, Badge, KidBadge } from '@/hooks/useFamily';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getLevelInfo } from '@/lib/xp-utils';
import { Trophy, Zap, Flame } from 'lucide-react';

interface KidCardEnhancedProps {
  kid: Kid;
  badges: Badge[];
  kidBadges?: KidBadge[];
  onClick?: () => void;
}

export function KidCardEnhanced({ kid, badges, kidBadges = [], onClick }: KidCardEnhancedProps) {
  const levelInfo = getLevelInfo(kid.total_xp || 0);
  const earnedBadges = kidBadges.filter(kb => badges.some(b => b.id === kb.badge_id));

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      {/* Header with Name and Level Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-fredoka text-primary">{kid.name}</h3>
          <p className="text-sm text-muted-foreground">Hero Profile</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <span className="font-bold text-yellow-700">Lvl {levelInfo.level}</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-muted-foreground">
              {kid.total_xp || 0} / {levelInfo.nextLevelXP} XP
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {levelInfo.xpToNextLevel} to next level
          </span>
        </div>
        <Progress value={levelInfo.progressPercentage} className="h-2" />
      </div>

      {/* Points Display */}
      <div className="bg-card border border-primary/20 rounded-lg p-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Reward Points</p>
          <p className="text-2xl font-bold text-primary">{kid.points}</p>
        </div>
      </div>

      {/* Streak Display */}
      {(kid.current_streak || 0) > 0 && (
        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-xs font-medium text-orange-700">{kid.current_streak} day streak!</p>
            <p className="text-xs text-orange-600">Best: {kid.longest_streak} days</p>
          </div>
        </div>
      )}

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Badges Earned</p>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.slice(0, 3).map((kb) => {
              const badge = badges.find(b => b.id === kb.badge_id);
              return badge ? (
                <div key={kb.id} className="text-lg" title={badge.name}>
                  {badge.icon}
                </div>
              ) : null;
            })}
            {earnedBadges.length > 3 && (
              <div className="text-xs bg-primary/10 px-2 py-1 rounded text-primary font-medium">
                +{earnedBadges.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
