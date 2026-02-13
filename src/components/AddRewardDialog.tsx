import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Reward } from '@/hooks/useFamily';
import { Gift } from 'lucide-react';

interface AddRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddReward: (reward: Omit<Reward, 'id' | 'family_id'>) => Promise<{ error: Error | null }>;
}

const rewardIcons = ['🎮', '🍦', '🎬', '📱', '🎨', '⚽', '🎁', '🍕', '🎪', '🎠', '🎸', '🎯'];

export function AddRewardDialog({ open, onOpenChange, onAddReward }: AddRewardDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('50');
  const [selectedIcon, setSelectedIcon] = useState('🎁');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCost('50');
    setSelectedIcon('🎁');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const costValue = Math.min(500, Math.max(1, parseInt(cost) || 50));
    const { error } = await onAddReward({
      title: title.trim(),
      description: description.trim() || null,
      cost: costValue,
      icon: selectedIcon,
    });
    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: '🎁 Reward Added!', description: `${title} is now in the store!` });
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-fredoka">
            <Gift className="w-6 h-6 text-warning" />
            Create a Reward
          </DialogTitle>
          <DialogDescription>
            Add something exciting for your heroes to work towards!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reward-title">Reward Name</Label>
            <Input
              id="reward-title"
              placeholder="e.g., 30 min screen time"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reward-description">Description (optional)</Label>
            <Textarea
              id="reward-description"
              placeholder="What does this reward include?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reward-cost">Point Cost (1-500)</Label>
            <Input
              id="reward-cost"
              type="number"
              min="1"
              max="500"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Choose an Icon</Label>
            <div className="flex flex-wrap gap-2">
              {rewardIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    selectedIcon === icon 
                      ? 'bg-primary/20 ring-2 ring-primary scale-110' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-points text-white" disabled={loading || !title.trim()}>
              {loading ? 'Adding...' : 'Add Reward! 🌟'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
