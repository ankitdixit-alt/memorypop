-- ============================================================
-- PRODUCTION RELEASE: Plus Custom Music
-- ============================================================
-- Adds custom reveal music support for Plus gifts
-- Allows Plus creators to upload MP3/M4A files (max 20MB)
-- Falls back to default occasion-based music if not set
--
-- Storage: Uses PRIVATE bucket with on-demand signed URLs for playback
-- - Bucket: memorypop-custom-music (private)
-- - Storage: Durable storage paths stored in custom_music_url
-- - Playback: Signed URLs generated on-demand when loading authorized reveal
-- - Upload: Direct-to-Supabase via signed upload URLs
--
-- Run in: Supabase SQL Editor for production project gvfpgawbvuttglfscngg
-- Link: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Add custom music column to memorypops
-- ============================================================

-- custom_music_url: public URL to uploaded music file in Supabase Storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'memorypops'
    AND column_name = 'custom_music_url'
  ) THEN
    ALTER TABLE memorypops
    ADD COLUMN custom_music_url TEXT;

    COMMENT ON COLUMN memorypops.custom_music_url IS 'Storage path to custom Plus reveal music (MP3/M4A, max 20MB). Signed playback URLs generated on-demand.';

    RAISE NOTICE 'Added custom_music_url column';
  ELSE
    RAISE NOTICE 'Column custom_music_url already exists';
  END IF;
END $$;

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check custom music column exists
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memorypops'
  AND column_name = 'custom_music_url';

-- Expected output:
-- column_name        | data_type | is_nullable | column_default
-- -------------------+-----------+-------------+----------------
-- custom_music_url   | text      | YES         | NULL

COMMIT;
