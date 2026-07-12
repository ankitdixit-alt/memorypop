-- Migration: Add Premium (Plus) features
-- Date: 2026-07-11
-- Description: Add columns to track MemoryPop Plus upgrades and Stripe payment data

-- Add premium status columns to memorypops table
ALTER TABLE memorypops
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN upgraded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN stripe_payment_id TEXT,
ADD COLUMN stripe_customer_id TEXT;

-- Add index for efficient premium lookups
CREATE INDEX idx_memorypops_is_premium ON memorypops(is_premium);

-- Add index for Stripe payment ID lookups (verification and support)
CREATE INDEX idx_memorypops_stripe_payment_id ON memorypops(stripe_payment_id);

-- Add comments for documentation
COMMENT ON COLUMN memorypops.is_premium IS 'Boolean flag indicating if MemoryPop has been upgraded to Plus';
COMMENT ON COLUMN memorypops.upgraded_at IS 'Timestamp when upgrade was completed (for analytics and support)';
COMMENT ON COLUMN memorypops.stripe_payment_id IS 'Stripe PaymentIntent ID (e.g., pi_3...) for reconciliation';
COMMENT ON COLUMN memorypops.stripe_customer_id IS 'Stripe Customer ID (e.g., cus_...) for future customer management';
