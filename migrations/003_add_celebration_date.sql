-- Migration: Add celebration date feature
-- Date: 2026-07-16
-- Description: Add optional celebration date to MemoryPops for timeline and countdown display

-- Add celebration_date column (nullable DATE type)
ALTER TABLE memorypops
ADD COLUMN celebration_date DATE;

-- Add index for efficient date-based filtering (useful for future features)
CREATE INDEX idx_memorypops_celebration_date
  ON memorypops(celebration_date)
  WHERE celebration_date IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN memorypops.celebration_date IS
  'Optional celebration date for the MemoryPop. Used to display timeline and countdown to contributors. NULL means no date specified.';
