/**
 * Recurring Chores Utility Functions
 * Handles the logic for generating recurring chore instances
 */

import { Chore } from '@/hooks/useFamily';

export interface RecurringChoreInstance extends Omit<Chore, 'id' | 'created_at'> {
  parent_chore_id?: string;
  instance_date: Date;
}

/**
 * Check if a chore should have a new instance today
 */
export function shouldCreateRecurringInstance(
  chore: Chore,
  lastUpdatedAt: string
): boolean {
  if (!chore.is_recurring) return false;

  const lastUpdated = new Date(lastUpdatedAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastUpdated.setHours(0, 0, 0, 0);

  if (chore.recurrence_pattern === 'daily') {
    return lastUpdated < today;
  }

  if (chore.recurrence_pattern === 'weekly') {
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastUpdated <= weekAgo;
  }

  return false;
}

/**
 * Generate the next due date for a recurring chore
 */
export function getNextDueDate(recurrencePattern: 'daily' | 'weekly' | null): Date | null {
  if (!recurrencePattern) return null;

  const today = new Date();

  if (recurrencePattern === 'daily') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  if (recurrencePattern === 'weekly') {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }

  return null;
}

/**
 * Get a human-readable recurrence label
 */
export function getRecurrenceLabel(pattern: 'daily' | 'weekly' | null): string {
  const labels: Record<string, string> = {
    daily: '📅 Daily',
    weekly: '📆 Weekly',
  };
  return labels[pattern || ''] || 'One-time';
}

/**
 * Get the recurrence badge color
 */
export function getRecurrenceBadgeColor(pattern: 'daily' | 'weekly' | null): string {
  const colors: Record<string, string> = {
    daily: 'bg-blue-100 text-blue-800',
    weekly: 'bg-purple-100 text-purple-800',
  };
  return colors[pattern || ''] || 'bg-gray-100 text-gray-800';
}

/**
 * Filter chores to show only active ones (including recurring instances)
 */
export function getActiveChores(chores: Chore[]): Chore[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return chores.filter((chore) => {
    // Include pending and completed chores
    if (chore.status === 'pending' || chore.status === 'completed') {
      return true;
    }

    // Include approved chores from today
    if (chore.status === 'approved') {
      const updatedAt = new Date(chore.updated_at);
      updatedAt.setHours(0, 0, 0, 0);
      return updatedAt.getTime() === today.getTime();
    }

    return false;
  });
}

/**
 * Group chores by recurrence pattern for display
 */
export function groupChoresByRecurrence(
  chores: Chore[]
): {
  daily: Chore[];
  weekly: Chore[];
  oneTime: Chore[];
} {
  return {
    daily: chores.filter((c) => c.recurrence_pattern === 'daily'),
    weekly: chores.filter((c) => c.recurrence_pattern === 'weekly'),
    oneTime: chores.filter((c) => !c.is_recurring),
  };
}
