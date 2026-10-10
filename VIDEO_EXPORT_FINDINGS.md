# Video Export - Production Readiness Findings

## Executive Summary

**Finding:** Video export CANNOT work in production without additional infrastructure.

**Action Taken:** Feature flag implemented to hide Create/Download video buttons in production until infrastructure is ready.

---

## Investigation Results

### 1. Export Worker Location

**Where:** `scripts/export-worker.ts` - **Local script only**

**How it works:**
- Polls database every 5 seconds for pending jobs
- Must run continuously: `npx tsx scripts/export-worker.ts`
- **Location:** User's Mac only

**Confirmed fact:** Comment in worker explicitly states "This is a development/local implementation"

### 2. Runtime Dependencies

**Required:**
- Chromium browser (Playwright)
- FFmpeg with H.264 codec
- Network access to localhost reveal pages
- Write access to local `exports/` directory

**Vercel serverless functions:**
- ❌ No Chromium pre-installed
- ❌ No FFmpeg pre-installed
- ❌ No background worker support
- ❌ Read-only filesystem (except /tmp)

**Confirmed fact:** Worker script requires `process.cwd() + '/exports'` for output

### 3. Video Storage

**Current implementation:**
- Downloads read from `fs.readFile(job.video_path)`
- `video_path` is local filesystem path (e.g., `exports/run-*/reveal-*.mp4`)
- **Location:** User's Mac `/exports/` directory (3.2 GB, 139 files)

**Vercel deployment:**
- ❌ Cannot access local Mac filesystem
- ❌ Uploaded /exports would be in build artifact (ephemeral)
- ❌ No persistent storage between function invocations

**Confirmed fact:** Download endpoint uses Node `fs` module, not cloud storage SDK

### 4. Database Schema

**Migration 018:** `migrations/018_add_export_jobs.sql`

**Status:** Unknown if applied to production

**Tables required:**
- `export_jobs` (id, memorypop_id, status, video_path, content_hash, etc.)

**Verification needed:** Check if table exists in production database

---

## Feature Flag Implementation

### Files Changed

1. **`src/lib/featureFlags.ts`** (new)
   - Server-side: `isVideoExportEnabled()` checks `ENABLE_VIDEO_EXPORT`
   - Client-side: `isVideoExportEnabledClient()` checks `NEXT_PUBLIC_ENABLE_VIDEO_EXPORT`

2. **`src/app/api/export/request/route.ts`**
   - Added flag check at top of POST handler
   - Returns 503 "Video export is not available" if disabled

3. **`src/app/ai-director-reveal/RevealPlayer.tsx`**
   - Added flag check: `videoExportEnabled && shareCode &&`
   - Hides button and helper text when disabled

4. **`src/components/DashboardSharingCards.tsx`**
   - Added flag check in SharingCard
   - Hides button when disabled

5. **`.env.local`** (updated)
   - Added `ENABLE_VIDEO_EXPORT=true`
   - Added `NEXT_PUBLIC_ENABLE_VIDEO_EXPORT=true`

### Environment Variables

**Local development (.env.local):**
```bash
ENABLE_VIDEO_EXPORT=true
NEXT_PUBLIC_ENABLE_VIDEO_EXPORT=true
```

**Production (Vercel):**
- Variables not set → defaults to false (disabled)
- Buttons hidden, API returns 503

### Behavior

**When enabled (local):**
- ✅ Create/Download video buttons visible
- ✅ API accepts export requests
- ✅ Worker processes jobs (if running)

**When disabled (production):**
- ✅ Create/Download video buttons hidden
- ✅ API rejects export requests with 503
- ✅ No database writes to export_jobs
- ✅ All other features work normally

---

## What This Preserves

**Local testing:**
- ✅ Video export fully functional with worker running
- ✅ Existing cached videos (3.2 GB) untouched
- ✅ Test scripts still work

**Daughter's gift:**
- ✅ No changes to gift data
- ✅ Reveal experience unchanged
- ✅ All memories preserved

**Approved features:**
- ✅ Filename fix (.mp4 extension)
- ✅ Button layout fix
- ✅ Plus tier features
- ✅ All reveal experiences

---

## Production Deployment Safety

**Before enabling in production, requires:**

1. **Background worker infrastructure**
   - Dedicated server/container running export-worker.ts
   - Monitoring and auto-restart
   - Scalable (queue-based, not polling)

2. **Cloud storage**
   - S3, Google Cloud Storage, or Supabase Storage
   - Update download endpoint to stream from cloud
   - Update worker to upload to cloud

3. **Runtime dependencies**
   - Chromium installation
   - FFmpeg installation
   - Sufficient CPU/memory for video rendering

4. **Database migration**
   - Apply migration 018 to production
   - Verify export_jobs table exists

5. **Configuration**
   - Set ENABLE_VIDEO_EXPORT=true in Vercel
   - Set NEXT_PUBLIC_ENABLE_VIDEO_EXPORT=true in Vercel

---

## Build Verification

**Status:** ✅ Build passes (exit status 0)

**Test URL (local):**
- Reveal: http://localhost:3000/m/test-sharing-1790756204563/reveal
- Dashboard: http://localhost:3000/dashboard/test-sharing-1790756204563

**Expected behavior:**
- With flag enabled: Buttons visible (local)
- With flag disabled: Buttons hidden (production)

---

## Assumptions vs. Facts

**Confirmed facts:**
- ✅ Worker is local script
- ✅ Worker requires Chromium + FFmpeg
- ✅ Downloads read from local filesystem
- ✅ Vercel has no background workers
- ✅ Migration 018 exists

**Assumptions:**
- ⚠️ Migration 018 not applied to production (unknown)
- ⚠️ No cloud storage configured

**Not verified:**
- Production database schema
- Existing production environment variables
