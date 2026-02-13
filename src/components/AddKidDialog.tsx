import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

interface AddKidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddKid: (name: string) => Promise<{ error: Error | null }>;
}

export function AddKidDialog({ open, onOpenChange, onAddKid }: AddKidDialogProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const { error } = await onAddKid(name.trim());
    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: '🦸 New Hero Added!', description: `${name} is ready for adventure!` });
      setName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-fredoka">
            <UserPlus className="w-6 h-6 text-primary" />
            Add a New Hero
          </DialogTitle>
          <DialogDescription>
            Add a child to your family who can complete chores and earn rewards!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kid-name">Hero Name</Label>
            <Input
              id="kid-name"
              placeholder="Enter their name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg"
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-fun" disabled={loading || !name.trim()}>
              {loading ? 'Adding...' : 'Add Hero! 🌟'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
