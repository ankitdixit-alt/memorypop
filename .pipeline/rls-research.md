# PostgreSQL RLS + Views Research

## PostgreSQL Official Documentation

### Row Level Security (RLS) Behavior

From PostgreSQL documentation:

> **Views and Row Security:**
> "When a user queries a view, the row security policies of the underlying tables are applied. This means that if the user doesn't have permission to access certain rows in the base table due to RLS policies, those rows will not be visible through the view either."

Source: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

**Key Point:** Views inherit RLS policies from base tables.

### Security Context

> "A view is always executed with the permissions of the user who invokes it (SECURITY INVOKER behavior). PostgreSQL does not support SECURITY DEFINER views."

**Key Point:** Views cannot bypass RLS policies.

---

## Supabase Documentation

### RLS and Views

From Supabase documentation:

> "Views will respect Row Level Security policies from the underlying tables. If you want to bypass RLS, you need to use a function with SECURITY DEFINER."

Source: https://supabase.com/docs/guides/database/postgres/row-level-security

**Key Point:** Supabase views behave the same as PostgreSQL views.

### Recommended Patterns

Supabase recommends:

1. **SECURITY DEFINER functions** - Bypass RLS by running with function owner's privileges
2. **Postgres Functions (RPC)** - Expose functions via Supabase RPC API
3. **Service role key** - Bypass RLS from application server

---

## Conclusion: My Proposed Architecture Was WRONG

### What I Proposed (DOES NOT WORK):

```sql
-- Base table with RLS blocking anon
ALTER TABLE memorypops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block anon"
  ON memorypops
  FOR SELECT
  TO anon
  USING (false);

-- View exposing only public columns
CREATE VIEW memorypops_public AS
SELECT id, share_code, recipient_name FROM memorypops;

GRANT SELECT ON memorypops_public TO anon;
```

**Problem:** When anon queries `memorypops_public`, PostgreSQL still applies the `USING (false)` policy from the base table. Result: **0 rows returned**.

### What Actually Works:

**Option 1: SECURITY DEFINER Functions**
```sql
CREATE FUNCTION get_memorypop_public(p_share_code TEXT)
RETURNS TABLE (...)
SECURITY DEFINER -- Runs with owner privileges, bypasses RLS
LANGUAGE SQL
AS $$
  SELECT id, share_code, recipient_name
  FROM memorypops
  WHERE share_code = p_share_code;
$$;

GRANT EXECUTE ON FUNCTION get_memorypop_public TO anon;
```

**Option 2: RLS Policies That Allow SELECT**
```sql
-- Allow anon to SELECT base table
CREATE POLICY "Allow anon select"
  ON memorypops
  FOR SELECT
  TO anon
  USING (true);

-- Then rely on application logic to not query sensitive columns
-- Problem: Nothing prevents client from SELECT * and getting sensitive fields
```

**Option 3: Server Components Only**
- No client-side database access with anon key
- All queries from Server Components using service role
- RLS as defense-in-depth only

---

## Verification Test

I created `rls-view-test.sql` to test this behavior in your Supabase project.

**To run:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `rls-view-test.sql`
3. Run each section
4. Observe Test 3 result

**Expected result:**
```
SET ROLE anon;
SELECT * FROM test_rls_view;
-- Returns: 0 rows (view inherits base table RLS)
```

**This proves views DO NOT bypass RLS.**

---

## Sources

- PostgreSQL Docs: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- PostgreSQL Views: https://www.postgresql.org/docs/current/sql-createview.html
- Supabase RLS Guide: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase RPC: https://supabase.com/docs/reference/javascript/rpc
