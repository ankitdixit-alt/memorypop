-- Rollback Migration: Remove Standard Multimedia Support
-- Date: 2026-08-13
-- Description: Rollback JSONB columns for multimedia
-- Safe rollback: Old columns (photo_url, video_url) are intact
-- Data loss: Memories created with new JSONB format will lose multimedia
-- Estimated time: 5-10 minutes

-- =============================================================================
-- ROLLBACK MIGRATION
-- =============================================================================

-- Drop indexes first (faster than dropping columns with indexes)
DROP INDEX IF EXISTS idx_memories_photos;
DROP INDEX IF EXISTS idx_memories_gifs;
DROP INDEX IF EXISTS idx_memories_video_exists;

-- Drop constraints
ALTER TABLE memories
DROP CONSTRAINT IF EXISTS photos_is_array;

ALTER TABLE memories
DROP CONSTRAINT IF EXISTS gifs_is_array;

ALTER TABLE memories
DROP CONSTRAINT IF EXISTS video_is_object_or_null;

ALTER TABLE memories
DROP CONSTRAINT IF EXISTS photos_max_count;

ALTER TABLE memories
DROP CONSTRAINT IF EXISTS gifs_max_count;

-- Drop JSONB columns
ALTER TABLE memories
DROP COLUMN IF EXISTS photos;

ALTER TABLE memories
DROP COLUMN IF EXISTS gifs;

ALTER TABLE memories
DROP COLUMN IF EXISTS video;

-- =============================================================================
-- VERIFICATION: Check rollback results
-- =============================================================================

-- Verify columns are dropped
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'memories'
AND column_name IN ('photos', 'gifs', 'video');
-- Expected: 0 rows (columns dropped)

-- Count memories with old photo_url (should still exist)
SELECT COUNT(*) as old_photo_count
FROM memories
WHERE photo_url IS NOT NULL;

-- Count memories with old video_url (should still exist)
SELECT COUNT(*) as old_video_count
FROM memories
WHERE video_url IS NOT NULL;

-- =============================================================================
-- NOTES
-- =============================================================================

-- Data impact:
-- - Old memories (created before migration): NO DATA LOSS (photo_url, video_url intact)
-- - New memories (created after migration): MULTIMEDIA DATA LOST (JSONB columns dropped)
-- - Contributors will need to re-submit multimedia if they contributed after migration
--
-- Application impact:
-- - Application will fallback to reading photo_url and video_url
-- - Existing MemoryPops will continue working normally
-- - New contributions will work with single photo/video again (pre-multimedia behavior)
--
-- When to use this rollback:
-- - Critical bug in multimedia rendering
-- - Performance issues with JSONB queries
-- - Need to revert to single photo/video temporarily
--
-- Alternative to full rollback:
-- - If only application bugs (not schema bugs), just revert application code
-- - Keep database changes (harmless)
-- - Faster recovery (no migration needed)
--
-- Re-applying migration:
-- - Can re-run forward migration (010_add_standard_multimedia.sql)
-- - Will re-create columns with default empty values
-- - Lost JSONB data cannot be recovered (unless backed up)
