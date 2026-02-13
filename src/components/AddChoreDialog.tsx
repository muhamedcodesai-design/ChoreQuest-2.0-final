import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Chore, Kid } from '@/hooks/useFamily';
import { ClipboardList, RefreshCw } from 'lucide-react';

interface AddChoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddChore: (chore: Omit<Chore, 'id' | 'family_id' | 'status' | 'is_recurring' | 'recurrence_pattern' | 'updated_at'> & { recurrence_pattern?: 'daily' | 'weekly' | null }) => Promise<{ error: Error | null }>;
  kids: Kid[];
}

export function AddChoreDialog({ open, onOpenChange, onAddChore, kids }: AddChoreDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('10');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [recurrencePattern, setRecurrencePattern] = useState<'none' | 'daily' | 'weekly'>('none');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPoints('10');
    setAssignedTo('');
    setDueDate('');
    setRecurrencePattern('none');
    setDifficulty('easy');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const pointsValue = Math.min(100, Math.max(1, parseInt(points) || 10));
    const { error } = await onAddChore({
      title: title.trim(),
      description: description.trim() || null,
      points: pointsValue,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      recurrence_pattern: recurrencePattern === 'none' ? null : recurrencePattern,
      difficulty,
    });
    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: '📋 Quest Added!', description: `${title} is now on the quest board!` });
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-fredoka">
            <ClipboardList className="w-6 h-6 text-success" />
            Create a Quest
          </DialogTitle>
          <DialogDescription>
            Add a new chore for your heroes to complete!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chore-title">Quest Name</Label>
            <Input
              id="chore-title"
              placeholder="e.g., Make your bed"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chore-description">Description (optional)</Label>
            <Textarea
              id="chore-description"
              placeholder="Any extra details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chore-points">Points (1-100)</Label>
              <Input
                id="chore-points"
                type="number"
                min="1"
                max="100"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chore-due">Due Date (optional)</Label>
              <Input
                id="chore-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chore-difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}>
                <SelectTrigger>
                  <SelectValue placeholder="Easy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">⭐ Easy (10 XP)</SelectItem>
                  <SelectItem value="medium">⭐⭐ Medium (25 XP)</SelectItem>
                  <SelectItem value="hard">⭐⭐⭐ Hard (50 XP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chore-assign">Assign To</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="chore-recurrence" className="flex items-center gap-1">
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

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-success text-white" disabled={loading || !title.trim()}>
              {loading ? 'Adding...' : 'Create Quest! ⚔️'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
