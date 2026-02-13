import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Family {
  id: string;
  name: string;
  created_at: string;
}

export interface Kid {
  id: string;
  family_id: string;
  name: string;
  avatar_url: string | null;
  points: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export interface Chore {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  points: number;
  assigned_to: string | null;
  due_date: string | null;
  status: 'pending' | 'completed' | 'approved';
  is_recurring: boolean;
  recurrence_pattern: 'daily' | 'weekly' | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  updated_at: string;
}

export interface Reward {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  cost: number;
  icon: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

export interface KidBadge {
  id: string;
  kid_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export function useFamily() {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFamily = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Get family membership
    const { data: membership } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (membership) {
      const { data: familyData } = await supabase
        .from('families')
        .select('*')
        .eq('id', membership.family_id)
        .single();
      
      setFamily(familyData);
    }
    setLoading(false);
  };

  const fetchKids = async () => {
    if (!family) return;
    const { data } = await supabase
      .from('kids')
      .select('*')
      .eq('family_id', family.id)
      .order('name');
    setKids(data || []);
  };

  const fetchChores = async () => {
    if (!family) return;
    const { data } = await supabase
      .from('chores')
      .select('*')
      .eq('family_id', family.id)
      .order('created_at', { ascending: false });
    
    // Type assertion to handle the status and recurrence fields
    const typedChores = (data || []).map(chore => ({
      ...chore,
      status: chore.status as 'pending' | 'completed' | 'approved',
      is_recurring: chore.is_recurring ?? false,
      recurrence_pattern: chore.recurrence_pattern as 'daily' | 'weekly' | null
    }));

    // Filter out approved chores older than 24 hours (auto-hide)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filteredChores = typedChores.filter(chore => {
      if (chore.status !== 'approved') return true;
      const updatedAt = new Date(chore.updated_at);
      return updatedAt > twentyFourHoursAgo;
    });

    setChores(filteredChores);
  };

  const fetchRewards = async () => {
    if (!family) return;
    const { data } = await supabase
      .from('rewards')
      .select('*')
      .eq('family_id', family.id)
      .order('cost');
    setRewards(data || []);
  };

  const fetchBadges = async () => {
    const { data } = await supabase.from('badges').select('*');
    setBadges(data || []);
  };

  const createFamily = async (name: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Generate family ID client-side to avoid RLS chicken-and-egg problem
    const familyId = crypto.randomUUID();

    // Step 1: Insert family (without .select() - user isn't a member yet)
    const { error: familyError } = await supabase
      .from('families')
      .insert({ id: familyId, name });

    if (familyError) return { error: familyError };

    // Step 2: Add user as family member
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({ family_id: familyId, user_id: user.id });

    if (memberError) return { error: memberError };

    // Step 3: Now fetch the family (user is a member, so SELECT works)
    const { data: newFamily, error: fetchError } = await supabase
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single();

    if (fetchError) return { error: fetchError };

    setFamily(newFamily);
    return { error: null };
  };

  const addKid = async (name: string) => {
    if (!family) return { error: new Error('No family') };

    const { data, error } = await supabase
      .from('kids')
      .insert({ family_id: family.id, name })
      .select()
      .single();

    if (!error && data) {
      setKids(prev => [...prev, data]);
    }
    return { error };
  };

  const updateKidPoints = async (kidId: string, points: number) => {
    const { error } = await supabase
      .from('kids')
      .update({ points })
      .eq('id', kidId);

    if (!error) {
      setKids(prev => prev.map(k => k.id === kidId ? { ...k, points } : k));
    }
    return { error };
  };

  const addChore = async (chore: Omit<Chore, 'id' | 'family_id' | 'status' | 'is_recurring' | 'recurrence_pattern' | 'updated_at'> & { recurrence_pattern?: 'daily' | 'weekly' | null }) => {
    if (!family) return { error: new Error('No family') };

    const isRecurring = !!chore.recurrence_pattern;
    const { data, error } = await supabase
      .from('chores')
      .insert({ 
        ...chore, 
        family_id: family.id, 
        status: 'pending',
        is_recurring: isRecurring,
        recurrence_pattern: chore.recurrence_pattern || null
      })
      .select()
      .single();

    if (!error && data) {
      const typedChore = { 
        ...data, 
        status: data.status as 'pending' | 'completed' | 'approved',
        is_recurring: data.is_recurring ?? false,
        recurrence_pattern: data.recurrence_pattern as 'daily' | 'weekly' | null
      };
      setChores(prev => [typedChore, ...prev]);
    }
    return { error };
  };

  const updateChoreStatus = async (choreId: string, status: 'pending' | 'completed' | 'approved') => {
    const { error } = await supabase
      .from('chores')
      .update({ status })
      .eq('id', choreId);

    if (!error) {
      setChores(prev => prev.map(c => c.id === choreId ? { ...c, status } : c));
    }
    return { error };
  };

  const updateChore = async (choreId: string, updates: Partial<Omit<Chore, 'id' | 'family_id'>>) => {
    const { error } = await supabase
      .from('chores')
      .update(updates)
      .eq('id', choreId);

    if (!error) {
      setChores(prev => prev.map(c => c.id === choreId ? { ...c, ...updates } : c));
    }
    return { error };
  };

  const deleteChore = async (choreId: string) => {
    const { error } = await supabase
      .from('chores')
      .delete()
      .eq('id', choreId);

    if (!error) {
      setChores(prev => prev.filter(c => c.id !== choreId));
    }
    return { error };
  };

  const addReward = async (reward: Omit<Reward, 'id' | 'family_id'>) => {
    if (!family) return { error: new Error('No family') };

    const { data, error } = await supabase
      .from('rewards')
      .insert({ ...reward, family_id: family.id })
      .select()
      .single();

    if (!error && data) {
      setRewards(prev => [...prev, data]);
    }
    return { error };
  };

  useEffect(() => {
    fetchFamily();
    fetchBadges();
  }, [user]);

  useEffect(() => {
    if (family) {
      fetchKids();
      fetchChores();
      fetchRewards();
    }
  }, [family]);

  return {
    family,
    kids,
    chores,
    rewards,
    badges,
    loading,
    createFamily,
    addKid,
    updateKidPoints,
    addChore,
    updateChore,
    deleteChore,
    updateChoreStatus,
    addReward,
    refreshChores: fetchChores,
    refreshKids: fetchKids,
  };
}
