import { useEffect, useCallback } from 'react';
import { Chore } from '@/hooks/useFamily';
import { shouldCreateRecurringInstance, getNextDueDate } from '@/lib/recurring-chores-utils';

interface UseRecurringChoresProps {
  chores: Chore[];
  onAddChore: (chore: Omit<Chore, 'id' | 'family_id' | 'status' | 'is_recurring' | 'recurrence_pattern' | 'updated_at'> & { recurrence_pattern?: 'daily' | 'weekly' | null }) => Promise<{ error: Error | null }>;
}

export function useRecurringChores({ chores, onAddChore }: UseRecurringChoresProps) {
  const processRecurringChores = useCallback(async () => {
    const recurringChores = chores.filter(c => c.is_recurring);

    for (const chore of recurringChores) {
      if (shouldCreateRecurringInstance(chore, chore.updated_at)) {
        const nextDueDate = getNextDueDate(chore.recurrence_pattern);

        await onAddChore({
          title: chore.title,
          description: chore.description,
          points: chore.points,
          assigned_to: chore.assigned_to,
          due_date: nextDueDate ? nextDueDate.toISOString().split('T')[0] : null,
          recurrence_pattern: chore.recurrence_pattern,
          difficulty: chore.difficulty,
        });
      }
    }
  }, [chores, onAddChore]);

  // Check for recurring chores every hour
  useEffect(() => {
    processRecurringChores();
    const interval = setInterval(processRecurringChores, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [processRecurringChores]);

  return { processRecurringChores };
}
