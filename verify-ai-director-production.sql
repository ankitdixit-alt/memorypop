-- AI Director Production Verification
-- Run ONCE in Supabase SQL Editor to confirm migration complete

SELECT
  '✅ ai_reveal_plans table' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'ai_reveal_plans'
  ) THEN 'PASS' ELSE 'FAIL' END as status
UNION ALL
SELECT
  '✅ RLS enabled',
  CASE WHEN (
    SELECT rowsecurity FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'ai_reveal_plans'
  ) THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT
  '✅ publish_reveal_plan function',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'publish_reveal_plan'
  ) THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT
  '✅ search_path = public',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'publish_reveal_plan'
      AND proconfig::text LIKE '%search_path=public%'
  ) THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT
  '✅ service_role has EXECUTE',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.routine_privileges
    WHERE routine_schema = 'public'
      AND routine_name = 'publish_reveal_plan'
      AND grantee = 'service_role'
      AND privilege_type = 'EXECUTE'
  ) THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT
  '✅ PUBLIC denied EXECUTE',
  CASE WHEN NOT EXISTS (
    SELECT 1 FROM information_schema.routine_privileges
    WHERE routine_schema = 'public'
      AND routine_name = 'publish_reveal_plan'
      AND grantee = 'PUBLIC'
      AND privilege_type = 'EXECUTE'
  ) THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT
  '✅ anon denied EXECUTE',
  CASE WHEN NOT EXISTS (
    SELECT 1 FROM information_schema.routine_privileges
    WHERE routine_schema = 'public'
      AND routine_name = 'publish_reveal_plan'
      AND grantee = 'anon'
      AND privilege_type = 'EXECUTE'
  ) THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT
  '✅ authenticated denied EXECUTE',
  CASE WHEN NOT EXISTS (
    SELECT 1 FROM information_schema.routine_privileges
    WHERE routine_schema = 'public'
      AND routine_name = 'publish_reveal_plan'
      AND grantee = 'authenticated'
      AND privilege_type = 'EXECUTE'
  ) THEN 'PASS' ELSE 'FAIL' END;
