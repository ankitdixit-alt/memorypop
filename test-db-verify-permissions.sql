-- Verification Script for memorypop-test Database
-- Non-destructive permission and schema verification
-- Run this AFTER the main setup script

-- =============================================================================
-- PART 1: Check What Exists
-- =============================================================================

DO $$
DECLARE
  v_table_count INTEGER;
  v_func_exists BOOLEAN;
  v_rls_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== SCHEMA VERIFICATION ===';

  -- Count application tables
  SELECT COUNT(*) INTO v_table_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('memorypops', 'memories', 'memorypop_reactions', 'ai_reveal_plans');

  IF v_table_count = 4 THEN
    RAISE NOTICE 'Tables: 4/4 present ✓';
  ELSE
    RAISE WARNING 'Tables: %/4 present', v_table_count;
  END IF;

  -- Check function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'publish_reveal_plan'
      AND p.pronargs = 11
  ) INTO v_func_exists;

  IF v_func_exists THEN
    RAISE NOTICE 'Function: publish_reveal_plan exists ✓';
  ELSE
    RAISE WARNING 'Function: publish_reveal_plan MISSING';
  END IF;

  -- Check RLS enabled
  SELECT COUNT(*) INTO v_rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('memorypops', 'memories', 'memorypop_reactions', 'ai_reveal_plans')
    AND rowsecurity = true;

  IF v_rls_count = 4 THEN
    RAISE NOTICE 'RLS: enabled on 4/4 tables ✓';
  ELSE
    RAISE WARNING 'RLS: enabled on %/4 tables', v_rls_count;
  END IF;
END $$;

-- =============================================================================
-- PART 2: Function Permissions (Corrected ACL Inspection)
-- =============================================================================

DO $$
DECLARE
  v_func_oid OID;
  v_func_acl aclitem[];
  v_acl_text TEXT;
  v_public_has_execute BOOLEAN := false;
  v_anon_has_execute BOOLEAN := false;
  v_auth_has_execute BOOLEAN := false;
  v_service_has_execute BOOLEAN := false;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== FUNCTION PERMISSIONS ===';

  -- Get function OID and ACL
  SELECT p.oid, p.proacl INTO v_func_oid, v_func_acl
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname = 'publish_reveal_plan'
    AND p.pronargs = 11;

  IF v_func_oid IS NULL THEN
    RAISE WARNING 'Function not found - cannot check permissions';
    RETURN;
  END IF;

  -- NULL ACL means default privileges (EXECUTE granted to PUBLIC)
  IF v_func_acl IS NULL THEN
    RAISE WARNING 'Function has NULL ACL (default privileges - PUBLIC can execute)';
    v_public_has_execute := true;
  ELSE
    -- Convert ACL array to text for inspection
    v_acl_text := array_to_string(v_func_acl, ',');

    -- Check if PUBLIC appears in ACL with EXECUTE
    -- Format: "role=permissions/grantor" where X means EXECUTE
    v_public_has_execute := v_acl_text LIKE '%=X%' OR v_acl_text LIKE '%=*X%';
  END IF;

  -- Check specific roles using has_function_privilege
  -- These work because anon, authenticated, service_role are actual roles
  BEGIN
    SELECT pg_catalog.has_function_privilege('anon', v_func_oid, 'EXECUTE')
    INTO v_anon_has_execute;
  EXCEPTION WHEN OTHERS THEN
    v_anon_has_execute := false;
  END;

  BEGIN
    SELECT pg_catalog.has_function_privilege('authenticated', v_func_oid, 'EXECUTE')
    INTO v_auth_has_execute;
  EXCEPTION WHEN OTHERS THEN
    v_auth_has_execute := false;
  END;

  BEGIN
    SELECT pg_catalog.has_function_privilege('service_role', v_func_oid, 'EXECUTE')
    INTO v_service_has_execute;
  EXCEPTION WHEN OTHERS THEN
    v_service_has_execute := false;
  END;

  -- Report results
  IF NOT v_public_has_execute THEN
    RAISE NOTICE 'PUBLIC: cannot execute ✓';
  ELSE
    RAISE WARNING 'PUBLIC: can execute (security issue)';
  END IF;

  IF NOT v_anon_has_execute THEN
    RAISE NOTICE 'anon: cannot execute ✓';
  ELSE
    RAISE WARNING 'anon: can execute (security issue)';
  END IF;

  IF NOT v_auth_has_execute THEN
    RAISE NOTICE 'authenticated: cannot execute ✓';
  ELSE
    RAISE WARNING 'authenticated: can execute (security issue)';
  END IF;

  IF v_service_has_execute THEN
    RAISE NOTICE 'service_role: can execute ✓';
  ELSE
    RAISE WARNING 'service_role: cannot execute (application will fail)';
  END IF;
END $$;

-- =============================================================================
-- PART 3: Table Permissions
-- =============================================================================

DO $$
DECLARE
  v_table_name TEXT;
  v_service_can_select BOOLEAN;
  v_service_can_insert BOOLEAN;
  v_anon_can_select BOOLEAN;
  v_all_good BOOLEAN := true;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TABLE PERMISSIONS ===';

  FOR v_table_name IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('memorypops', 'memories', 'memorypop_reactions', 'ai_reveal_plans')
    ORDER BY tablename
  LOOP
    -- Check service_role has full access
    SELECT
      has_table_privilege('service_role', 'public.' || v_table_name, 'SELECT'),
      has_table_privilege('service_role', 'public.' || v_table_name, 'INSERT')
    INTO v_service_can_select, v_service_can_insert;

    -- Check anon doesn't have access
    BEGIN
      SELECT has_table_privilege('anon', 'public.' || v_table_name, 'SELECT')
      INTO v_anon_can_select;
    EXCEPTION WHEN OTHERS THEN
      v_anon_can_select := false;
    END;

    IF v_service_can_select AND v_service_can_insert AND NOT v_anon_can_select THEN
      RAISE NOTICE '%: service_role=full, anon=none ✓', v_table_name;
    ELSE
      RAISE WARNING '%: service_role SELECT=%, INSERT=%, anon SELECT=%',
        v_table_name, v_service_can_select, v_service_can_insert, v_anon_can_select;
      v_all_good := false;
    END IF;
  END LOOP;

  IF NOT v_all_good THEN
    RAISE WARNING 'Some table permissions are incorrect';
  END IF;
END $$;

-- =============================================================================
-- PART 4: RLS Auto-Enable Security (Optional)
-- =============================================================================

DO $$
DECLARE
  v_func_exists BOOLEAN;
  v_func_oid OID;
  v_func_acl aclitem[];
  v_acl_text TEXT;
  v_public_has_execute BOOLEAN := false;
  v_auth_has_execute BOOLEAN := false;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== SECURITY HARDENING (rls_auto_enable) ===';

  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
  ) INTO v_func_exists;

  IF NOT v_func_exists THEN
    RAISE NOTICE 'rls_auto_enable: not present (OK)';
    RETURN;
  END IF;

  -- Get ACL for rls_auto_enable
  SELECT p.oid, p.proacl INTO v_func_oid, v_func_acl
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable';

  -- Check PUBLIC access via ACL
  IF v_func_acl IS NULL THEN
    v_public_has_execute := true; -- NULL ACL = default = PUBLIC has execute
  ELSE
    v_acl_text := array_to_string(v_func_acl, ',');
    v_public_has_execute := v_acl_text LIKE '%=X%' OR v_acl_text LIKE '%=*X%';
  END IF;

  -- Check authenticated role
  BEGIN
    SELECT pg_catalog.has_function_privilege('authenticated', v_func_oid, 'EXECUTE')
    INTO v_auth_has_execute;
  EXCEPTION WHEN OTHERS THEN
    v_auth_has_execute := false;
  END;

  IF NOT v_public_has_execute THEN
    RAISE NOTICE 'PUBLIC: cannot execute rls_auto_enable ✓';
  ELSE
    RAISE WARNING 'PUBLIC: can execute rls_auto_enable';
  END IF;

  IF NOT v_auth_has_execute THEN
    RAISE NOTICE 'authenticated: cannot execute rls_auto_enable ✓';
  ELSE
    RAISE WARNING 'authenticated: can execute rls_auto_enable';
  END IF;
END $$;

-- =============================================================================
-- PART 5: Critical Columns Check
-- =============================================================================

DO $$
DECLARE
  v_has_schema_version BOOLEAN;
  v_has_prompt_version BOOLEAN;
  v_has_lock_fields BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== CRITICAL COLUMNS ===';

  -- Check schema_version and prompt_version exist
  SELECT
    EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'ai_reveal_plans'
        AND column_name = 'schema_version'
    ),
    EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'ai_reveal_plans'
        AND column_name = 'prompt_version'
    ),
    EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'ai_reveal_plans'
        AND column_name = 'generation_lock_holder'
    )
  INTO v_has_schema_version, v_has_prompt_version, v_has_lock_fields;

  IF v_has_schema_version AND v_has_prompt_version THEN
    RAISE NOTICE 'ai_reveal_plans: schema_version, prompt_version present ✓';
  ELSE
    RAISE WARNING 'ai_reveal_plans: missing schema_version=% or prompt_version=%',
      v_has_schema_version, v_has_prompt_version;
  END IF;

  IF v_has_lock_fields THEN
    RAISE NOTICE 'ai_reveal_plans: concurrency fields present ✓';
  ELSE
    RAISE WARNING 'ai_reveal_plans: missing concurrency fields';
  END IF;
END $$;

-- Final summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION COMPLETE ===';
  RAISE NOTICE 'Review output above for any warnings';
END $$;
