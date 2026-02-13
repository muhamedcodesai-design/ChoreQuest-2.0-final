import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  kidName: string;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ isOpen, kidName, newLevel, onClose }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">🎉 Level Up! 🎉</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-8">
          {/* Celebration Animation */}
          {showConfetti && (
            <div className="flex justify-center gap-4">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
              <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          )}

          {/* Level Display */}
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              Congratulations, <span className="font-bold text-primary">{kidName}</span>!
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-12 h-12 text-yellow-500" />
              <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {newLevel}
              </div>
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>

            <p className="text-sm text-muted-foreground">
              You've reached <span className="font-bold">Level {newLevel}</span>!
            </p>
          </div>

          {/* Action Button */}
          <Button onClick={onClose} className="w-full gradient-fun text-white">
            Awesome! Keep Going! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
