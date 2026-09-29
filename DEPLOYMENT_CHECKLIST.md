# Plus Features - Production Deployment Checklist

**Status**: Ready for Production
**Manual Verification**: ✅ Passed

---

## 1. Files to Commit (13 files)

### Core Implementation
```
src/config/plus.ts
src/lib/mediaValidation.ts
src/app/m/[shareCode]/contribute/page.tsx
src/app/m/[shareCode]/contribute/ContributeForm.tsx
src/app/api/memories/route.ts
src/app/api/upload/route.ts
src/app/api/memorypops/[id]/custom-music/route.ts
src/app/m/[shareCode]/reveal/page.tsx
src/app/m/[shareCode]/reveal/RevealExperience.tsx
src/app/dashboard/[shareCode]/page.tsx
src/components/DashboardPlusFeatures.tsx
src/app/m/[shareCode]/reveal/AIDirectorRevealController.tsx
migrations/PRODUCTION_PLUS_CUSTOM_MUSIC.sql
```

**Exclude from commit**: `scripts/test-*.ts` and `scripts/add-test-memories.ts` (test-only)

---

## 2. Production Setup Required

### A. Database Migration (NOT YET APPLIED)

Run in Supabase SQL Editor for **production project gvfpgawbvuttglfscngg**:

```sql
ALTER TABLE memorypops ADD COLUMN IF NOT EXISTS custom_music_url TEXT;
COMMENT ON COLUMN memorypops.custom_music_url IS 'Storage path to custom Plus reveal music (MP3/M4A, max 20MB). Signed playback URLs generated on-demand.';
```

**Verify**:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'memorypops' AND column_name = 'custom_music_url';
```

---

### B. Storage Bucket Creation (NOT YET CREATED)

Create in Supabase Dashboard → Storage (**production project**):

- **Bucket name**: `memorypop-custom-music`
- **Privacy**: Private (signed URLs only)
- **File size limit**: 20 MB
- **Allowed MIME types**: `audio/mpeg, audio/mp3, audio/mp4, audio/x-m4a`

---

### C. Already Completed (DO NOT RE-RUN)

❌ Beta code migration (already in production)
❌ `is_premium` column (already exists)
❌ Environment variables (already configured)

---

## 3. Vercel Configuration Changes

**None Required**

Uses existing environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `VIDEO_VALIDATION_SECRET`

---

## 4. Suggested Commit Message

```
Add Plus contribution limits and custom reveal music

Core Features:
- Plus: 10 photos, 3 GIFs, 90s videos (Standard: 3/1/15s)
- Custom music upload for Plus creators (MP3/M4A, max 20MB)
- Direct-to-Supabase upload (avoids Vercel 4.5MB body limit)
- Server-side tier validation with dynamic client limits

Implementation:
- Creator authorization for custom music API (GET/POST/DELETE)
- Magic bytes validation for audio files (MP3 ID3v2, MPEG frames, M4A ftyp)
- Signed upload URLs (5 min) and signed playback URLs (1 hour)
- Error fallback to default soundtrack if custom music fails
- Audio initialization fix for first-playback silence
- Sound toggle fix for mute/unmute during reveal

Database:
- Add custom_music_url column to memorypops table
- Stores durable storage path (not signed URL)

Storage:
- New private bucket: memorypop-custom-music
- 20MB limit, audio MIME types only

Testing:
- All authorization tests passing (3/3)
- All API flow tests passing (3/3)
- All video duration tests passing (4/4)
- Manual playback verification successful
```

---

## 5. Deployment Steps

1. **Commit changes** (13 files listed above)
2. **Apply database migration** (Section 2A)
3. **Create storage bucket** (Section 2B)
4. **Push to production** (standard git workflow)
5. **Verify** (test Plus upload and reveal playback)

---

## Test Results Summary

✅ Custom music authorization: 3/3 tests passing
✅ Custom music API flow: 3/3 tests passing
✅ Video duration limits: 4/4 tests passing
✅ Manual playback verification: Founder confirmed successful
✅ Production build: Passed without errors

**Manual Verification Completed**:
- First playback → music starts immediately ✅
- Sound off → music stops ✅
- Sound on → music resumes ✅
- Repeated toggle cycles work ✅
- Scene transitions preserve state ✅
- Replay works correctly ✅

---

## Risk Assessment

**Low** - All changes tested end-to-end in isolated test environment with successful manual verification

**Rollback**: Standard git revert + drop custom_music_url column if needed
