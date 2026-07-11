-- Migration: Add recipient reactions feature
-- Date: 2026-07-11
-- Description: Allow recipients to react to MemoryPops with one of three emotional responses

-- Create memorypop_reactions table
CREATE TABLE memorypop_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('loved_it', 'made_me_emotional', 'made_me_laugh')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enforce one reaction per MemoryPop (core requirement)
CREATE UNIQUE INDEX idx_one_reaction_per_memorypop
  ON memorypop_reactions(memorypop_id);

-- Index for future creator dashboard queries
CREATE INDEX idx_reactions_by_memorypop
  ON memorypop_reactions(memorypop_id);

-- Index for future analytics (optional but useful)
CREATE INDEX idx_reactions_by_created_at
  ON memorypop_reactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE memorypop_reactions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can insert reactions (no auth required - aligned with contribute flow)
CREATE POLICY "Anyone can insert reactions"
  ON memorypop_reactions
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Anyone can read reactions (for checking if already reacted)
CREATE POLICY "Anyone can read reactions"
  ON memorypop_reactions
  FOR SELECT
  USING (true);

-- Note: No UPDATE or DELETE policies (reactions are immutable once created)

-- Add comment for documentation
COMMENT ON TABLE memorypop_reactions IS 'Stores recipient reactions to MemoryPops. One reaction per MemoryPop.';
COMMENT ON COLUMN memorypop_reactions.reaction_type IS 'One of: loved_it, made_me_emotional, made_me_laugh';
