import { Chore, Kid } from '@/hooks/useFamily';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Star, User, RefreshCw, Pencil, Trash2 } from 'lucide-react';

interface ChoreListProps {
  chores: Chore[];
  kids: Kid[];
  onComplete: (choreId: string) => Promise<{ error: Error | null }>;
  onApprove: (chore: Chore) => Promise<void>;
  onEdit: (chore: Chore) => void;
  onDelete: (choreId: string) => void;
}

export function ChoreList({ chores, kids, onComplete, onApprove, onEdit, onDelete }: ChoreListProps) {
  const getKidName = (kidId: string | null) => {
    if (!kidId) return 'Anyone';
    return kids.find(k => k.id === kidId)?.name || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-muted"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'completed':
        return <Badge className="bg-warning text-warning-foreground"><Check className="w-3 h-3 mr-1" />Awaiting Approval</Badge>;
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><Star className="w-3 h-3 mr-1" />Approved!</Badge>;
      default:
        return null;
    }
  };

  if (chores.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-success/30">
        <p className="text-xl text-muted-foreground">No quests yet! Add some chores to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chores.map((chore) => (
        <Card key={chore.id} className={`border-2 transition-all ${
          chore.status === 'approved' ? 'border-success/30 bg-success/5' :
          chore.status === 'completed' ? 'border-warning/30 bg-warning/5' :
          'border-primary/20'
        }`}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-semibold">{chore.title}</h3>
                  {getStatusBadge(chore.status)}
                  {chore.recurrence_pattern && (
                    <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      {chore.recurrence_pattern === 'daily' ? 'Daily' : 'Weekly'}
                    </Badge>
                  )}
                </div>
                {chore.description && (
                  <p className="text-muted-foreground text-sm mb-2">{chore.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-accent font-semibold">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    {chore.points} pts
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <User className="w-4 h-4" />
                    {getKidName(chore.assigned_to)}
                  </span>
                  {chore.due_date && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(chore.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {chore.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="border-success text-success hover:bg-success hover:text-success-foreground"
                    onClick={() => onComplete(chore.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark Done
                  </Button>
                )}
                {chore.status === 'completed' && (
                  <Button
                    className="gradient-success text-white"
                    onClick={() => onApprove(chore)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Approve & Award Points
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => onEdit(chore)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(chore.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
