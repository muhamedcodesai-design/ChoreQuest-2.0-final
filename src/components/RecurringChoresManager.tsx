import { Chore, Kid } from '@/hooks/useFamily';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRecurrenceLabel, getRecurrenceBadgeColor } from '@/lib/recurring-chores-utils';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';

interface RecurringChoresManagerProps {
  chores: Chore[];
  kids: Kid[];
  onEdit: (chore: Chore) => void;
  onDelete: (choreId: string) => void;
}

export function RecurringChoresManager({
  chores,
  kids,
  onEdit,
  onDelete,
}: RecurringChoresManagerProps) {
  const recurringChores = chores.filter(c => c.is_recurring);

  const getKidName = (kidId: string | null) => {
    if (!kidId) return 'Anyone';
    return kids.find(k => k.id === kidId)?.name || 'Unknown';
  };

  if (recurringChores.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <RefreshCw className="w-12 h-12 text-primary/30 mx-auto mb-4" />
        <p className="text-muted-foreground">No recurring quests yet. Create one to automate chores!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recurringChores.map((chore) => (
        <Card key={chore.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            {/* Chore Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-fredoka text-lg text-primary truncate">{chore.title}</h3>
                <Badge className={getRecurrenceBadgeColor(chore.recurrence_pattern)}>
                  {getRecurrenceLabel(chore.recurrence_pattern)}
                </Badge>
              </div>

              {chore.description && (
                <p className="text-sm text-muted-foreground mb-2">{chore.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Assigned to: <span className="font-medium">{getKidName(chore.assigned_to)}</span>
                </span>
                {chore.due_date && (
                  <span className="text-muted-foreground">
                    Due: <span className="font-medium">{new Date(chore.due_date).toLocaleDateString()}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
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
      ))}
    </div>
  );
}
