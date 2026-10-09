-- Migration 018: Add export jobs table for reveal video generation
-- Purpose: Track video export requests and completed files for Plus tier gifts

-- Create table
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,

  -- Job state
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Content hash to detect when re-export is needed
  -- Includes: reveal_plan_id, memory_ids, custom_music_url, exporter_version
  content_hash TEXT NOT NULL,
  exporter_version TEXT NOT NULL DEFAULT 'v4',

  -- Storage paths (relative to bucket)
  video_path TEXT, -- Set when status = 'completed'

  -- Error tracking
  error_message TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for finding jobs by memorypop
CREATE INDEX IF NOT EXISTS idx_export_jobs_memorypop ON export_jobs(memorypop_id);

-- Index for finding pending/processing jobs
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status)
  WHERE status IN ('pending', 'processing');

-- Unique index: one active (pending or processing) job per memorypop
-- This prevents duplicate exports while allowing completed/failed jobs to not block new exports
CREATE UNIQUE INDEX IF NOT EXISTS export_jobs_one_active_per_memorypop
  ON export_jobs(memorypop_id)
  WHERE status IN ('pending', 'processing');

-- RLS: Enable with service_role-only access
-- Authorization enforced in application layer using service_role client
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - service_role bypasses RLS
-- Application API routes use service_role client and enforce authorization

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_export_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at (safe to recreate)
DROP TRIGGER IF EXISTS export_jobs_updated_at ON export_jobs;
CREATE TRIGGER export_jobs_updated_at
  BEFORE UPDATE ON export_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_export_jobs_updated_at();

-- Grant permissions to service_role only
-- Application enforces authorization via server-side API routes
GRANT ALL ON export_jobs TO service_role;
