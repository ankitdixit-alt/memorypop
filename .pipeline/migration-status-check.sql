-- Migration Status Check (Read-Only)
-- Purpose: Verify current database schema state for Creator Identity feature
-- Use: Run this query against your Supabase database to check migration status
-- IMPORTANT: This query is READ-ONLY and makes NO changes to the database

-- ============================================================================
-- SECTION 1: Check if Creator Identity columns exist
-- ============================================================================

SELECT
  'Column Existence Check' AS check_type,
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE
    WHEN column_name IN (
      'creator_email',
      'email_sent_at',
      'creator_email_verified_at',
      'verification_token_hash',
      'verification_token_expires_at',
      'verification_attempts',
      'management_token_hash',
      'pending_creator_email',
      'verification_sent_at'
    ) THEN '✓ Required for Creator Identity'
    ELSE 'Other column'
  END AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memorypops'
ORDER BY
  CASE column_name
    WHEN 'creator_email' THEN 1
    WHEN 'email_sent_at' THEN 2
    WHEN 'creator_email_verified_at' THEN 3
    WHEN 'verification_token_hash' THEN 4
    WHEN 'verification_token_expires_at' THEN 5
    WHEN 'verification_attempts' THEN 6
    WHEN 'management_token_hash' THEN 7
    WHEN 'pending_creator_email' THEN 8
    WHEN 'verification_sent_at' THEN 9
    ELSE 99
  END;

-- ============================================================================
-- SECTION 2: Check if required indexes exist
-- ============================================================================

SELECT
  'Index Existence Check' AS check_type,
  indexname,
  indexdef,
  CASE
    WHEN indexname IN (
      'idx_memorypops_creator_email',
      'idx_memorypops_verification_token_hash',
      'idx_memorypops_management_token_hash'
    ) THEN '✓ Required for Creator Identity'
    ELSE 'Other index'
  END AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'memorypops'
ORDER BY indexname;

-- ============================================================================
-- SECTION 3: Check table row count (important for migration 008)
-- ============================================================================

SELECT
  'Table Row Count Check' AS check_type,
  COUNT(*) AS total_rows,
  CASE
    WHEN COUNT(*) = 0 THEN '✓ Table is empty - safe to apply migration 008 with NOT NULL constraint'
    WHEN COUNT(*) > 0 THEN '⚠ Table has data - migration 008 requires beta reset first'
  END AS migration_safety_status
FROM memorypops;

-- ============================================================================
-- SECTION 4: Check management_token_hash constraint status
-- ============================================================================

SELECT
  'NOT NULL Constraint Check' AS check_type,
  column_name,
  is_nullable,
  CASE
    WHEN column_name = 'management_token_hash' AND is_nullable = 'NO' THEN '✓ Management token is required (migration applied)'
    WHEN column_name = 'management_token_hash' AND is_nullable = 'YES' THEN '⚠ Management token is optional (migration NOT fully applied)'
    ELSE 'Other column'
  END AS constraint_status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memorypops'
  AND column_name = 'management_token_hash';

-- ============================================================================
-- SECTION 5: Summary - Missing Columns
-- ============================================================================

SELECT
  'Missing Columns Summary' AS check_type,
  missing_column,
  'Column does not exist - migration 008 NOT applied' AS status
FROM (
  SELECT unnest(ARRAY[
    'creator_email',
    'email_sent_at',
    'creator_email_verified_at',
    'verification_token_hash',
    'verification_token_expires_at',
    'verification_attempts',
    'management_token_hash',
    'pending_creator_email',
    'verification_sent_at'
  ]) AS missing_column
) required_columns
WHERE missing_column NOT IN (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'memorypops'
);

-- ============================================================================
-- SECTION 6: Summary - Missing Indexes
-- ============================================================================

SELECT
  'Missing Indexes Summary' AS check_type,
  missing_index,
  'Index does not exist - migration 008 NOT applied' AS status
FROM (
  SELECT unnest(ARRAY[
    'idx_memorypops_creator_email',
    'idx_memorypops_verification_token_hash',
    'idx_memorypops_management_token_hash'
  ]) AS missing_index
) required_indexes
WHERE missing_index NOT IN (
  SELECT indexname
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'memorypops'
);

-- ============================================================================
-- INTERPRETATION GUIDE
-- ============================================================================
--
-- If SECTION 5 returns rows:
--   → Migration 008 has NOT been applied (columns missing)
--   → Action: Apply migration 008 after beta reset
--
-- If SECTION 6 returns rows:
--   → Migration 008 has NOT been fully applied (indexes missing)
--   → Action: Apply migration 008 or just the index creation parts
--
-- If SECTION 3 shows total_rows > 0:
--   → Table contains data
--   → Action: Run beta reset BEFORE applying migration 008
--   → Reason: Migration 008 line 41 requires empty table for NOT NULL constraint
--
-- If SECTION 4 shows is_nullable = 'YES':
--   → Migration 008 was partially applied (NOT NULL constraint not set)
--   → This is EXPECTED if table has data (NOT NULL requires empty table)
--   → Action: Run beta reset, then apply migration 008
--
-- If SECTION 5 and 6 return NO rows AND SECTION 4 shows is_nullable = 'NO':
--   → ✓ Migration 008 is fully applied
--   → Database is ready for Creator Identity feature
--
