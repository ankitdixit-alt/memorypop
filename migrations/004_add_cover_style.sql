-- Migration: Add cover style feature (IDEMPOTENT)
-- Date: 2026-07-16
-- Description: Add cover_style column to persist visual theme across MemoryPop experience
-- SAFE TO RUN MULTIPLE TIMES

-- Add cover_style column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'memorypops'
    AND column_name = 'cover_style'
  ) THEN
    ALTER TABLE memorypops ADD COLUMN cover_style TEXT DEFAULT 'none';
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN memorypops.cover_style IS
  'Cover style visual theme for this MemoryPop. Applied consistently across creator, contributor, and reveal experiences. Valid values: none, confetti, birthday-cake, balloons, warm-sunset. Defaults to "none" for neutral theme.';
