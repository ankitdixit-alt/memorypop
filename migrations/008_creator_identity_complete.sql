-- Complete Creator Identity System (Consolidated Migration)
-- Date: 2026-07-20
-- Purpose: Consolidates migrations 005, 006, 007 into one clean migration
-- USE THIS if migrations 005-007 have NOT been applied yet
-- NOTE: This migration assumes table is EMPTY (use after beta reset)

-- Creator email (from 005)
ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS creator_email TEXT;

ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;

-- Email verification (from 006)
ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS creator_email_verified_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS verification_token_hash TEXT;

ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0;

-- Creator authorization (from 007)
ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS management_token_hash TEXT;

ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS pending_creator_email TEXT;

ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP WITH TIME ZONE;

-- Make management_token_hash NOT NULL after ensuring table is empty
-- (beta reset ensures table is empty before migration)
-- IMPORTANT: Only run this after confirming SELECT COUNT(*) FROM memorypops = 0
ALTER TABLE memorypops
ALTER COLUMN management_token_hash SET NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_memorypops_creator_email
  ON memorypops(creator_email)
  WHERE creator_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memorypops_verification_token_hash
  ON memorypops(verification_token_hash)
  WHERE verification_token_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memorypops_management_token_hash
  ON memorypops(management_token_hash);

-- Comments
COMMENT ON COLUMN memorypops.creator_email IS 'Verified creator email address. NULL if not verified.';
COMMENT ON COLUMN memorypops.email_sent_at IS 'Timestamp when creation confirmation email was sent. NULL if never sent or feature disabled.';
COMMENT ON COLUMN memorypops.creator_email_verified_at IS 'Timestamp when email was verified.';
COMMENT ON COLUMN memorypops.verification_token_hash IS 'SHA-256 hash of verification token. NULL after successful verification. Never store plaintext tokens.';
COMMENT ON COLUMN memorypops.verification_token_expires_at IS '24-hour expiry timestamp for verification token. NULL after successful verification.';
COMMENT ON COLUMN memorypops.verification_attempts IS 'Count of failed verification attempts. Used for rate limiting (max 5 attempts). Resets to 0 on success.';
COMMENT ON COLUMN memorypops.management_token_hash IS 'SHA-256 hash of creator management token. Required for all MemoryPops. Used for /manage/{token} authentication. NEVER store plaintext token.';
COMMENT ON COLUMN memorypops.pending_creator_email IS 'Email awaiting verification. Promoted to creator_email after verification.';
COMMENT ON COLUMN memorypops.verification_sent_at IS 'Last time verification email was sent. Used for rate limiting (5 minute cooldown).';

-- Migration validation queries
-- Run these after applying migration to verify success:
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'memorypops'
-- AND column_name IN (
--   'creator_email',
--   'email_sent_at',
--   'creator_email_verified_at',
--   'verification_token_hash',
--   'verification_token_expires_at',
--   'verification_attempts',
--   'management_token_hash',
--   'pending_creator_email',
--   'verification_sent_at'
-- );
--
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'memorypops'
-- AND indexname IN (
--   'idx_memorypops_creator_email',
--   'idx_memorypops_verification_token_hash',
--   'idx_memorypops_management_token_hash'
-- );

-- Rollback script (if needed):
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS creator_email;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS email_sent_at;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS creator_email_verified_at;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_token_hash;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_token_expires_at;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_attempts;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS management_token_hash;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS pending_creator_email;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_sent_at;
-- DROP INDEX IF EXISTS idx_memorypops_creator_email;
-- DROP INDEX IF EXISTS idx_memorypops_verification_token_hash;
-- DROP INDEX IF EXISTS idx_memorypops_management_token_hash;
