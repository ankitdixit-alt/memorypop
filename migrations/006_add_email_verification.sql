-- Migration: Add email verification security
-- Date: 2026-07-20
-- Description: Implement email verification before granting dashboard access
-- Sprint 1: Security Fix - Verify email ownership before sending dashboard link
-- Severity: HIGH - Fixes critical security vulnerability

-- Add email verification timestamp
-- NULL = not verified, NOT NULL = verified at this timestamp
ALTER TABLE memorypops
ADD COLUMN creator_email_verified_at TIMESTAMP WITH TIME ZONE;

-- Add verification token hash (SHA-256)
-- Store hash only, never plaintext token
-- NULL after successful verification
ALTER TABLE memorypops
ADD COLUMN verification_token_hash TEXT;

-- Add token expiry timestamp (24 hours from generation)
-- NULL after successful verification
ALTER TABLE memorypops
ADD COLUMN verification_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Add verification attempt counter for rate limiting
-- Increments on failed verification attempts
-- Resets to 0 on successful verification
-- Max 5 attempts before locking
ALTER TABLE memorypops
ADD COLUMN verification_attempts INTEGER DEFAULT 0;

-- Create index for token lookup
-- Partial index only indexes rows with pending verification
CREATE INDEX idx_memorypops_verification_token_hash
  ON memorypops(verification_token_hash)
  WHERE verification_token_hash IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN memorypops.creator_email_verified_at IS 'Timestamp when email was verified. NULL if not verified. Once set, email is proven to be owned by creator.';
COMMENT ON COLUMN memorypops.verification_token_hash IS 'SHA-256 hash of verification token. NULL after successful verification. Never store plaintext tokens.';
COMMENT ON COLUMN memorypops.verification_token_expires_at IS '24-hour expiry timestamp for verification token. NULL after successful verification.';
COMMENT ON COLUMN memorypops.verification_attempts IS 'Count of failed verification attempts. Used for rate limiting (max 5 attempts). Resets to 0 on success.';

-- Rollback script (for reference - run separately if needed):
-- DROP INDEX IF EXISTS idx_memorypops_verification_token_hash;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_attempts;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_token_expires_at;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_token_hash;
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS creator_email_verified_at;
