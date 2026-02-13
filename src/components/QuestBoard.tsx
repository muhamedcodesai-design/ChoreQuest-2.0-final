import { useState } from 'react';
import { Chore, Kid } from '@/hooks/useFamily';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getXPForDifficulty } from '@/lib/xp-utils';
import { CheckCircle2, Clock, Zap, Trash2, Edit2 } from 'lucide-react';

interface QuestBoardProps {
  chores: Chore[];
  kids: Kid[];
  onComplete: (choreId: string) => Promise<void>;
  onApprove: (chore: Chore) => Promise<void>;
  onEdit: (chore: Chore) => void;
  onDelete: (choreId: string) => Promise<void>;
}

export function QuestBoard({
  chores,
  kids,
  onComplete,
  onApprove,
  onEdit,
  onDelete,
}: QuestBoardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const getKidName = (kidId: string | null) => {
    if (!kidId) return 'Unassigned';
    return kids.find(k => k.id === kidId)?.name || 'Unknown';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyIcon = (difficulty: string) => {
    const icons: Record<string, string> = {
      easy: '⭐',
      medium: '⭐⭐',
      hard: '⭐⭐⭐',
    };
    return icons[difficulty] || '⭐';
  };

  const activeChores = chores.filter(c => c.status !== 'approved');
  const completedChores = chores.filter(c => c.status === 'approved');

  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="active">
          <Clock className="w-4 h-4 mr-2" />
          Active Quests ({activeChores.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Completed ({completedChores.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-3">
        {activeChores.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-muted-foreground">No active quests. Time to add some adventures!</p>
          </Card>
        ) : (
          activeChores.map((chore) => (
            <Card key={chore.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                {/* Quest Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-fredoka text-lg text-primary truncate">{chore.title}</h3>
                    <Badge className={getDifficultyColor(chore.difficulty || 'easy')}>
                      {getDifficultyIcon(chore.difficulty || 'easy')}
                    </Badge>
                  </div>

                  {chore.description && (
                    <p className="text-sm text-muted-foreground mb-2">{chore.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">
                        {getXPForDifficulty(chore.difficulty as 'easy' | 'medium' | 'hard' || 'easy')} XP
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      Assigned to: <span className="font-medium">{getKidName(chore.assigned_to)}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {chore.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setLoading(chore.id);
                        onComplete(chore.id).finally(() => setLoading(null));
                      }}
                      disabled={loading === chore.id}
                      className="whitespace-nowrap"
                    >
                      {loading === chore.id ? 'Completing...' : 'Mark Done'}
                    </Button>
                  )}
                  {chore.status === 'completed' && (
                    <Button
                      size="sm"
                      className="gradient-success text-white whitespace-nowrap"
                      onClick={() => {
                        setLoading(chore.id);
                        onApprove(chore).finally(() => setLoading(null));
                      }}
                      disabled={loading === chore.id}
                    >
                      {loading === chore.id ? 'Approving...' : 'Approve'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(chore)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(chore.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-3">
        {completedChores.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-muted-foreground">No completed quests yet. Keep grinding!</p>
          </Card>
        ) : (
          completedChores.map((chore) => (
            <Card key={chore.id} className="p-4 bg-success/5 border-success/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <h3 className="font-fredoka text-lg text-primary truncate">{chore.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Completed by: <span className="font-medium">{getKidName(chore.assigned_to)}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-success font-bold">
                    <Zap className="w-4 h-4" />
                    +{getXPForDifficulty(chore.difficulty as 'easy' | 'medium' | 'hard' || 'easy')} XP
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
