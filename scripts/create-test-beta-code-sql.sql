-- Create beta code for testing
-- Code hash for: TESTBETA2026
-- Run this in Supabase SQL Editor for memorypop-test

INSERT INTO beta_codes (code_hash, campaign_name, total_redemption_limit, current_redemptions, expires_at, active, created_at, updated_at)
VALUES (
  '56c609a1dd57a590e346fed18fd8fb072edab7140a65ff5bd66a9ff53956f4c0',
  'test_2026',
  10,
  0,
  '2026-10-03T10:26:59.419Z',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (code_hash) DO NOTHING;

-- Verify
SELECT campaign_name, current_redemptions, total_redemption_limit, expires_at, active
FROM beta_codes
WHERE campaign_name = 'test_2026';
