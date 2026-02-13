-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('parent', 'kid');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create families table
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create family_members table (links users to families)
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id)
);

-- Create kids table (kids managed by parents, no auth needed)
CREATE TABLE public.kids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chores table
CREATE TABLE public.chores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  assigned_to UUID REFERENCES public.kids(id) ON DELETE SET NULL,
  due_date DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rewards table
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reward_redemptions table
CREATE TABLE public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES public.kids(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL
);

-- Create kid_badges table
CREATE TABLE public.kid_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES public.kids(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kid_id, badge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kid_badges ENABLE ROW LEVEL SECURITY;

-- Security definer function to check family membership
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = _user_id AND family_id = _family_id
  )
$$;

-- Security definer function to check if user has parent role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies (only viewable by own user)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Families policies
CREATE POLICY "Family members can view family" ON public.families
  FOR SELECT USING (public.is_family_member(auth.uid(), id));
CREATE POLICY "Authenticated users can create families" ON public.families
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Family members can update family" ON public.families
  FOR UPDATE USING (public.is_family_member(auth.uid(), id));

-- Family members policies
CREATE POLICY "Family members can view members" ON public.family_members
  FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Authenticated users can add themselves to family" ON public.family_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kids policies (family members can manage)
CREATE POLICY "Family members can view kids" ON public.kids
  FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can add kids" ON public.kids
  FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can update kids" ON public.kids
  FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can delete kids" ON public.kids
  FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- Chores policies
CREATE POLICY "Family members can view chores" ON public.chores
  FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can add chores" ON public.chores
  FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can update chores" ON public.chores
  FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can delete chores" ON public.chores
  FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- Rewards policies
CREATE POLICY "Family members can view rewards" ON public.rewards
  FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can add rewards" ON public.rewards
  FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can update rewards" ON public.rewards
  FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can delete rewards" ON public.rewards
  FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- Reward redemptions policies
CREATE POLICY "Family members can view redemptions" ON public.reward_redemptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.kids k
      WHERE k.id = kid_id AND public.is_family_member(auth.uid(), k.family_id)
    )
  );
CREATE POLICY "Family members can add redemptions" ON public.reward_redemptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kids k
      WHERE k.id = kid_id AND public.is_family_member(auth.uid(), k.family_id)
    )
  );
CREATE POLICY "Family members can update redemptions" ON public.reward_redemptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.kids k
      WHERE k.id = kid_id AND public.is_family_member(auth.uid(), k.family_id)
    )
  );

-- Badges policies (public read for all badges)
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (true);

-- Kid badges policies
CREATE POLICY "Family members can view kid badges" ON public.kid_badges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.kids k
      WHERE k.id = kid_id AND public.is_family_member(auth.uid(), k.family_id)
    )
  );
CREATE POLICY "Family members can add kid badges" ON public.kid_badges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kids k
      WHERE k.id = kid_id AND public.is_family_member(auth.uid(), k.family_id)
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kids_updated_at BEFORE UPDATE ON public.kids
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chores_updated_at BEFORE UPDATE ON public.chores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value) VALUES
  ('First Step', 'Complete your first chore!', '🌟', 'chores_completed', 1),
  ('High Five', 'Complete 5 chores', '✋', 'chores_completed', 5),
  ('Perfect 10', 'Complete 10 chores', '🏆', 'chores_completed', 10),
  ('Chore Champion', 'Complete 25 chores', '👑', 'chores_completed', 25),
  ('Streak Starter', 'Complete chores 3 days in a row', '🔥', 'streak_days', 3),
  ('Week Warrior', 'Complete chores 7 days in a row', '⚡', 'streak_days', 7),
  ('Point Collector', 'Earn 100 points', '💎', 'points_earned', 100),
  ('Super Saver', 'Earn 500 points', '💰', 'points_earned', 500);