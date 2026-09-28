-- ============================================================
-- PRODUCTION FIX: Add is_premium column
-- ============================================================
-- Minimal fix for "column memorypops.is_premium does not exist"
-- Adds only the entitlement field needed by deployed code
--
-- Run in: Supabase SQL Editor for production project gvfpgawbvuttglfscngg
-- Link: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql
-- ============================================================

-- Check if is_premium already exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'memorypops'
    AND column_name = 'is_premium'
  ) THEN
    -- Add is_premium column
    ALTER TABLE memorypops
    ADD COLUMN is_premium BOOLEAN DEFAULT FALSE NOT NULL;

    -- Add index for efficient lookups
    CREATE INDEX idx_memorypops_is_premium ON memorypops(is_premium);

    -- Add comment
    COMMENT ON COLUMN memorypops.is_premium IS 'Boolean flag indicating Plus upgrade status';

    RAISE NOTICE 'Added is_premium column successfully';
  ELSE
    RAISE NOTICE 'Column is_premium already exists';
  END IF;
END $$;

-- ============================================================
-- Verification Query
-- ============================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memorypops'
  AND column_name = 'is_premium';

-- Expected output:
-- column_name | data_type | is_nullable | column_default
-- is_premium  | boolean   | NO          | false

-- ============================================================
-- Impact Assessment
-- ============================================================
-- After running this SQL:
-- 1. All existing gifts will have is_premium = false (Standard)
-- 2. Deployed code can query is_premium without error
-- 3. Standard preparation will work immediately (no code deploy needed)
-- 4. Plus features remain disabled until Stripe/beta code columns added

-- To verify Standard preparation works:
-- 1. Visit any Standard gift dashboard
-- 2. Click "Prepare the Reveal"
-- 3. Should return 200 OK (status updates successfully)
-- 4. Reveal should open and play Standard experience
