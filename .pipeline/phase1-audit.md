# Phase 1: Pre-Implementation Audit

**Date:** 2026-07-23
**Phase:** Service Role Client Foundation

---

## Current State Analysis

### Existing Supabase Clients

**Found:** 1 client only (anon key)
- Location: `src/lib/supabase.ts`
- Type: Anon key client
- Used by: 15 files

**No service role client exists yet.**

---

## Files Requiring Changes

### Server Components (4 files)

These run on the server but currently use anon key (incorrect):

1. `src/app/dashboard/[shareCode]/page.tsx`
   - Type: Server Component (no "use client")
   - Usage: Queries memorypops and memories tables
   - Why change: Should use service role for server queries

2. `src/app/m/[shareCode]/page.tsx`
   - Type: Server Component (no "use client")
   - Usage: Queries memorypops table for landing page
   - Why change: Should use service role for server queries

3. `src/app/m/[shareCode]/reveal/page.tsx`
   - Type: Server Component (no "use client")
   - Usage: Queries memorypops and memories tables
   - Why change: Should use service role for server queries

4. `src/app/m/[shareCode]/contribute/layout.tsx`
   - Type: Server Layout (no "use client")
   - Usage: Queries memorypops table for metadata
   - Why change: Should use service role for server queries

---

### API Routes (6 files)

These run on the server but currently use anon key (incorrect):

5. `src/app/api/checkout/route.ts`
   - Type: API Route
   - Usage: Queries memorypops for payment verification
   - Why change: Should use service role for server operations

6. `src/app/api/memorypops/create/route.ts`
   - Type: API Route
   - Usage: Inserts new memorypop
   - Why change: Should use service role for server operations

7. `src/app/api/send-creator-email/route.ts`
   - Type: API Route
   - Usage: Queries and updates memorypops
   - Why change: Should use service role for server operations

8. `src/app/api/verify-email/route.ts`
   - Type: API Route
   - Usage: Queries and updates memorypops for email verification
   - Why change: Should use service role for server operations

9. `src/app/api/verify-payment/route.ts`
   - Type: API Route
   - Usage: Queries and updates memorypops for payment
   - Why change: Should use service role for server operations

10. `src/app/manage/[token]/route.ts`
    - Type: API Route
    - Usage: Queries memorypops for token authentication
    - Why change: Should use service role for server operations

---

### Other Server Routes (1 file)

11. `src/app/sitemap.xml/route.ts`
    - Type: Route Handler (generates sitemap)
    - Usage: Queries memorypops table
    - Why change: Should use service role for server operations

---

## Files NOT Changing (Client Components)

These correctly use anon key and will NOT be modified in Phase 1:

- ✅ `src/app/m/[shareCode]/contribute/page.tsx` (Client Component)
- ✅ `src/app/m/[shareCode]/reveal/ReactionPrompt.tsx` (Client Component)
- ✅ `src/app/m/[shareCode]/reveal/RevealExperience.tsx` (Client Component)
- ✅ `src/components/DashboardClientSection.tsx` (Client Component)

**Reason:** These legitimately run in the browser and currently use anon key correctly. Phase 2 will address these.

---

## New File

12. `src/lib/supabaseServer.ts`
    - Type: New server-only client
    - Purpose: Provides service role client for server-side operations
    - Security: Should NEVER be imported by Client Components

---

## Summary

**Total files to modify:** 11
**New files:** 1
**Client components unchanged:** 4

**Change pattern:**
```typescript
// Before:
import { supabase } from '@/lib/supabase';

// After:
import { supabaseServer } from '@/lib/supabaseServer';

// Then replace all `supabase.` with `supabaseServer.`
```

**Why this is safe:**
- No RLS enabled yet
- Service role has same permissions as anon (currently no restrictions)
- No behavior changes
- Just using correct client for server-side operations

---

## Verification Plan

After implementation:
1. TypeScript compilation succeeds
2. All imports resolve correctly
3. No "use client" files import supabaseServer
4. Application builds successfully
5. All user flows work in dev mode

**No behavior changes expected.**

---

## Risk Assessment

**Risk: LOW**

- Service role key will be server-side only (never exposed to client)
- No RLS changes in this phase
- No API contract changes
- Fully backwards compatible
- Easy rollback (just revert imports)

**Rollback:** Revert commit, no database changes needed.
