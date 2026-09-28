-- ============================================================
-- PRODUCTION: Add TESTBETA2026 Complimentary Code
-- ============================================================
-- Adds active beta code for complimentary Plus access
-- Run AFTER: PRODUCTION_BETA_CODE_RELEASE.sql
--
-- Run in: Supabase SQL Editor for production project gvfpgawbvuttglfscngg
-- Link: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql
-- ============================================================

BEGIN;

-- Insert TESTBETA2026 code
-- Hash: SHA-256 of "TESTBETA2026" (normalized, no spaces)
-- Expires: September 27, 2027 (1 year from now)
-- Limit: 100 redemptions

INSERT INTO beta_codes (
  name,
  code_hash,
  active,
  total_redemption_limit,
  current_redemptions,
  expires_at,
  created_at,
  updated_at
)
VALUES (
  'Complimentary Plus Access - TESTBETA2026',
  '56c609a1dd57a590e346fed18fd8fb072edab7140a65ff5bd66a9ff53956f4c0',
  TRUE,
  100,
  0,
  '2027-09-27 23:59:59+00',
  NOW(),
  NOW()
)
ON CONFLICT (code_hash) DO NOTHING;

COMMIT;

-- ============================================================
-- Verification Query
-- ============================================================

-- Check TESTBETA2026 was inserted
SELECT
  name,
  active,
  total_redemption_limit,
  current_redemptions,
  expires_at,
  created_at
FROM beta_codes
WHERE code_hash = '56c609a1dd57a590e346fed18fd8fb072edab7140a65ff5bd66a9ff53956f4c0';

-- Expected output:
-- name                                    | active | total_redemption_limit | current_redemptions | expires_at             | created_at
-- ----------------------------------------+--------+------------------------+---------------------+------------------------+------------------------
-- Complimentary Plus Access - TESTBETA2026 | t      | 100                    | 0                   | 2027-09-27 23:59:59+00 | [timestamp]
