# Legacy Frontend Field Audit
# video_url and multiple_photos Investigation

**Date:** 2026-08-16
**Status:** AUDIT COMPLETE — Recommendations provided

---

## Executive Summary

**Findings:**
- ✅ `photo_url` — Real legacy field, preserved for backwards compatibility
- ❌ `video_url` — **NEVER existed in production schema**
- ❌ `multiple_photos` — **NEVER existed in production schema**

**Evidence:**
- Production queries (reveal/page.tsx, browse/page.tsx) do NOT select these fields
- Migration 010 added JSONB columns (photos, gifs, video) but never mentions video_url/multiple_photos
- Only used in demo pages with hardcoded fake data

**Recommendation:**
- Remove `video_url` and `multiple_photos` references from GalleryView transformation
- Keep backwards compatibility code ONLY for real legacy field: `photo_url`
- Preserve demo page usage (intentional fake data for demonstrations)

---

## Investigation Details

### 1. Actual Production Queries

#### reveal/page.tsx (Line 83)
```typescript
.select("id, contributor_name, message, created_at, photo_url, photos, gifs, video")
```

**Selected fields:**
- ✅ photo_url (real legacy field)
- ✅ photos (JSONB, Migration 010)
- ✅ gifs (JSONB, Migration 010)
- ✅ video (JSONB, Migration 010)

**NOT selected:**
- ❌ video_url
- ❌ multiple_photos

#### browse/page.tsx
Similar query pattern - no video_url or multiple_photos

**Conclusion:** These fields are not in the production database schema.

---

### 2. Migration History Analysis

**Migration 010** (Standard Multimedia):
- Added: `photos JSONB`
- Added: `gifs JSONB`
- Added: `video JSONB`
- Preserved: `photo_url TEXT` (real legacy field)

**Never added:**
- video_url (doesn't exist)
- multiple_photos (doesn't exist)

**Evidence:** Migration 010 backfills photo_url → photos JSONB, but makes no mention of video_url or multiple_photos

---

### 3. Frontend Usage Audit

#### A. Production Code (Actual User Data)

**File:** `/src/components/memory-experience/GalleryView.tsx` (Lines 38-65)

**Current code:**
```typescript
const memories = useMemo<Memory[]>(() => {
  return rawMemories.map((mem: any) => {
    // Validate and clean legacy media URLs
    const hasValidPhotoUrl = mem.photo_url && mem.photo_url.trim().length > 0;
    const hasValidVideoUrl = mem.video_url && mem.video_url.trim().length > 0; // ❌ NEVER EXISTS
    const hasMultiplePhotos = mem.multiple_photos && Array.isArray(mem.multiple_photos) && mem.multiple_photos.length > 0; // ❌ NEVER EXISTS

    // JSONB multimedia support
    const hasPhotos = mem.photos && Array.isArray(mem.photos) && mem.photos.length > 0;
    const hasGifs = mem.gifs && Array.isArray(mem.gifs) && mem.gifs.length > 0;
    const hasVideo = mem.video && mem.video.url;

    // Determine media type (JSONB first, legacy fallback)
    let mediaType: 'photo' | 'video' | 'text' = 'text';
    if (hasVideo || hasValidVideoUrl) { // ❌ hasValidVideoUrl will ALWAYS be false
      mediaType = 'video';
    } else if (hasPhotos || hasGifs || hasValidPhotoUrl || hasMultiplePhotos) { // ❌ hasMultiplePhotos will ALWAYS be false
      mediaType = 'photo';
    }

    return {
      id: mem.id,
      contributorName: mem.contributor_name,
      message: mem.message,
      // Legacy fields (backwards compatibility)
      photoUrl: hasValidPhotoUrl ? mem.photo_url! : undefined,
      videoUrl: hasValidVideoUrl ? mem.video_url! : undefined, // ❌ ALWAYS undefined
      multiplePhotos: hasMultiplePhotos ? mem.multiple_photos : undefined, // ❌ ALWAYS undefined
      // Standard multimedia (JSONB)
      photos: mem.photos || undefined,
      gifs: mem.gifs || undefined,
      video: mem.video || undefined,
      // Metadata
      mediaType,
      createdAt: new Date(mem.created_at),
    };
  });
}, [rawMemories]);
```

**Analysis:**
- `hasValidVideoUrl` will ALWAYS be false (field doesn't exist in query)
- `hasMultiplePhotos` will ALWAYS be false (field doesn't exist in query)
- Dead code - no functional impact but adds confusion

**File:** `/src/components/memory-experience/MemoryCard.tsx` (Line 36-42)

**Current code:**
```typescript
const { contributorName, message, photoUrl, videoUrl, mediaType, multiplePhotos, photos, gifs, video } = memory;

// Backwards compatibility: Normalize legacy and JSONB data
const normalizedPhotos = photos || (multiplePhotos && multiplePhotos.length > 0 ? multiplePhotos.map(url => ({ url, uploaded_at: '', file_size_bytes: 0 })) : (photoUrl && !photoUrl.endsWith('.gif') ? [{ url: photoUrl, uploaded_at: '', file_size_bytes: 0 }] : []));
```

**Analysis:**
- `multiplePhotos` check will ALWAYS fail (always undefined from GalleryView)
- Dead code - falls through to photoUrl (which is correct)

---

#### B. Demo Pages (Hardcoded Fake Data)

**Files:**
- `/src/app/demo/StandardExperienceSection.tsx`
- `/src/app/demo/PremiumExperienceSection.tsx`
- `/src/app/demo/GalleryShowcaseSection.tsx`

**Usage:**
```typescript
const memories = [
  {
    video_url: null, // Fake data for demo
    multiple_photos: ['url1', 'url2'], // Fake data for demo
    // ...
  }
];
```

**Analysis:**
- Demo pages use hardcoded fake memory data
- Intentional - not connected to real database
- **Should be preserved** (demos need flexible fake data)

---

### 4. Backwards Compatibility Analysis

**Real legacy field:** `photo_url`
- ✅ Exists in database
- ✅ Preserved in Migration 010
- ✅ Correctly handled in GalleryView/MemoryCard

**Fake legacy fields:** `video_url`, `multiple_photos`
- ❌ Never existed in production schema
- ❌ Always undefined from queries
- ❌ Dead code in production components

**Historical Theory:**
These fields were likely aspirational/prototype code that was never implemented in the actual schema.

---

## Recommendations

### A. Remove Dead Code from Production Components

**File:** `/src/components/memory-experience/GalleryView.tsx`

**Remove:**
```typescript
const hasValidVideoUrl = mem.video_url && mem.video_url.trim().length > 0;
const hasMultiplePhotos = mem.multiple_photos && Array.isArray(mem.multiple_photos) && mem.multiple_photos.length > 0;
```

**Remove from mediaType logic:**
```typescript
if (hasVideo || hasValidVideoUrl) { // Remove hasValidVideoUrl
if (hasPhotos || hasGifs || hasValidPhotoUrl || hasMultiplePhotos) { // Remove hasMultiplePhotos
```

**Remove from return:**
```typescript
videoUrl: hasValidVideoUrl ? mem.video_url! : undefined, // Remove entirely
multiplePhotos: hasMultiplePhotos ? mem.multiple_photos : undefined, // Remove entirely
```

---

**File:** `/src/components/memory-experience/types.ts`

**Memory interface - Remove:**
```typescript
videoUrl?: string; // Remove (never had data)
multiplePhotos?: string[]; // Remove (never had data)
```

**Keep:**
```typescript
photoUrl?: string; // KEEP (real legacy field)
```

---

**File:** `/src/components/memory-experience/MemoryCard.tsx`

**Remove destructuring:**
```typescript
const { contributorName, message, photoUrl, videoUrl, mediaType, multiplePhotos, photos, gifs, video } = memory;
// Remove: videoUrl, multiplePhotos
```

**Simplify normalization:**
```typescript
// OLD (with dead code)
const normalizedPhotos = photos || (multiplePhotos && multiplePhotos.length > 0 ? multiplePhotos.map(...) : (photoUrl && !photoUrl.endsWith('.gif') ? [...] : []));

// NEW (clean)
const normalizedPhotos = photos || (photoUrl && !photoUrl.endsWith('.gif') ? [{ url: photoUrl, uploaded_at: '', file_size_bytes: 0 }] : []);
```

---

### B. Preserve Demo Page Usage

**NO CHANGES to demo pages:**
- StandardExperienceSection.tsx
- PremiumExperienceSection.tsx
- GalleryShowcaseSection.tsx

**Rationale:** Demos use hardcoded fake data intentionally. Flexibility is valuable for demonstrations.

---

### C. Update RevealExperience.tsx

**File:** `/src/app/m/[shareCode]/reveal/RevealExperience.tsx`

**Current Memory interface (lines 12-22):**
```typescript
interface Memory {
  id: string;
  contributor_name: string;
  message: string;
  // Legacy field (backwards compatibility)
  photo_url: string | null; // ✅ KEEP
  // Standard multimedia (JSONB)
  photos?: MediaItem[];
  gifs?: MediaItem[];
  video?: VideoMedia | null;
}
```

**Analysis:** ✅ Already correct - no video_url or multiple_photos

---

## Impact Assessment

**Risk of removal:** ⬇️ LOW
- These fields never had production data
- Always undefined in actual usage
- No functional behavior change (dead code removal)

**Benefits:**
- ✅ Cleaner codebase
- ✅ Less confusion for future developers
- ✅ Accurate backwards compatibility documentation
- ✅ Smaller bundle size (marginal)

**Testing required:**
- ⏳ Verify legacy photo_url contributions still display correctly (real backwards compat)
- ⏳ Verify new JSONB contributions display correctly
- ⏳ Verify demo pages still work (hardcoded fake data)

---

## Conclusion

**video_url** and **multiple_photos** are dead code remnants from prototype/aspirational features that were never implemented in the production schema.

**Action:** Remove from production components, preserve photo_url (real legacy field).

**Safe to remove:** Yes - these fields never contained user data.

---

## Implementation Checklist

- [ ] Remove dead code from GalleryView.tsx
- [ ] Update Memory type in types.ts (remove videoUrl, multiplePhotos)
- [ ] Simplify MemoryCard.tsx normalization
- [ ] Test legacy photo_url contributions still display
- [ ] Test new JSONB contributions display correctly
- [ ] Verify demo pages unaffected
- [ ] Update backwards compatibility documentation

---

**Audit Complete:** 2026-08-16
**Auditor:** Coder Agent (Increment 1)
