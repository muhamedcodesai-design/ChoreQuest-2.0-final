-- Add recurrence_pattern column to chores table
ALTER TABLE public.chores 
ADD COLUMN recurrence_pattern TEXT DEFAULT NULL;

-- Add a comment explaining valid values
COMMENT ON COLUMN public.chores.recurrence_pattern IS 'Valid values: daily, weekly, or NULL for one-time chores';