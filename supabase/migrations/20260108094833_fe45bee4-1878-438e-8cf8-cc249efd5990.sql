-- Drop existing RESTRICTIVE policies on families
DROP POLICY IF EXISTS "Authenticated users can create families" ON public.families;
DROP POLICY IF EXISTS "Family members can view family" ON public.families;
DROP POLICY IF EXISTS "Family members can update family" ON public.families;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Authenticated users can create families" ON public.families
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Family members can view family" ON public.families
  FOR SELECT 
  TO authenticated
  USING (public.is_family_member(auth.uid(), id));

CREATE POLICY "Family members can update family" ON public.families
  FOR UPDATE 
  TO authenticated
  USING (public.is_family_member(auth.uid(), id));

-- Drop existing RESTRICTIVE policies on family_members
DROP POLICY IF EXISTS "Authenticated users can add themselves to family" ON public.family_members;
DROP POLICY IF EXISTS "Family members can view members" ON public.family_members;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Authenticated users can add themselves to family" ON public.family_members
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Family members can view members" ON public.family_members
  FOR SELECT 
  TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));