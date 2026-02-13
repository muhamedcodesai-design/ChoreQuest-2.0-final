import { Kid, Badge } from '@/hooks/useFamily';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Award } from 'lucide-react';

const kidAvatars = ['🦸', '🦹', '🧙', '🧚', '🦄', '🐱', '🐶', '🦊', '🐼', '🐸'];

interface KidCardProps {
  kid: Kid;
  badges: Badge[];
}

export function KidCard({ kid, badges }: KidCardProps) {
  // Generate a consistent avatar based on kid's name
  const avatarIndex = kid.name.charCodeAt(0) % kidAvatars.length;
  const avatar = kid.avatar_url || kidAvatars[avatarIndex];

  return (
    <Card className="card-hover overflow-hidden border-2 border-primary/20">
      <div className="gradient-fun p-4 text-center">
        <div className="text-6xl mb-2">{avatar}</div>
        <h3 className="text-xl font-fredoka text-white">{kid.name}</h3>
      </div>
      <CardContent className="p-4">
        {/* Points Display */}
        <div className="flex items-center justify-center gap-2 bg-accent/20 rounded-xl p-3 mb-3">
          <Star className="w-6 h-6 text-accent fill-accent" />
          <span className="text-2xl font-bold font-fredoka text-accent-foreground">{kid.points}</span>
          <span className="text-muted-foreground">points</span>
        </div>

        {/* Badges Preview */}
        <div className="flex items-center justify-center gap-1">
          <Award className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {badges.filter(b => b.requirement_value <= kid.points).length} badges earned
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
