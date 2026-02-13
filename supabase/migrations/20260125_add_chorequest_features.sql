-- Add XP and difficulty columns for ChoreQuest feature

-- Add total_xp column to kids table
ALTER TABLE public.kids 
ADD COLUMN total_xp INTEGER NOT NULL DEFAULT 0;

-- Add difficulty column to chores table
ALTER TABLE public.chores 
ADD COLUMN difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Add comment explaining the columns
COMMENT ON COLUMN public.kids.total_xp IS 'Total experience points earned by the kid. Level = floor(sqrt(total_xp / 100)) + 1';
COMMENT ON COLUMN public.chores.difficulty IS 'Difficulty level of the chore. Determines XP reward: easy=10, medium=25, hard=50';

-- Create a function to award XP when a chore is approved
CREATE OR REPLACE FUNCTION public.award_xp_on_chore_approval()
RETURNS TRIGGER AS $$
DECLARE
  xp_reward INTEGER;
  kid_id UUID;
BEGIN
  -- Only process when status changes to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    kid_id := NEW.assigned_to;
    
    -- Determine XP based on difficulty
    CASE NEW.difficulty
      WHEN 'medium' THEN xp_reward := 25;
      WHEN 'hard' THEN xp_reward := 50;
      ELSE xp_reward := 10; -- easy
    END CASE;
    
    -- Update kid's total_xp
    UPDATE public.kids 
    SET total_xp = total_xp + xp_reward
    WHERE id = kid_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for XP award
DROP TRIGGER IF EXISTS award_xp_on_chore_approval ON public.chores;
CREATE TRIGGER award_xp_on_chore_approval 
AFTER UPDATE ON public.chores
FOR EACH ROW 
EXECUTE FUNCTION public.award_xp_on_chore_approval();
