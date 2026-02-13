import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Family, Kid, Chore, Reward, Badge } from '@/hooks/useFamily';
import { Button } from '@/components/ui/button';
import { KidCardEnhanced } from '@/components/KidCardEnhanced';
import { QuestBoard } from '@/components/QuestBoard';
import { RewardStore } from '@/components/RewardStore';
import { AddKidDialog } from '@/components/AddKidDialog';
import { AddChoreDialog } from '@/components/AddChoreDialog';
import { AddRewardDialog } from '@/components/AddRewardDialog';
import { EditChoreDialog } from '@/components/EditChoreDialog';
import { LevelUpModal } from '@/components/LevelUpModal';
import { KidDetailView } from '@/components/KidDetailView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, Home, CheckSquare, Gift, Trophy, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkLevelUp } from '@/lib/xp-utils';

interface DashboardProps {
  family: Family;
  kids: Kid[];
  chores: Chore[];
  rewards: Reward[];
  badges: Badge[];
  onAddKid: (name: string) => Promise<{ error: Error | null }>;
  onAddChore: (chore: Omit<Chore, 'id' | 'family_id' | 'status' | 'is_recurring' | 'recurrence_pattern' | 'updated_at'> & { recurrence_pattern?: 'daily' | 'weekly' | null }) => Promise<{ error: Error | null }>;
  onAddReward: (reward: Omit<Reward, 'id' | 'family_id'>) => Promise<{ error: Error | null }>;
  onUpdateChore: (choreId: string, updates: Partial<Omit<Chore, 'id' | 'family_id'>>) => Promise<{ error: Error | null }>;
  onDeleteChore: (choreId: string) => Promise<{ error: Error | null }>;
  onUpdateChoreStatus: (choreId: string, status: 'pending' | 'completed' | 'approved') => Promise<{ error: Error | null }>;
  onUpdateKidPoints: (kidId: string, points: number) => Promise<{ error: Error | null }>;
}

export function Dashboard({
  family,
  kids,
  chores,
  rewards,
  badges,
  onAddKid,
  onAddChore,
  onAddReward,
  onUpdateChore,
  onDeleteChore,
  onUpdateChoreStatus,
  onUpdateKidPoints,
}: DashboardProps) {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [addKidOpen, setAddKidOpen] = useState(false);
  const [addChoreOpen, setAddChoreOpen] = useState(false);
  const [addRewardOpen, setAddRewardOpen] = useState(false);
  const [editChoreOpen, setEditChoreOpen] = useState(false);
  const [choreToEdit, setChoreToEdit] = useState<Chore | null>(null);
  const [levelUpModal, setLevelUpModal] = useState<{ isOpen: boolean; kidName: string; newLevel: number }>({
    isOpen: false,
    kidName: '',
    newLevel: 0,
  });
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);

  const handleApproveChore = async (chore: Chore) => {
    const previousXP = chore.assigned_to ? kids.find(k => k.id === chore.assigned_to)?.total_xp || 0 : 0;
    
    const { error } = await onUpdateChoreStatus(chore.id, 'approved');
    if (!error && chore.assigned_to) {
      const kid = kids.find(k => k.id === chore.assigned_to);
      if (kid) {
        // Calculate new XP
        const xpReward = chore.difficulty === 'medium' ? 25 : chore.difficulty === 'hard' ? 50 : 10;
        const newXP = previousXP + xpReward;
        
        // Check for level up
        const { leveledUp, newLevel } = checkLevelUp(previousXP, newXP);
        if (leveledUp) {
          setLevelUpModal({ isOpen: true, kidName: kid.name, newLevel });
        }
        
        // Award points
        await onUpdateKidPoints(kid.id, kid.points + chore.points);
      }
    }
  };

  const handleEditChore = (chore: Chore) => {
    setChoreToEdit(chore);
    setEditChoreOpen(true);
  };

  const handleDeleteChore = async (choreId: string) => {
    const { error } = await onDeleteChore(choreId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: '🗑️ Quest Removed', description: 'The quest has been deleted.' });
    }
  };

  // Calculate family stats
  const totalXP = kids.reduce((sum, kid) => sum + (kid.total_xp || 0), 0);
  const totalPoints = kids.reduce((sum, kid) => sum + kid.points, 0);
  const activeStreaks = kids.filter(kid => (kid.current_streak || 0) > 0).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-fun p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-fredoka text-white">{family.name}</h1>
              <p className="text-white/80 text-sm">ChoreQuest Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-6 text-white">
              <div className="text-center">
                <p className="text-xs text-white/70">Total XP</p>
                <p className="text-lg font-bold">{totalXP}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/70">Total Points</p>
                <p className="text-lg font-bold">{totalPoints}</p>
              </div>
              {activeStreaks > 0 && (
                <div className="text-center flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  <div>
                    <p className="text-xs text-white/70">Active Streaks</p>
                    <p className="text-lg font-bold">{activeStreaks}</p>
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" onClick={signOut} className="text-white hover:bg-white/20">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6">
        {/* Kids Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-fredoka flex items-center gap-2">
              <Trophy className="w-6 h-6 text-accent" />
              Your Heroes
            </h2>
            <Button onClick={() => setAddKidOpen(true)} className="gradient-fun">
              <Plus className="w-4 h-4 mr-2" />
              Add Kid
            </Button>
          </div>
          
          {kids.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-primary/30">
              <p className="text-xl text-muted-foreground mb-4">No heroes yet! Add your first kid to start the adventure.</p>
              <Button onClick={() => setAddKidOpen(true)} className="gradient-fun">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Hero
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kids.map((kid) => (
                <KidCardEnhanced 
                  key={kid.id} 
                  kid={kid} 
                  badges={badges}
                  onClick={() => setSelectedKid(kid)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Tabs for Chores and Rewards */}
        <Tabs defaultValue="chores" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="chores" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chores">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-fredoka flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-success" />
                Quest Board
              </h2>
              <Button onClick={() => setAddChoreOpen(true)} className="gradient-success text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Quest
              </Button>
            </div>
            <QuestBoard
              chores={chores}
              kids={kids}
              onComplete={(choreId) => onUpdateChoreStatus(choreId, 'completed')}
              onApprove={handleApproveChore}
              onEdit={handleEditChore}
              onDelete={handleDeleteChore}
            />
          </TabsContent>

          <TabsContent value="rewards">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-fredoka flex items-center gap-2">
                <Gift className="w-6 h-6 text-warning" />
                Reward Store
              </h2>
              <Button onClick={() => setAddRewardOpen(true)} className="gradient-points text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Reward
              </Button>
            </div>
            <RewardStore rewards={rewards} kids={kids} onUpdateKidPoints={onUpdateKidPoints} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <AddKidDialog open={addKidOpen} onOpenChange={setAddKidOpen} onAddKid={onAddKid} />
      <AddChoreDialog open={addChoreOpen} onOpenChange={setAddChoreOpen} onAddChore={onAddChore} kids={kids} />
      <AddRewardDialog open={addRewardOpen} onOpenChange={setAddRewardOpen} onAddReward={onAddReward} />
      <EditChoreDialog
        open={editChoreOpen}
        onOpenChange={setEditChoreOpen}
        chore={choreToEdit}
        onUpdateChore={onUpdateChore}
        kids={kids}
      />
      
      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={levelUpModal.isOpen}
        kidName={levelUpModal.kidName}
        newLevel={levelUpModal.newLevel}
        onClose={() => setLevelUpModal({ isOpen: false, kidName: '', newLevel: 0 })}
      />

      {/* Kid Detail View */}
      {selectedKid && (
        <KidDetailView
          kid={selectedKid}
          badges={badges}
          onClose={() => setSelectedKid(null)}
        />
      )}
    </div>
  );
}
