-- This function should be scheduled to run daily via Supabase Cron
-- It automatically generates new instances of recurring chores

CREATE OR REPLACE FUNCTION public.process_recurring_chores()
RETURNS TABLE(processed_count INTEGER, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recurring_chore RECORD;
  new_due_date DATE;
  created_count INTEGER := 0;
  error_msg TEXT := NULL;
BEGIN
  -- Find all recurring chores that need new instances
  FOR recurring_chore IN
    SELECT 
      id, family_id, title, description, points, assigned_to, 
      difficulty, recurrence_pattern, updated_at
    FROM public.chores
    WHERE is_recurring = true
      AND recurrence_pattern IS NOT NULL
      AND status IN ('pending', 'completed', 'approved')
  LOOP
    -- Check if a new instance should be created
    IF recurring_chore.recurrence_pattern = 'daily' 
       AND DATE(recurring_chore.updated_at) < CURRENT_DATE THEN
      
      new_due_date := CURRENT_DATE + INTERVAL '1 day';
      
      INSERT INTO public.chores (
        family_id, title, description, points, assigned_to, 
        difficulty, is_recurring, recurrence_pattern, 
        due_date, status
      ) VALUES (
        recurring_chore.family_id,
        recurring_chore.title,
        recurring_chore.description,
        recurring_chore.points,
        recurring_chore.assigned_to,
        recurring_chore.difficulty,
        true,
        'daily',
        new_due_date,
        'pending'
      );
      
      created_count := created_count + 1;
      
    ELSIF recurring_chore.recurrence_pattern = 'weekly'
          AND DATE(recurring_chore.updated_at) <= CURRENT_DATE - INTERVAL '7 days' THEN
      
      new_due_date := CURRENT_DATE + INTERVAL '7 days';
      
      INSERT INTO public.chores (
        family_id, title, description, points, assigned_to, 
        difficulty, is_recurring, recurrence_pattern, 
        due_date, status
      ) VALUES (
        recurring_chore.family_id,
        recurring_chore.title,
        recurring_chore.description,
        recurring_chore.points,
        recurring_chore.assigned_to,
        recurring_chore.difficulty,
        true,
        'weekly',
        new_due_date,
        'pending'
      );
      
      created_count := created_count + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT created_count, error_msg;

EXCEPTION WHEN OTHERS THEN
  error_msg := SQLERRM;
  RETURN QUERY SELECT 0, error_msg;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.process_recurring_chores() TO authenticated;

-- Note: To schedule this function to run daily, use Supabase's pg_cron extension:
-- SELECT cron.schedule('process-recurring-chores', '0 0 * * *', 'SELECT public.process_recurring_chores()');
