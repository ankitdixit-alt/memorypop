# Complete Application Audit: Supabase Client Usage

**Date:** 2026-07-22
**Purpose:** Determine if MemoryPop can become a server-first application with zero browser database access

---

## 1. Page Component Classification

### Server Components (Run Server-Side)

| Page | Type | Supabase Usage | Evidence |
|------|------|----------------|----------|
| `/app/dashboard/[shareCode]/page.tsx` | Server | ✅ Queries DB | No `"use client"` directive |
| `/app/m/[shareCode]/page.tsx` | Server | ✅ Queries DB | No `"use client"` directive |
| `/app/m/[shareCode]/reveal/page.tsx` | Server | ✅ Queries DB | No `"use client"` directive |
| `/app/m/[shareCode]/contribute/layout.tsx` | Server | ✅ Queries DB | No `"use client"` directive |
| `/app/success/page.tsx` | Server | ❌ No DB access | No `"use client"` directive |
| `/app/layout.tsx` | Server | ❌ No DB access | Root layout |
| `/app/unauthorized/page.tsx` | Server | ❌ No DB access | No `"use client"` directive |
| `/app/verify-email/page.tsx` | Server | ❌ No DB access | No `"use client"` directive |
| `/app/create/layout.tsx` | Server | ❌ No DB access | No `"use client"` directive |
| `/app/plus/layout.tsx` | Server | ❌ No DB access | No `"use client"` directive |

**Total Server Components:** 10
**Server Components Using Supabase:** 4

### Client Components (Run in Browser)

| Page | Type | Supabase Usage | Evidence |
|------|------|----------------|----------|
| `/app/create/page.tsx` | Client | ❌ No DB access | Line 1: `"use client"` |
| `/app/page.tsx` (homepage) | Client | ❌ No DB access | Line 1: `"use client"` |
| `/app/plus/page.tsx` | Client | ❌ No DB access | Line 1: `"use client"` |
| `/app/test-sentry/page.tsx` | Client | ❌ No DB access | Line 1: `'use client'` |
| `/app/m/[shareCode]/contribute/page.tsx` | Client | ✅ Queries DB + Storage | Line 1: `"use client"` |

**Total Client Components:** 5
**Client Components Using Supabase:** 1

### Mixed (Server Component with Client Children)

| Page | Server Component | Client Child Components |
|------|------------------|------------------------|
| `/app/dashboard/[shareCode]/page.tsx` | Queries DB server-side | `<DashboardClientSection>` - Updates DB client-side |
| `/app/m/[shareCode]/reveal/page.tsx` | Queries DB server-side | `<RevealExperience>` - Queries DB client-side<br>`<ReactionPrompt>` - Inserts DB client-side |

---

## 2. Components Currently Accessing Supabase from Browser

### Client Component: `/app/m/[shareCode]/contribute/page.tsx`

**Database Operations:**
```typescript
// Line 34-38: Query memorypop data
const { data } = await supabase
  .from("memorypops")
  .select("occasion, recipient_name, celebration_date, cover_style, tone")
  .eq("share_code", shareCode)
  .single();

// Line 119-123: Look up memorypop by share_code
const { data: memorypop } = await supabase
  .from("memorypops")
  .select("id")
  .eq("share_code", shareCode)
  .single();

// Line 132-139: Insert memory
const { error: insertError } = await supabase
  .from("memories")
  .insert({
    memorypop_id: memorypop.id,
    contributor_name: name,
    message: message,
    photo_url: photoUrl,
  });

// Line 148-151: Count memories
const { count: memoryCount } = await supabase
  .from("memories")
  .select("*", { count: "exact", head: true })
  .eq("memorypop_id", memorypop.id);
```

**Storage Operations:**
```typescript
// Line 78-83: Upload photo
const { data, error } = await supabase.storage
  .from('memory-photos')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });

// Line 90-92: Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('memory-photos')
  .getPublicUrl(filePath);
```

**Summary:** 4 database operations + 2 storage operations

---

### Client Component: `<RevealExperience>` (nested in `/app/m/[shareCode]/reveal/page.tsx`)

**Database Operations:**
```typescript
// Line 88-92: Check if user already reacted
const { data, error } = await supabase
  .from('memorypop_reactions')
  .select('reaction_type')
  .eq('memorypop_id', memorypopId)
  .maybeSingle();
```

**Summary:** 1 database read operation

---

### Client Component: `<ReactionPrompt>` (nested in `<RevealExperience>`)

**Database Operations:**
```typescript
// Line 30-35: Insert reaction
const { error } = await supabase
  .from("memorypop_reactions")
  .insert({
    memorypop_id: memorypopId,
    reaction_type: reactionType,
  });
```

**Summary:** 1 database insert operation

---

### Client Component: `<DashboardClientSection>` (nested in `/app/dashboard/[shareCode]/page.tsx`)

**Database Operations:**
```typescript
// Line 32: Update status to 'ready' (via memoryPopStates.ts helper)
const result = await transitionToReady(supabase, memorypopId);

// In memoryPopStates.ts line 15-20:
const { error } = await supabase
  .from('memorypops')
  .update({ status: 'ready' })
  .eq('id', memorypopId)
  .select()
  .single();
```

**Summary:** 1 database update operation

---

### Total Browser Database Access

| Component | SELECT | INSERT | UPDATE | Storage |
|-----------|--------|--------|--------|---------|
| contribute/page.tsx | 3 | 1 | 0 | 2 (upload + getPublicUrl) |
| RevealExperience | 1 | 0 | 0 | 0 |
| ReactionPrompt | 0 | 1 | 0 | 0 |
| DashboardClientSection | 0 | 0 | 1 | 0 |
| **TOTAL** | **4** | **2** | **1** | **2** |

---

## 3. After Proposed Refactor: Will ANY Browser Component Need Database Access?

### Analysis

**Current browser database operations:**

1. **Contribute page - Read memorypop** → Can be replaced by Server Component passing props
2. **Contribute page - Insert memory** → Should move to API route for validation/security
3. **Contribute page - Count memories** → Can be replaced by Server Component or API response
4. **RevealExperience - Check reaction** → Can be replaced by Server Component passing props
5. **ReactionPrompt - Insert reaction** → Should move to API route (prevents duplicate inserts without unique constraint)
6. **DashboardClientSection - Update status** → Should move to API route (creator authorization required)

**Answer: NO - After refactor, zero browser components need direct database access.**

**Storage operations:**
- Contribute page photo upload → **CAN STAY** client-side (Supabase Storage has independent permissions)

---

## 4. Do We Still Need NEXT_PUBLIC_SUPABASE_ANON_KEY?

### Current Usage

**Files using anon key (client-side):**
1. `src/lib/supabase.ts` - Creates public client
2. All client components listed above

**After refactor:**

| Use Case | Needs Anon Key? |
|----------|----------------|
| Database SELECT | ❌ No - Move to Server Components |
| Database INSERT | ❌ No - Move to API routes |
| Database UPDATE | ❌ No - Move to API routes |
| Storage upload | ✅ YES - If keeping client-side uploads |
| Storage getPublicUrl | ✅ YES - If keeping client-side uploads |
| Realtime subscriptions | ❌ No - Not currently used |

**Answer: YES, but ONLY if we keep client-side storage uploads.**

**If we also move storage uploads server-side:**
- **Answer: NO - anon key not needed at all**

---

## 5. What Functionality Depends on Anon Key?

### Supabase Features That Use Anon Key

| Feature | Used in MemoryPop? | Can Be Moved Server-Side? |
|---------|-------------------|--------------------------|
| Database queries | ✅ Yes (4 SELECT, 2 INSERT, 1 UPDATE) | ✅ Yes - Server Components/API routes |
| Storage uploads | ✅ Yes (photo uploads) | ✅ Yes - API route with multipart/form-data |
| Storage downloads | ✅ Yes (getPublicUrl) | ⚠️ Public URLs work without auth |
| Realtime subscriptions | ❌ No | N/A |
| Auth (Supabase Auth) | ❌ No | N/A (using custom creator sessions) |

**Conclusion:** Everything can be moved server-side.

---

## 6. Can We Remove Browser Database Access Entirely?

### Option A: Keep Client-Side Storage Uploads (Anon Key Required)

**Architecture:**
```
Browser
  ↓ (Storage uploads only)
Supabase Storage (via anon key with RLS policies)

Browser
  ↓ (All other operations via fetch)
Next.js API Routes
  ↓ (Service role key)
Supabase Postgres
```

**RLS Configuration:**
```sql
-- Database: Block all anon access
ALTER TABLE memorypops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No anon access" ON memorypops FOR ALL TO anon USING (false);

-- Storage: Allow anon uploads/reads
CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'memory-photos');
CREATE POLICY "Allow reads" ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'memory-photos');
```

**Pros:**
- ✅ Client uploads photos directly (low latency, no server processing)
- ✅ Storage RLS prevents unauthorized operations
- ✅ Database completely locked down

**Cons:**
- ⚠️ Still need to expose anon key to client
- ⚠️ Anon key in browser can be extracted (though useless for DB)

---

### Option B: Move Everything Server-Side (No Anon Key Needed)

**Architecture:**
```
Browser
  ↓ (fetch API routes only)
Next.js API Routes
  ↓ (Service role key)
Supabase (Postgres + Storage)
```

**Changes required:**
1. Create API route: `POST /api/upload` - Accepts multipart/form-data, uploads to storage
2. All database operations via API routes or Server Components
3. Remove `NEXT_PUBLIC_SUPABASE_ANON_KEY` from environment
4. Remove `src/lib/supabase.ts` (client) entirely

**Pros:**
- ✅ No credentials exposed to browser
- ✅ Complete server-side control
- ✅ Can add rate limiting, validation, virus scanning on uploads

**Cons:**
- ⚠️ Extra API route for uploads
- ⚠️ Server must handle multipart/form-data parsing
- ⚠️ Slightly higher latency (browser → API → storage vs browser → storage)

**Verdict:** Option B is more secure, but Option A is simpler and still secure for MemoryPop's use case.

---

## 7. Smallest Set of Changes to Reach Server-First Architecture

### Target: Option A (Keep Client-Side Storage, Move All Database Server-Side)

### Changes Required

#### Change 1: Create Service Role Client (5 min)

**New file:** `src/lib/supabaseServer.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

---

#### Change 2: Update All Server Components (15 min)

**Replace:** `import { supabase } from "@/lib/supabase"`
**With:** `import { supabaseServer } from "@/lib/supabaseServer"`

**Files:**
- `src/app/dashboard/[shareCode]/page.tsx`
- `src/app/m/[shareCode]/page.tsx`
- `src/app/m/[shareCode]/reveal/page.tsx`
- `src/app/m/[shareCode]/contribute/layout.tsx`

**Tool:** `sed -i '' 's/from "@\/lib\/supabase"/from "@\/lib\/supabaseServer"/g' <file>`

Then replace all `supabase.` → `supabaseServer.` in those files.

---

#### Change 3: Update All API Routes (10 min)

**Replace:** `import { supabase } from "@/lib/supabase"`
**With:** `import { supabaseServer } from "@/lib/supabaseServer"`

**Files:**
- `src/app/api/checkout/route.ts`
- `src/app/api/verify-email/route.ts`
- `src/app/api/memorypops/create/route.ts`
- `src/app/api/send-creator-email/route.ts`
- `src/app/api/verify-payment/route.ts`
- `src/app/sitemap.xml/route.ts`
- `src/app/manage/[token]/route.ts`

---

#### Change 4: Refactor Contribute Page (30 min)

**Current:** Client Component with `useEffect` database queries

**Split into:**

**File 1:** `src/app/m/[shareCode]/contribute/page.tsx` (Server Component)
```typescript
import { supabaseServer } from '@/lib/supabaseServer';
import ContributeForm from './ContributeForm';

export default async function ContributePage({ params }) {
  const { shareCode } = await params;

  // Query with service role (server-side)
  const { data: memorypop } = await supabaseServer
    .from('memorypops')
    .select('id, recipient_name, occasion, celebration_date, cover_style, tone')
    .eq('share_code', shareCode)
    .single();

  if (!memorypop) notFound();

  return <ContributeForm memorypop={memorypop} shareCode={shareCode} />;
}
```

**File 2:** `src/app/m/[shareCode]/contribute/ContributeForm.tsx` (Client Component)
```typescript
'use client';

import { supabase } from '@/lib/supabase'; // For storage only

export default function ContributeForm({ memorypop, shareCode }) {
  // All UI state (name, message, photo)
  // Keep photo upload using supabase.storage (client-side)
  // Replace memory INSERT with API call
}
```

---

#### Change 5: Create Memory Insert API Route (10 min)

**New file:** `src/app/api/memories/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  const { shareCode, contributorName, message, photoUrl } = await request.json();

  // Look up memorypop_id
  const { data: memorypop } = await supabaseServer
    .from('memorypops')
    .select('id')
    .eq('share_code', shareCode)
    .single();

  if (!memorypop) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Insert memory
  const { error } = await supabaseServer
    .from('memories')
    .insert({
      memorypop_id: memorypop.id,
      contributor_name: contributorName,
      message,
      photo_url: photoUrl,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

---

#### Change 6: Create Reaction API Route (10 min)

**New file:** `src/app/api/reactions/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  const { memorypopId, reactionType } = await request.json();

  const { error } = await supabaseServer
    .from('memorypop_reactions')
    .insert({ memorypop_id: memorypopId, reaction_type: reactionType });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**Update:** `src/app/m/[shareCode]/reveal/ReactionPrompt.tsx`
```typescript
// Replace direct insert with API call
const response = await fetch('/api/reactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ memorypopId, reactionType }),
});
```

---

#### Change 7: Create Status Update API Route (10 min)

**New file:** `src/app/api/memorypops/[id]/status/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await request.json();

  // Validate status
  if (!['collecting', 'ready', 'revealed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('memorypops')
    .update({ status })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**Update:** `src/components/DashboardClientSection.tsx`
```typescript
// Replace transitionToReady(supabase, ...) with API call
const response = await fetch(`/api/memorypops/${memorypopId}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'ready' }),
});
```

---

#### Change 8: Move Reaction Check to Server Component (10 min)

**Update:** `src/app/m/[shareCode]/reveal/page.tsx` (Server Component)
```typescript
// Query reaction server-side
const { data: reaction } = await supabaseServer
  .from('memorypop_reactions')
  .select('reaction_type')
  .eq('memorypop_id', memoryPop.id)
  .maybeSingle();

// Pass to RevealExperience as prop
return (
  <RevealExperience
    {...props}
    existingReaction={reaction}
  />
);
```

**Update:** `src/app/m/[shareCode]/reveal/RevealExperience.tsx`
```typescript
// Remove useEffect that queries reactions
// Use existingReaction prop from server
```

---

#### Change 9: Apply Simple RLS (5 min)

**Run in Supabase SQL Editor:**
```sql
-- Block all anon database access
ALTER TABLE memorypops ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorypop_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No anon access" ON memorypops FOR ALL TO anon USING (false);
CREATE POLICY "No anon access" ON memories FOR ALL TO anon USING (false);
CREATE POLICY "No anon access" ON memorypop_reactions FOR ALL TO anon USING (false);

-- Storage policies (allow client uploads)
-- Applied via Supabase Dashboard → Storage → memory-photos → Policies
```

---

### Total Time Estimate

| Change | Time |
|--------|------|
| 1. Create supabaseServer | 5 min |
| 2. Update Server Components | 15 min |
| 3. Update API routes | 10 min |
| 4. Refactor contribute page | 30 min |
| 5. Create memory API route | 10 min |
| 6. Create reaction API route | 10 min |
| 7. Create status API route | 10 min |
| 8. Move reaction check server-side | 10 min |
| 9. Apply RLS | 5 min |
| **TOTAL** | **~105 minutes (~1.75 hours)** |

---

## Final Recommendation

### ✅ Yes - MemoryPop Should Become Server-First

**Evidence:**
1. Most pages are already Server Components (10/15)
2. Only 1 page needs refactoring (contribute page)
3. Only 4 client components need minor updates
4. All database operations can be moved server-side
5. Storage uploads can stay client-side (isolated, secure)

**Benefits:**
- Zero database credentials exposed to browser
- RLS blocks all anon database access
- Simpler security model
- Better performance (Server Components)
- Easier to add rate limiting, validation

**Trade-offs:**
- ~2 hours of refactoring work
- 3 new API routes
- Anon key still needed for storage uploads (acceptable)

**Verdict:** The architecture is already 80% server-first. The remaining 20% should be migrated for production-grade security.
