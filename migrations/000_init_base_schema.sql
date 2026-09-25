-- Base Schema Initialization for MemoryPop Test Environment
-- DO NOT run this on production - for test database setup only
-- This creates the minimal base schema required before applying migrations 001-015

-- ======================
-- CORE TABLES
-- ======================

-- Create memorypops table
CREATE TABLE IF NOT EXISTS memorypops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  occasion TEXT NOT NULL,
  story TEXT,
  mood TEXT,
  tone TEXT,
  status TEXT DEFAULT 'collecting' NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  creator_token TEXT,
  management_token_hash TEXT,
  celebration_date DATE,
  cover_style TEXT DEFAULT 'simple' NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  upgraded_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,
  creator_email TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT,
  email_verification_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('collecting', 'ready', 'revealed'))
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,
  contributor_name TEXT NOT NULL,
  contributor_relationship TEXT,
  message TEXT NOT NULL,
  photo_url TEXT,
  photos TEXT[], -- Array of photo URLs
  gifs TEXT[], -- Array of GIF URLs
  video JSONB, -- {url: string, duration: number, thumbnail: string}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ======================
-- INDEXES
-- ======================

-- memorypops indexes
CREATE INDEX IF NOT EXISTS idx_memorypops_share_code ON memorypops(share_code);
CREATE INDEX IF NOT EXISTS idx_memorypops_creator_token ON memorypops(creator_token);
CREATE INDEX IF NOT EXISTS idx_memorypops_management_token_hash ON memorypops(management_token_hash);
CREATE INDEX IF NOT EXISTS idx_memorypops_is_premium ON memorypops(is_premium);
CREATE INDEX IF NOT EXISTS idx_memorypops_stripe_payment_id ON memorypops(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_memorypops_creator_email ON memorypops(creator_email);

-- memories indexes
CREATE INDEX IF NOT EXISTS idx_memories_memorypop_id ON memories(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);

-- ======================
-- ROW LEVEL SECURITY
-- ======================

-- Enable RLS on both tables
ALTER TABLE memorypops ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- memorypops policies
-- Allow anyone to read memorypops (needed for public reveal pages)
CREATE POLICY "Anyone can read memorypops"
  ON memorypops
  FOR SELECT
  USING (true);

-- Allow anyone to insert memorypops (needed for public create flow)
CREATE POLICY "Anyone can insert memorypops"
  ON memorypops
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update memorypops (creator auth handled in application)
-- Note: In production, this should be more restrictive
CREATE POLICY "Anyone can update memorypops"
  ON memorypops
  FOR UPDATE
  USING (true);

-- memories policies
-- Allow anyone to read memories
CREATE POLICY "Anyone can read memories"
  ON memories
  FOR SELECT
  USING (true);

-- Allow anyone to insert memories (needed for public contribute flow)
CREATE POLICY "Anyone can insert memories"
  ON memories
  FOR INSERT
  WITH CHECK (true);

-- ======================
-- COMMENTS
-- ======================

COMMENT ON TABLE memorypops IS 'Core MemoryPop gifts with creator credentials and status';
COMMENT ON TABLE memories IS 'Individual memories contributed to a MemoryPop';

COMMENT ON COLUMN memorypops.share_code IS 'Public UUID for contributors (used in URLs)';
COMMENT ON COLUMN memorypops.creator_token IS 'Legacy creator authentication (deprecated)';
COMMENT ON COLUMN memorypops.management_token_hash IS 'SHA-256 hash of management token for creator auth';
COMMENT ON COLUMN memorypops.is_premium IS 'Boolean flag indicating Plus upgrade status';
COMMENT ON COLUMN memorypops.status IS 'collecting, ready, or revealed';
