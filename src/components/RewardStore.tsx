import { useState } from 'react';
import { Reward, Kid } from '@/hooks/useFamily';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Gift, Star, ShoppingCart } from 'lucide-react';

const rewardIcons = ['🎮', '🍦', '🎬', '📱', '🎨', '⚽', '🎁', '🍕', '🎪', '🎠'];

interface RewardStoreProps {
  rewards: Reward[];
  kids: Kid[];
  onUpdateKidPoints: (kidId: string, points: number) => Promise<{ error: Error | null }>;
}

export function RewardStore({ rewards, kids, onUpdateKidPoints }: RewardStoreProps) {
  const { toast } = useToast();
  const [selectedKid, setSelectedKid] = useState<string>('');

  const handleRedeem = async (reward: Reward) => {
    if (!selectedKid) {
      toast({ variant: 'destructive', title: 'Select a kid first!' });
      return;
    }

    const kid = kids.find(k => k.id === selectedKid);
    if (!kid) return;

    if (kid.points < reward.cost) {
      toast({ 
        variant: 'destructive', 
        title: 'Not enough points!', 
        description: `${kid.name} needs ${reward.cost - kid.points} more points.` 
      });
      return;
    }

    const { error } = await onUpdateKidPoints(kid.id, kid.points - reward.cost);
    if (!error) {
      toast({ 
        title: `🎉 ${reward.title} Redeemed!`, 
        description: `${kid.name} spent ${reward.cost} points.` 
      });
    }
  };

  if (rewards.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-warning/30">
        <p className="text-xl text-muted-foreground">No rewards yet! Add some rewards to motivate your heroes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Kid Selector */}
      <div className="flex items-center gap-3 p-4 bg-card rounded-xl border-2 border-primary/20">
        <ShoppingCart className="w-5 h-5 text-primary" />
        <span className="font-semibold">Shopping for:</span>
        <Select value={selectedKid} onValueChange={setSelectedKid}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a kid" />
          </SelectTrigger>
          <SelectContent>
            {kids.map((kid) => (
              <SelectItem key={kid.id} value={kid.id}>
                {kid.name} ({kid.points} pts)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward, index) => {
          const icon = reward.icon || rewardIcons[index % rewardIcons.length];
          const selectedKidData = kids.find(k => k.id === selectedKid);
          const canAfford = selectedKidData ? selectedKidData.points >= reward.cost : false;

          return (
            <Card key={reward.id} className="card-hover border-2 border-warning/20 overflow-hidden">
              <div className="gradient-points p-4 text-center">
                <span className="text-5xl">{icon}</span>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-fredoka mb-1">{reward.title}</h3>
                {reward.description && (
                  <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-lg font-bold text-accent">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    {reward.cost}
                  </span>
                  <Button
                    size="sm"
                    disabled={!selectedKid || !canAfford}
                    className={canAfford ? 'gradient-fun' : ''}
                    onClick={() => handleRedeem(reward)}
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
