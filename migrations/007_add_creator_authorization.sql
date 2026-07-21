-- Migration 007: Add Creator Authorization System
-- Date: 2026-07-20
-- Purpose: Separate public (contributor) and private (creator) credentials
-- Security: Implement management token system for creator authentication

-- Add management token hash column (NEVER store plaintext)
-- This is the PRIMARY creator credential (separate from public shareCode)
ALTER TABLE memorypops
ADD COLUMN management_token_hash TEXT;

-- Create unique index on management token hash
CREATE UNIQUE INDEX idx_memorypops_management_token_hash
  ON memorypops(management_token_hash)
  WHERE management_token_hash IS NOT NULL;

-- Add column comments for documentation
COMMENT ON COLUMN memorypops.management_token_hash IS 'SHA-256 hash of creator management token. Used for /manage/{token} authentication. NEVER store plaintext token.';

-- Add pending email fields (separate lifecycle from verified email)
ALTER TABLE memorypops
ADD COLUMN pending_creator_email TEXT,
ADD COLUMN verification_sent_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN memorypops.pending_creator_email IS 'Email awaiting verification. NULL after verification succeeds. Separate from creator_email which only stores verified emails.';
COMMENT ON COLUMN memorypops.verification_sent_at IS 'Last time verification email was sent. Used for rate limiting (5 minute cooldown).';

-- Migration validation queries
-- Run these after applying migration to verify success:
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'memorypops'
-- AND column_name IN ('management_token_hash', 'pending_creator_email', 'verification_sent_at');
--
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'memorypops'
-- AND indexname = 'idx_memorypops_management_token_hash';

-- Rollback script (if needed):
-- DROP INDEX IF EXISTS idx_memorypops_management_token_hash;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_sent_at;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS pending_creator_email;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS management_token_hash;
