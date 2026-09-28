-- ============================================================
-- Apply Missing Migration 002: Add Premium Features
-- ============================================================
-- Production database (gvfpgawbvuttglfscngg) is missing migration 002
-- This adds the is_premium column and related Stripe columns
--
-- IMPORTANT: Run this in Supabase SQL Editor for production project
-- Link: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql
-- ============================================================

-- Check if is_premium already exists (idempotent check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'memorypops'
    AND column_name = 'is_premium'
  ) THEN
    -- Add premium status columns to memorypops table
    ALTER TABLE memorypops
    ADD COLUMN is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN upgraded_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN stripe_payment_id TEXT,
    ADD COLUMN stripe_customer_id TEXT;

    -- Add index for efficient premium lookups
    CREATE INDEX idx_memorypops_is_premium ON memorypops(is_premium);

    -- Add index for Stripe payment ID lookups
    CREATE INDEX idx_memorypops_stripe_payment_id ON memorypops(stripe_payment_id);

    -- Add comments
    COMMENT ON COLUMN memorypops.is_premium IS 'Boolean flag indicating if MemoryPop has been upgraded to Plus';
    COMMENT ON COLUMN memorypops.upgraded_at IS 'Timestamp when upgrade was completed';
    COMMENT ON COLUMN memorypops.stripe_payment_id IS 'Stripe PaymentIntent ID for reconciliation';
    COMMENT ON COLUMN memorypops.stripe_customer_id IS 'Stripe Customer ID for customer management';

    RAISE NOTICE 'Migration 002 applied successfully';
  ELSE
    RAISE NOTICE 'Migration 002 already applied (is_premium column exists)';
  END IF;
END $$;

-- Verification query
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memorypops'
  AND column_name IN ('is_premium', 'upgraded_at', 'stripe_payment_id', 'stripe_customer_id')
ORDER BY column_name;
