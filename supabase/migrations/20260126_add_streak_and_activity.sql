-- Add streak tracking and activity timeline features

-- Add streak columns to kids table
ALTER TABLE public.kids 
ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0,
ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0,
ADD COLUMN last_activity_date DATE;

-- Create activity_log table for timeline
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES public.kids(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('chore_completed', 'chore_approved', 'badge_earned', 'level_up', 'reward_redeemed')),
  chore_id UUID REFERENCES public.chores(id) ON DELETE SET NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE SET NULL,
  reward_id UUID REFERENCES public.rewards(id) ON DELETE SET NULL,
  xp_earned INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_activity_log_kid_id ON public.activity_log(kid_id);
CREATE INDEX idx_activity_log_family_id ON public.activity_log(family_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Enable RLS on activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Activity log policies
CREATE POLICY "Family members can view activity logs" ON public.activity_log
  FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can add activity logs" ON public.activity_log
  FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id));

-- Add comments
COMMENT ON COLUMN public.kids.current_streak IS 'Number of consecutive days with completed chores';
COMMENT ON COLUMN public.kids.longest_streak IS 'Longest streak ever achieved';
COMMENT ON COLUMN public.kids.last_activity_date IS 'Date of last chore completion for streak calculation';
COMMENT ON TABLE public.activity_log IS 'Timeline of all kid activities for progress tracking';

-- Function to update streak when chore is approved
CREATE OR REPLACE FUNCTION public.update_streak_on_chore_approval()
RETURNS TRIGGER AS $$
DECLARE
  kid_id UUID;
  today DATE;
  yesterday DATE;
  current_streak_val INTEGER;
  longest_streak_val INTEGER;
BEGIN
  -- Only process when status changes to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    kid_id := NEW.assigned_to;
    today := CURRENT_DATE;
    yesterday := today - INTERVAL '1 day';
    
    -- Get current streak values
    SELECT current_streak, longest_streak INTO current_streak_val, longest_streak_val
    FROM public.kids WHERE id = kid_id;
    
    -- Update streak based on last activity date
    IF (SELECT last_activity_date FROM public.kids WHERE id = kid_id) = yesterday THEN
      -- Continue streak
      current_streak_val := current_streak_val + 1;
    ELSIF (SELECT last_activity_date FROM public.kids WHERE id = kid_id) IS NULL OR 
          (SELECT last_activity_date FROM public.kids WHERE id = kid_id) < yesterday THEN
      -- Start new streak
      current_streak_val := 1;
    END IF;
    
    -- Update longest streak if current exceeds it
    IF current_streak_val > longest_streak_val THEN
      longest_streak_val := current_streak_val;
    END IF;
    
    -- Update kid's streak and last activity date
    UPDATE public.kids 
    SET current_streak = current_streak_val,
        longest_streak = longest_streak_val,
        last_activity_date = today
    WHERE id = kid_id;
    
    -- Log the activity
    INSERT INTO public.activity_log (kid_id, family_id, activity_type, chore_id, xp_earned, description)
    VALUES (kid_id, NEW.family_id, 'chore_approved', NEW.id, 
            CASE NEW.difficulty
              WHEN 'medium' THEN 25
              WHEN 'hard' THEN 50
              ELSE 10
            END,
            'Completed: ' || NEW.title);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS award_xp_on_chore_approval ON public.chores;
CREATE TRIGGER update_streak_on_chore_approval 
AFTER UPDATE ON public.chores
FOR EACH ROW 
EXECUTE FUNCTION public.update_streak_on_chore_approval();
