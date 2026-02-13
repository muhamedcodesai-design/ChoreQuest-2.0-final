import { Kid, Badge } from '@/hooks/useFamily';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLevelInfo } from '@/lib/xp-utils';
import { KidActivityTimeline } from '@/components/KidActivityTimeline';
import { StreakIndicator } from '@/components/StreakIndicator';
import { Progress } from '@/components/ui/progress';
import { X, Trophy, Zap, Flame } from 'lucide-react';

interface KidDetailViewProps {
  kid: Kid;
  badges: Badge[];
  onClose: () => void;
}

export function KidDetailView({ kid, badges, onClose }: KidDetailViewProps) {
  const levelInfo = getLevelInfo(kid.total_xp || 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/80 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-fredoka">{kid.name}'s Journey</h2>
            <p className="text-white/80">Hero Level {levelInfo.level}</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center bg-primary/5">
              <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="text-2xl font-bold text-primary">{levelInfo.level}</p>
            </Card>
            <Card className="p-4 text-center bg-orange-50">
              <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Total XP</p>
              <p className="text-2xl font-bold text-orange-600">{kid.total_xp || 0}</p>
            </Card>
            <Card className="p-4 text-center bg-primary/5">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="text-2xl font-bold text-primary">{kid.points}</p>
            </Card>
          </div>

          {/* XP Progress */}
          <Card className="p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium">Progress to Level {levelInfo.level + 1}</p>
              <p className="text-sm text-muted-foreground">
                {kid.total_xp || 0} / {levelInfo.nextLevelXP} XP
              </p>
            </div>
            <Progress value={levelInfo.progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {levelInfo.xpToNextLevel} XP to next level
            </p>
          </Card>

          {/* Streak Indicator */}
          <StreakIndicator
            currentStreak={kid.current_streak || 0}
            longestStreak={kid.longest_streak || 0}
            lastActivityDate={kid.last_activity_date}
          />

          {/* Tabs */}
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
              <TabsTrigger value="badges">Badges ({badges.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <KidActivityTimeline kidId={kid.id} kidName={kid.name} />
            </TabsContent>

            <TabsContent value="badges" className="space-y-4">
              {badges.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-muted-foreground">No badges earned yet. Keep completing quests!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <Card key={badge.id} className="p-4 text-center hover:shadow-lg transition-shadow">
                      <p className="text-4xl mb-2">{badge.icon}</p>
                      <p className="font-medium text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
