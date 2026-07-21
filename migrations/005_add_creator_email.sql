-- Migration: Add creator email for recovery
-- Date: 2026-07-20
-- Description: Enable creators to receive dashboard link via email for access recovery
-- Sprint 1: Email Capture & Recovery

-- Add creator_email column (nullable - email is optional)
ALTER TABLE memorypops
ADD COLUMN creator_email TEXT;

-- Add index for future queries (Phase 2: auth and claiming)
-- Partial index only indexes non-null values for better performance
CREATE INDEX idx_memorypops_creator_email
  ON memorypops(creator_email)
  WHERE creator_email IS NOT NULL;

-- Add optional tracking column for debugging and metrics
ALTER TABLE memorypops
ADD COLUMN email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN memorypops.creator_email IS 'Creator email address for recovery and notifications. Optional. No uniqueness constraint (one person can create multiple MemoryPops).';
COMMENT ON COLUMN memorypops.email_sent_at IS 'Timestamp when creation confirmation email was sent. NULL if never sent or feature disabled.';

-- Rollback script (for reference - run separately if needed):
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS creator_email;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS email_sent_at;
-- DROP INDEX IF EXISTS idx_memorypops_creator_email;
