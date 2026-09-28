-- Migration 016: Add beta code system for complimentary Plus access
-- Enables beta testers to redeem Plus without payment

-- =====================================================
-- Beta Codes Table
-- =====================================================

CREATE TABLE IF NOT EXISTS beta_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_hash TEXT NOT NULL UNIQUE,
  campaign_name TEXT NOT NULL,
  total_redemption_limit INTEGER NOT NULL DEFAULT 100,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE beta_codes IS 'Beta access codes for complimentary Plus upgrades';
COMMENT ON COLUMN beta_codes.code_hash IS 'SHA-256 hash of the beta code';
COMMENT ON COLUMN beta_codes.campaign_name IS 'Identifier for this beta campaign (e.g. "launch_2026")';
COMMENT ON COLUMN beta_codes.total_redemption_limit IS 'Maximum number of times this code can be redeemed';
COMMENT ON COLUMN beta_codes.current_redemptions IS 'Number of successful redemptions so far';
COMMENT ON COLUMN beta_codes.expires_at IS 'Code cannot be redeemed after this timestamp';
COMMENT ON COLUMN beta_codes.active IS 'Admin can disable code without deleting it';

-- =====================================================
-- Beta Code Redemptions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS beta_code_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  beta_code_id UUID NOT NULL REFERENCES beta_codes(id) ON DELETE CASCADE,
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(memorypop_id, beta_code_id)
);

COMMENT ON TABLE beta_code_redemptions IS 'Tracks which MemoryPops redeemed which beta codes';
COMMENT ON COLUMN beta_code_redemptions.memorypop_id IS 'The MemoryPop that was upgraded';
COMMENT ON COLUMN beta_code_redemptions.beta_code_id IS 'The beta code that was used';

CREATE INDEX idx_beta_code_redemptions_memorypop ON beta_code_redemptions(memorypop_id);
CREATE INDEX idx_beta_code_redemptions_code ON beta_code_redemptions(beta_code_id);

-- =====================================================
-- Add upgrade source tracking to memorypops
-- =====================================================

ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS upgrade_source TEXT;

COMMENT ON COLUMN memorypops.upgrade_source IS 'How Plus was activated: "beta_code", "stripe", null for non-premium';

-- Update existing premium MemoryPops to indicate Stripe as source (if they have payment IDs)
UPDATE memorypops
SET upgrade_source = 'stripe'
WHERE is_premium = true
  AND stripe_payment_id IS NOT NULL
  AND upgrade_source IS NULL;

-- =====================================================
-- RLS Policies and Permissions
-- =====================================================

-- Enable RLS on server-side tables
ALTER TABLE beta_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Grant table privileges to service_role (based on redemption endpoint requirements)
-- beta_codes: SELECT, UPDATE
-- beta_code_redemptions: SELECT, INSERT, DELETE
GRANT SELECT, UPDATE ON TABLE beta_codes TO service_role;
GRANT SELECT, INSERT, DELETE ON TABLE beta_code_redemptions TO service_role;

-- Create RLS policies for service_role access
-- These tables are server-side only - never accessed from client code
CREATE POLICY "service_role can manage beta_codes"
  ON beta_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role can manage beta_code_redemptions"
  ON beta_code_redemptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Rollback SQL (if needed)
-- =====================================================

-- To rollback:
-- ALTER TABLE memorypops DROP COLUMN IF EXISTS upgrade_source;
-- DROP TABLE IF EXISTS beta_code_redemptions CASCADE;
-- DROP TABLE IF EXISTS beta_codes CASCADE;
