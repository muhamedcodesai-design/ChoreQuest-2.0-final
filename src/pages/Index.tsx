import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/hooks/useFamily';
import { FamilySetup } from '@/components/FamilySetup';
import { Dashboard } from '@/components/Dashboard';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    family,
    kids,
    chores,
    rewards,
    badges,
    loading: familyLoading,
    createFamily,
    addKid,
    updateKidPoints,
    addChore,
    updateChore,
    deleteChore,
    updateChoreStatus,
    addReward,
  } = useFamily();

  // Show loading spinner
  if (authLoading || familyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading ChoreQuest...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show family setup if no family exists
  if (!family) {
    return <FamilySetup onCreateFamily={createFamily} />;
  }

  // Show main dashboard
  return (
    <Dashboard
      family={family}
      kids={kids}
      chores={chores}
      rewards={rewards}
      badges={badges}
      onAddKid={addKid}
      onAddChore={addChore}
      onAddReward={addReward}
      onUpdateChore={updateChore}
      onDeleteChore={deleteChore}
      onUpdateChoreStatus={updateChoreStatus}
      onUpdateKidPoints={updateKidPoints}
    />
  );
};

export default Index;
