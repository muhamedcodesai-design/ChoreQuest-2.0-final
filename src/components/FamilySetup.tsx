import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Home, Sparkles, Users } from 'lucide-react';

interface FamilySetupProps {
  onCreateFamily: (name: string) => Promise<{ error: Error | null }>;
}

export function FamilySetup({ onCreateFamily }: FamilySetupProps) {
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    setLoading(true);
    const { error } = await onCreateFamily(familyName);
    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Family Created! 🏠', description: 'Now add your kids to get started!' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center gap-3 mb-4">
            <Home className="w-10 h-10 text-primary animate-bounce-slow" />
            <Users className="w-10 h-10 text-secondary animate-bounce-slow" style={{ animationDelay: '0.3s' }} />
            <Sparkles className="w-10 h-10 text-accent animate-bounce-slow" style={{ animationDelay: '0.6s' }} />
          </div>
          <CardTitle className="text-3xl font-fredoka text-gradient-fun">Create Your Family</CardTitle>
          <CardDescription className="text-lg">
            Give your family a fun name to start the chore adventure!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="family-name" className="text-lg">Family Name</Label>
              <Input
                id="family-name"
                type="text"
                placeholder="The Awesome Smiths 🌟"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="text-lg py-6"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full gradient-fun text-lg py-6" 
              disabled={loading || !familyName.trim()}
            >
              {loading ? 'Creating...' : 'Create Family! 🏠'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
