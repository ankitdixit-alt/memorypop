# Video Export - Supabase Storage Integration

**Date:** October 10, 2026
**Status:** Tested and verified in development
**Environment:** memorypop-test only

---

## Summary

Video exports now use Supabase Storage instead of local filesystem. The export worker generates MP4s locally, uploads them to private cloud storage, and downloads are served via short-lived signed URLs.

**Key achievement:** Downloads work independently of:
- Worker running
- Local exports/ folder
- Local machine availability

---

## Implementation

### Files Changed

1. **migrations/019_add_export_storage.sql** (new)
   - Creates private `exports` bucket
   - Storage policy for service role access only
   - Format: `exports/<memorypop-id>/<job-id>.mp4`

2. **scripts/export-worker.ts** (updated)
   - Added `uploadToStorage()` function
   - Uploads completed MP4 to Supabase Storage
   - Saves storage path (not local path) to database
   - Job marked completed only after successful upload
   - Upload failures treated as export failures (retryable)

3. **src/app/api/export/download/route.ts** (updated - security fix added October 11)
   - Removed filesystem reads (`fs.readFile`)
   - Generates short-lived signed URL (1 hour validity)
   - Redirects to signed URL with correct filename
   - Preserves .mp4 extension and video/mp4 content type
   - **Authorization check:** Requires `shareCode` parameter
   - Verifies job belongs to gift with matching share code
   - Returns 400 if shareCode missing, 404 if shareCode wrong

4. **src/lib/featureFlags.ts** (from previous PR)
   - `isVideoExportEnabled()` - server-side check
   - `isVideoExportEnabledClient()` - client-side check
   - Defaults to false when env vars not set

5. **src/components/DownloadRevealButton.tsx** (updated - security fix added October 11)
   - Added shareCode to download URL
   - Download link includes both jobId and shareCode parameters
   - Format: `/api/export/download?jobId=<uuid>&shareCode=<code>`

6. **Test scripts** (new and updated)
   - `scripts/setup-export-storage.ts` - Bucket creation and verification
   - `scripts/test-storage-export.ts` - End-to-end integration test (updated for authorization)
   - `scripts/test-feature-flag.ts` - Feature flag enforcement test (deprecated by verification script)
   - `scripts/test-export-verification.ts` - Comprehensive verification (feature flags + authorization)

### Storage Bucket Configuration

**Bucket:** `exports`
**Privacy:** Private (not publicly accessible)
**Access:** Service role only
**File size limit:** 500 MB per file
**Allowed types:** `video/mp4`

**Path format:** `<memorypop-id>/<job-id>.mp4`
**Example:** `52e9ce99-967f-4161-bbc0-35c96ffb881f/5a9a455a-b2d2-4b6b-bf15-af925f11c5a0.mp4`

---

## Test Results

### Environment Setup

**Test database:** memorypop-test (lbjtwbpnlruykqgsaiwy)
**Test gift:** test-sharing-1790756204563 (Plus tier)
**Bucket created:** October 10, 2026

### Test 1: Storage Bucket Creation

```
✅ Bucket created via Supabase Storage API
✅ Bucket is private
✅ Test upload successful
✅ Signed URL generation working
✅ Test file cleanup successful
```

### Test 2: Export Upload Flow

```
✅ Export job created via API
✅ Worker generated MP4 (local)
✅ Worker uploaded to storage
✅ Storage path saved: 52e9ce99-967f.../5a9a455a-b2d2...mp4
✅ Job marked completed after upload
✅ Local MP4 preserved (not deleted)
```

### Test 3: Download via Signed URL

```
✅ Download API generates signed URL
✅ Redirect to storage URL works
✅ Filename parameter preserved: sharing-test-user-birthday-reveal.mp4
✅ Video format valid (MP4 signature verified)
✅ Works without local exports/ folder
✅ Works without worker running
```

### Test 4: Authorization (Verified October 11, 2026)

```
✅ Access without shareCode: 400 rejected
✅ Access with wrong shareCode: 404 rejected
✅ Access with correct shareCode: 307 redirect to signed URL
✅ Invalid job ID: 404 rejected
✅ Authorization enforced before signed URL generation
```

**Implementation:** Download endpoint requires both `jobId` and `shareCode` parameters. The shareCode acts as authorization - only users with the gift's share link can download its exports.

### Test 5: Feature Flag (Verified October 11, 2026)

```
✅ ENABLE_VIDEO_EXPORT=false → API returns 503 before cache check
✅ ENABLE_VIDEO_EXPORT absent → API returns 503 (defaults to disabled)
✅ NEXT_PUBLIC_ENABLE_VIDEO_EXPORT=false → Buttons hidden (client-side)
✅ NEXT_PUBLIC_ENABLE_VIDEO_EXPORT absent → Buttons hidden (defaults to disabled)
✅ Both true → Feature enabled, export works end-to-end
```

**Implementation:** Flag check happens at the start of the request handler, before any database lookups or cache checks. Production defaults to disabled when environment variables are not set.

**Production verification status:** Not verified on live deployment. Feature flags were tested only in local development environment.

### Test 6: Build

```
✅ npm run build passes (exit status 0)
✅ No TypeScript errors
✅ All routes generated successfully
```

---

## Migration Applied

**Migration 019** applied to **memorypop-test only**

**Method:** Supabase Storage API (`createBucket`)
**Verification:** `scripts/setup-export-storage.ts`
**Result:** Bucket exists and functional

**Production:** Migration NOT applied
**Reason:** Requires manual verification before production use

---

## What Works Now

### Local Development (Flags Enabled)

1. ✅ Create video button visible
2. ✅ Export job created
3. ✅ Worker generates MP4
4. ✅ Worker uploads to Supabase Storage
5. ✅ Download uses signed URL
6. ✅ Correct filename with .mp4
7. ✅ Works offline (after upload)

### Production (Flags Disabled)

1. ✅ Buttons hidden in UI
2. ✅ API rejects with 503
3. ✅ No job creation
4. ✅ All other features work normally

---

## What Changed from Previous Version

**Before (filesystem):**
- Worker saves MP4 to local `exports/` folder
- Download reads from local filesystem
- Requires worker machine always available
- 3.2 GB local storage used

**After (storage):**
- Worker saves MP4 to local folder (temp)
- Worker uploads to Supabase Storage
- Download uses signed URL from storage
- Worker machine not needed after upload
- Local files can be deleted safely

---

## Preserved

✅ All 3.2 GB cached local videos untouched
✅ Existing export_jobs table intact
✅ Daughter's gift unchanged
✅ Filename fix (.mp4 extension)
✅ Button layout fix
✅ Plus tier enforcement
✅ Content hash caching
✅ Failure retry logic

---

## What Remains Before Production

### 1. Hosted Worker Infrastructure

**Required:**
- Dedicated server/container for export-worker.ts
- Chromium + FFmpeg pre-installed
- Network access to production site
- Monitoring and auto-restart
- Scalable queue (not polling)

**Options:**
- AWS ECS/Fargate with playwright-chromium image
- Google Cloud Run with FFmpeg
- Dedicated VPS with supervisord
- Render.com background worker

**Estimate:** 2-4 hours setup + testing

### 2. Production Database Setup

**Required:**
- Apply migration 018 (export_jobs table)
- Apply migration 019 (storage bucket)
- Verify service role permissions
- Test write access from production API

**Method:** Run via Supabase Dashboard SQL Editor
**Estimate:** 15-30 minutes

### 3. Production Storage Setup

**Required:**
- Create `exports` bucket in production
- Set to private
- Configure file size limits
- Verify service role access

**Method:** Supabase Dashboard → Storage
**Estimate:** 10 minutes

### 4. Production Configuration

**Required:**
- Set `ENABLE_VIDEO_EXPORT=true` in Vercel
- Set `NEXT_PUBLIC_ENABLE_VIDEO_EXPORT=true` in Vercel
- Verify service role key is set
- Verify base URL points to production

**Method:** Vercel Dashboard → Environment Variables
**Estimate:** 5 minutes

### 5. End-to-End Production Test

**Required:**
- Create test Plus gift in production
- Request export via production API
- Verify worker processes and uploads
- Test download with production URL
- Verify signed URL works
- Test unauthorized access rejection

**Method:** Manual via production site
**Estimate:** 30 minutes

---

## Feature Flag Status

**Local (.env.local):**
```bash
ENABLE_VIDEO_EXPORT=true
NEXT_PUBLIC_ENABLE_VIDEO_EXPORT=true
```

**Production (Vercel):**
```
ENABLE_VIDEO_EXPORT=<not set> → defaults to false
NEXT_PUBLIC_ENABLE_VIDEO_EXPORT=<not set> → defaults to false
```

**Behavior when disabled:**
- Buttons hidden in UI
- API returns 503 "Video export is not available"
- No database writes
- All other features work normally

**To enable in production:**
1. Complete hosted worker setup
2. Complete database/storage setup
3. Run end-to-end production test
4. Set environment variables in Vercel
5. Redeploy

---

## Security

✅ Storage bucket is private (not public)
✅ Signed URLs expire after 1 hour
✅ **Authorization via shareCode requirement (fixed October 11)**
✅ Download requires both jobId AND shareCode
✅ ShareCode acts as access control (same as reveal page)
✅ Service role key server-side only
✅ No secrets in client code
✅ Plus tier enforcement preserved

**Security fix applied October 11, 2026:**
Initial implementation only checked if job existed, allowing anyone with a jobId to download. Fixed by requiring shareCode parameter and verifying it matches the job's gift before providing signed URL.

---

## Performance

**Upload time:** ~5-10 seconds for typical 5 MB video
**Download:** Instant redirect to signed URL
**Storage bandwidth:** Supabase CDN (fast globally)
**Worker requirement:** Only during export generation

---

## Cost Estimate

**Supabase Storage:**
- First 1 GB: Free
- Additional: $0.021/GB/month
- Bandwidth: $0.09/GB

**Typical video:** 5 MB
**100 exports/month:** 500 MB storage = $0
**1000 exports/month:** 5 GB storage = ~$0.08/month

---

## Next Steps

1. ✅ Storage integration complete (test environment)
2. ✅ Feature flags working
3. ✅ All tests passing
4. ⏳ **Next:** Set up hosted worker infrastructure
5. ⏳ **Next:** Apply migrations to production
6. ⏳ **Next:** Run end-to-end production test
7. ⏳ **Next:** Enable feature flags in production

---

## Not Production-Ready Until

- [ ] Hosted worker deployed and tested
- [ ] Production database schema updated
- [ ] Production storage bucket created
- [ ] Production environment variables set
- [ ] End-to-end production test passed

**Current status:** Development complete, infrastructure setup required
