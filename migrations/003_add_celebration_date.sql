-- Migration: Add celebration date feature (IDEMPOTENT)
-- Date: 2026-07-16
-- Description: Add optional celebration date to MemoryPops for timeline and countdown display
-- SAFE TO RUN MULTIPLE TIMES

-- Add celebration_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'memorypops'
    AND column_name = 'celebration_date'
  ) THEN
    ALTER TABLE memorypops ADD COLUMN celebration_date DATE;
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_memorypops_celebration_date
  ON memorypops(celebration_date)
  WHERE celebration_date IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN memorypops.celebration_date IS
  'Optional celebration date for the MemoryPop. Used to display timeline and countdown to contributors. NULL means no date specified.';
