import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Chore, Kid } from '@/hooks/useFamily';
import { Pencil, RefreshCw } from 'lucide-react';

interface EditChoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chore: Chore | null;
  onUpdateChore: (choreId: string, updates: Partial<Omit<Chore, 'id' | 'family_id'>>) => Promise<{ error: Error | null }>;
  kids: Kid[];
}

export function EditChoreDialog({ open, onOpenChange, chore, onUpdateChore, kids }: EditChoreDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('10');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [recurrencePattern, setRecurrencePattern] = useState<'none' | 'daily' | 'weekly'>('none');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (chore) {
      setTitle(chore.title);
      setDescription(chore.description || '');
      setPoints(String(chore.points));
      setAssignedTo(chore.assigned_to || '');
      setDueDate(chore.due_date || '');
      setRecurrencePattern(chore.recurrence_pattern || 'none');
    }
  }, [chore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chore || !title.trim()) return;

    setLoading(true);
    const isRecurring = recurrencePattern !== 'none';
    const pointsValue = Math.min(100, Math.max(1, parseInt(points) || 10));
    const { error } = await onUpdateChore(chore.id, {
      title: title.trim(),
      description: description.trim() || null,
      points: pointsValue,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      is_recurring: isRecurring,
      recurrence_pattern: recurrencePattern === 'none' ? null : recurrencePattern,
    });
    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: '✏️ Quest Updated!', description: `${title} has been updated.` });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-fredoka">
            <Pencil className="w-6 h-6 text-primary" />
            Edit Quest
          </DialogTitle>
          <DialogDescription>
            Update this quest's details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-chore-title">Quest Name</Label>
            <Input
              id="edit-chore-title"
              placeholder="e.g., Make your bed"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-chore-description">Description (optional)</Label>
            <Textarea
              id="edit-chore-description"
              placeholder="Any extra details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-chore-points">Points (1-100)</Label>
              <Input
                id="edit-chore-points"
                type="number"
                min="1"
                max="100"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-chore-due">Due Date (optional)</Label>
              <Input
                id="edit-chore-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-chore-assign">Assign To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Anyone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Anyone</SelectItem>
                  {kids.map((kid) => (
                    <SelectItem key={kid.id} value={kid.id}>
                      {kid.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-chore-recurrence" className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Repeat
              </Label>
              <Select value={recurrencePattern} onValueChange={(v) => setRecurrencePattern(v as 'none' | 'daily' | 'weekly')}>
                <SelectTrigger>
                  <SelectValue placeholder="One-time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary text-white" disabled={loading || !title.trim()}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
