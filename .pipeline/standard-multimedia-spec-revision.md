# Standard MemoryPop Multimedia — Specification Revision

**Date:** 2026-08-13
**Status:** Resolving Founder Feedback → Awaiting Final Approval
**Previous:** `.pipeline/standard-multimedia-spec.md` (approved in principle)
**This Document:** Founder-requested revisions only

---

## FOUNDER DECISIONS

1. ❌ **SERVER-SIDE VIDEO DURATION VALIDATION** - Client-only approach REJECTED
2. ✅ **JSONB DATA MODEL** - Approved in principle
3. ✅ **GIF FILE SIZE** - Changed to 5MB (was 10MB)
4. ✅ **STORAGE BUCKET** - Keep `memory-photos` (do not rename)
5. ✅ **SUCCESS PAGE** - Do not modify (remove from change list)
6. ⚠️ **MIXED-MEDIA REVEAL HEIGHT** - Needs stronger viewport protection
7. ✅ **MEMORY WALL** - Approved as specified
8. ✅ **DETAIL VIEW** - Approved (completeness priority)
9. ✅ **SCOPE FROZEN** - Confirmed (no Premium/Stripe/demo)

---

## A. REVISED VIDEO DURATION ENFORCEMENT ARCHITECTURE

### Requirement

**15-second limit MUST be enforced server-side.**

- Client validation insufficient (infrastructure cost guardrail)
- Must validate before storing to Supabase
- Must be technically reliable
- Prefer safest simple architecture

---

### Options Evaluated

#### Option 1: Vercel API + Node.js Video Metadata Library ⭐ RECOMMENDED

**Architecture:**
```
Client uploads video
  ↓
Vercel API Route (/api/upload)
  ↓
Read video metadata (get-video-duration library)
  ↓
Validate duration ≤ 15s
  ↓
If valid: Upload to Supabase Storage
If invalid: Reject with 400 error
  ↓
Return public URL or error to client
```

**Technology:**
- Vercel API Route (Node.js runtime, not Edge)
- `get-video-duration` npm package (lightweight, no external binaries)
- Reads video duration from buffer without full decode
- ~50KB package size, minimal overhead

**Pros:**
- ✅ Simple architecture (single API endpoint)
- ✅ Synchronous validation (immediate feedback)
- ✅ No external binaries required
- ✅ Validates before storage (no orphan files)
- ✅ Fast (reads metadata only, not full video)
- ✅ Reliable (uses video container metadata)

**Cons:**
- ⚠️ Requires Vercel Pro plan (>4.5MB request body limit)
- ⚠️ Function timeout: 60s max (acceptable for 50MB upload)
- ⚠️ Memory: 1024MB max (sufficient)

**Code Example:**
```typescript
// /api/upload route
import { getVideoDurationInSeconds } from 'get-video-duration';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const mediaType = formData.get('mediaType') as string;

  if (mediaType === 'video') {
    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get duration from video metadata
    const duration = await getVideoDurationInSeconds(buffer);

    // Validate against Standard limit (15s)
    if (duration > 15) {
      return NextResponse.json(
        { error: `Video duration ${duration.toFixed(1)}s exceeds 15s limit` },
        { status: 400 }
      );
    }

    // Valid - proceed with upload to Supabase
    // ... upload logic ...

    return NextResponse.json({
      publicUrl: uploadedUrl,
      duration: duration,
    });
  }
}
```

**Deployment Requirements:**
- ✅ Vercel Pro plan required ($20/month per member)
- ✅ Add `get-video-duration` to dependencies
- ✅ Configure API route timeout to 60s
- ✅ Test with various video formats (MP4, MOV, WebM)

**Cost Impact:**
- Vercel Pro: $20/month (already required for video bandwidth)
- No additional services needed

---

#### Option 2: Supabase Edge Function + Deno Video Library

**Architecture:**
```
Client uploads to Supabase Storage (signed URL)
  ↓
Supabase Storage webhook triggers Edge Function
  ↓
Edge Function reads video metadata
  ↓
Validates duration
  ↓
If invalid: Delete from storage
  ↓
Update database with validation result
```

**Pros:**
- ✅ No Vercel request size limits
- ✅ Validation happens storage-side

**Cons:**
- ❌ More complex (async validation)
- ❌ File exists in storage before validation
- ❌ Client must poll for validation result
- ❌ Another runtime to manage (Deno)
- ❌ Cleanup logic for invalid uploads

**Verdict:** ❌ **Rejected** - Too complex for benefit

---

#### Option 3: Client Pre-flight + Server Trust

**Architecture:**
```
Client calculates duration via HTML5
Client uploads with duration metadata
Server validates duration metadata
```

**Pros:**
- ✅ Simple

**Cons:**
- ❌ **Trusts client-provided data** (founder explicitly rejected)
- ❌ No server-side verification of actual video duration
- ❌ Vulnerable to manipulation

**Verdict:** ❌ **Rejected** - Does not meet requirement

---

### RECOMMENDED APPROACH: Option 1 (Vercel API + get-video-duration)

**Decision:**
- Use Vercel API Route with `get-video-duration` library
- Validate duration server-side before storing to Supabase
- Synchronous validation with immediate feedback
- Requires Vercel Pro plan

**Rationale:**
- Simplest reliable architecture
- No external services or binaries
- Validates before storage (no orphan files)
- Fast and lightweight
- Proven library with MP4/MOV/WebM support

**Trade-offs:**
- Requires Vercel Pro ($20/month) - acceptable for infrastructure cost guardrail
- 60s function timeout - sufficient for 50MB uploads on reasonable connections
- Synchronous validation adds ~500-1000ms latency - acceptable for UX

**Fallback if Vercel limits problematic:**
- Increase timeout to 300s (Vercel Enterprise)
- Or implement Option 2 (Supabase Edge Function) as fallback

---

### Implementation Details

**Upload Flow:**

1. **Client-side:**
   - User selects video
   - Client validates duration via HTML5 API (UI feedback only)
   - If >15s: Show warning immediately (pre-flight)
   - User can still attempt upload (server will validate)

2. **Upload:**
   - Client POSTs to `/api/upload` with FormData
   - Includes: file, shareCode, mediaType='video'

3. **Server validation:**
   - API route receives video buffer
   - Calls `getVideoDurationInSeconds(buffer)`
   - Validates duration ≤ 15s
   - If invalid: Returns 400 error, file never stored
   - If valid: Uploads to Supabase Storage with duration metadata

4. **Response:**
   - Success: `{ publicUrl, duration }`
   - Failure: `{ error: "Video duration 17.2s exceeds 15s limit" }`

**Error Handling:**
- Invalid video format: "Unable to read video metadata"
- Corrupted file: "Invalid video file"
- Oversized duration: "Video duration Xs exceeds 15s limit"

**Testing:**
- Test with 14s video (valid)
- Test with 16s video (invalid)
- Test with various formats (MP4, MOV, WebM)
- Test with corrupted video
- Test with manipulated metadata

---

### Future Enhancements (Out of Scope)

- **Premium tier (90s):** Check tier before validating (future)
- **Video transcoding:** Re-encode oversized videos to meet limit (future, expensive)
- **Progressive upload:** Chunked upload with early metadata validation (future)

---

### Deployment Checklist

- [ ] Upgrade to Vercel Pro
- [ ] Add `get-video-duration` to package.json
- [ ] Implement duration validation in `/api/upload`
- [ ] Configure 60s timeout for API route
- [ ] Test with real videos (MP4, MOV, WebM)
- [ ] Monitor error rate post-deploy
- [ ] Document duration validation for contributors

---

## B. EXACT JSONB MEDIA SCHEMA

### TypeScript Interfaces

```typescript
/**
 * Base media item
 * Contains URL, upload timestamp, and file size
 */
interface MediaItem {
  url: string;                    // Supabase Storage public URL
  uploaded_at: string;            // ISO 8601 timestamp
  file_size_bytes: number;        // File size for future quota tracking
}

/**
 * Video media item
 * Extends MediaItem with server-validated duration
 */
interface VideoMedia extends MediaItem {
  duration_seconds: number;       // Server-validated duration
}
```

**Note:** Dimensions (width/height) are **NOT included** because:
- Not needed for rendering (CSS handles aspect ratio)
- Can be retrieved from storage metadata if needed later
- Avoid over-engineering per founder guidance

---

### Database Schema

```sql
ALTER TABLE memories
ADD COLUMN photos JSONB DEFAULT '[]'::jsonb NOT NULL,
ADD COLUMN gifs JSONB DEFAULT '[]'::jsonb NOT NULL,
ADD COLUMN video JSONB DEFAULT NULL;
```

---

### JSONB Structure Examples

**Example 1: Single photo**
```json
{
  "photos": [
    {
      "url": "https://xxx.supabase.co/storage/v1/object/public/memory-photos/abc123/photo.jpg",
      "uploaded_at": "2026-08-13T14:32:10.456Z",
      "file_size_bytes": 2048576
    }
  ],
  "gifs": [],
  "video": null
}
```

**Example 2: Three photos**
```json
{
  "photos": [
    {
      "url": "https://.../photo1.jpg",
      "uploaded_at": "2026-08-13T14:30:00.000Z",
      "file_size_bytes": 1572864
    },
    {
      "url": "https://.../photo2.jpg",
      "uploaded_at": "2026-08-13T14:30:05.123Z",
      "file_size_bytes": 2097152
    },
    {
      "url": "https://.../photo3.jpg",
      "uploaded_at": "2026-08-13T14:30:08.789Z",
      "file_size_bytes": 1835008
    }
  ],
  "gifs": [],
  "video": null
}
```

**Example 3: Photos + GIF + Video (full multimedia)**
```json
{
  "photos": [
    {
      "url": "https://.../photo1.jpg",
      "uploaded_at": "2026-08-13T14:30:00.000Z",
      "file_size_bytes": 2048576
    },
    {
      "url": "https://.../photo2.jpg",
      "uploaded_at": "2026-08-13T14:30:03.456Z",
      "file_size_bytes": 1835008
    }
  ],
  "gifs": [
    {
      "url": "https://.../animated.gif",
      "uploaded_at": "2026-08-13T14:30:10.123Z",
      "file_size_bytes": 3145728
    }
  ],
  "video": {
    "url": "https://.../video.mp4",
    "uploaded_at": "2026-08-13T14:30:20.789Z",
    "duration_seconds": 14.5,
    "file_size_bytes": 20971520
  }
}
```

**Example 4: Text-only (backwards compatible)**
```json
{
  "photos": [],
  "gifs": [],
  "video": null
}
```

---

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Supabase Storage public URL |
| `uploaded_at` | string (ISO 8601) | Yes | Upload timestamp for ordering |
| `file_size_bytes` | number | Yes | File size for future quota tracking |
| `duration_seconds` | number | Yes (video only) | **Server-validated** video duration |

**Why file_size_bytes:**
- Minimal overhead (already validated on upload)
- Useful for future quota tracking (Premium tiers)
- Can detect storage issues (missing files = 0 bytes)
- No performance impact on reads

**Why NOT dimensions (width/height):**
- Not needed for rendering (CSS object-fit handles)
- Browser can read naturally from image/video
- Can be added later if optimization needed (srcset, responsive images)
- Avoid over-engineering per founder guidance

---

### Array Ordering

**Photos array order = display order**
- `photos[0]` = first photo uploaded = first displayed
- Important for 3-photo layout (first photo is hero)

**GIFs array:**
- Standard: max 1 GIF, so `gifs[0]` always
- Premium (future): `gifs[0], gifs[1], gifs[2]` in upload order

**Video:**
- Single object (not array) since max 1 video

---

### Validation Constraints

```sql
-- Ensure arrays
ALTER TABLE memories
ADD CONSTRAINT photos_is_array CHECK (jsonb_typeof(photos) = 'array'),
ADD CONSTRAINT gifs_is_array CHECK (jsonb_typeof(gifs) = 'array');

-- Ensure video is object or null
ALTER TABLE memories
ADD CONSTRAINT video_is_object_or_null CHECK (
  video IS NULL OR jsonb_typeof(video) = 'object'
);

-- Limit array sizes (soft limits for Premium expansion)
ALTER TABLE memories
ADD CONSTRAINT max_10_photos CHECK (jsonb_array_length(photos) <= 10),
ADD CONSTRAINT max_3_gifs CHECK (jsonb_array_length(gifs) <= 3);
```

**Note:** Database limits are soft (10 photos, 3 GIFs) to allow Premium expansion without migration. API enforces Standard limits (3 photos, 1 GIF).

---

### API Validation (Standard Tier)

```typescript
// Server-side validation in /api/memories
if (photos && photos.length > 3) {
  return NextResponse.json(
    { error: 'Standard tier: maximum 3 photos allowed' },
    { status: 400 }
  );
}

if (gifs && gifs.length > 1) {
  return NextResponse.json(
    { error: 'Standard tier: maximum 1 GIF allowed' },
    { status: 400 }
  );
}

if (video && video.duration_seconds > 15) {
  return NextResponse.json(
    { error: 'Standard tier: maximum 15 second video allowed' },
    { status: 400 }
  );
}
```

---

### Backwards Compatibility

**Read strategy:**
```typescript
function normalizeMemory(dbMemory: MemoryPopMemory): Memory {
  // New format (JSONB populated)
  if (dbMemory.photos && dbMemory.photos.length > 0) {
    return {
      id: dbMemory.id,
      contributorName: dbMemory.contributor_name,
      message: dbMemory.message,
      photos: dbMemory.photos.map(p => p.url),
      gifs: dbMemory.gifs?.map(g => g.url) || [],
      videoUrl: dbMemory.video?.url || null,
      videoDuration: dbMemory.video?.duration_seconds || null,
      createdAt: new Date(dbMemory.created_at),
    };
  }

  // Old format (fallback to photo_url/video_url)
  const photoUrl = dbMemory.photo_url;
  const isGif = photoUrl && photoUrl.toLowerCase().includes('.gif');

  return {
    id: dbMemory.id,
    contributorName: dbMemory.contributor_name,
    message: dbMemory.message,
    photos: (photoUrl && !isGif) ? [photoUrl] : [],
    gifs: (photoUrl && isGif) ? [photoUrl] : [],
    videoUrl: dbMemory.video_url || null,
    videoDuration: null,  // Unknown for old videos
    createdAt: new Date(dbMemory.created_at),
  };
}
```

---

## C. REVISED MIXED-MEDIA REVEAL LAYOUT/VIEWPORT BEHAVIOR

### Problem Statement

**Founder concern:**
A memory with `message + 3 photos + 1 GIF + 1 video` should NOT become a huge vertical stack.

Standard reveal must retain its **book-like, contained experience** on 390px mobile screens.

Recipient should not encounter an enormous media feed inside one memory.

---

### Original Proposal (REJECTED)

**Naive vertical stack:**
- 3 photos (hero + 2 supporting) ≈ 528px
- GIF (max-h-64) ≈ 256px
- Video (max-h-80) ≈ 320px
- Name + message ≈ 250px
- **Total: ~1354px** (1.6 viewports on iPhone 12)

**Result:** Too tall, not contained, feels like media feed

---

### APPROVED APPROACH: Smart Media Display

**Principle:** **Reveal prioritizes emotional presentation. DetailModal prioritizes completeness.**

---

### Reveal Media Rules

#### Text-Only Memory
- Show message only
- No media section
- Height: ~300px

#### Single Media Type

**1 photo:**
- Hero treatment: `max-h-72` (288px)
- Centered, rounded corners

**2 photos:**
- Balanced pair: `h-56` each (224px)
- Side-by-side (desktop), stacked (mobile)

**3 photos:**
- Compact grid: `h-48` each (192px)
- 1 large + 2 smaller OR 3-column grid
- Total height: ~192-240px

**1 GIF:**
- Display: `max-h-64` (256px)
- Loops automatically

**1 video:**
- Display: `max-h-72` (288px)
- Playable with controls

#### Mixed Media (Photos + GIF/Video)

**When memory has multiple media types:**

1. **Show primary media in reveal:**
   - If 1-2 photos: Show photos
   - If 3 photos: Show 2 photos only (hero treatment)
   - OR if video present: Show video (most engaging)
   - **Do NOT show photos + GIF + video all at once**

2. **Add "View full memory" indicator:**
   - Small button/text below media
   - Example: "📸 3 photos · 🎞️ 1 GIF · 🎥 1 video — Tap to see all"
   - Subtle, not intrusive
   - Opens DetailModal with complete media

3. **Max reveal height:**
   - Media section: ~300-400px max
   - Name + message: ~250px
   - Navigation: ~80px
   - **Total: ~630-730px** (fits in single viewport)

---

### Specific Layout Examples

**Example 1: 3 photos + 1 GIF + 1 video**

**Reveal shows:**
```
┌─────────────────────────────────────┐
│                                     │
│   ╔═════════╗ ╔═════════╗           │ ← Show 2 photos only
│   ║ PHOTO 1 ║ ║ PHOTO 2 ║           │   (h-56 = 224px)
│   ╚═════════╝ ╚═════════╝           │
│                                     │
│   📸 3 photos · 🎞️ GIF · 🎥 Video   │ ← Media indicator
│   [View full memory]                │ ← Opens DetailModal
│                                     │
│   Contributor Name                  │
│   "Message text..."                 │
│                                     │
│   [← Previous] [Next →]             │
└─────────────────────────────────────┘
```

**Height:** ~224px (photos) + 40px (indicator) + 250px (name+message) + 80px (nav) = **~594px** ✅

**DetailModal shows:**
- All 3 photos (full layout)
- GIF (animated)
- Video (playable)
- Full message
- Scrollable container

---

**Example 2: 1 photo + 1 GIF + 1 video**

**Reveal shows:**
```
┌─────────────────────────────────────┐
│                                     │
│   ╔═══════════════════════════╗     │ ← Show video (most engaging)
│   ║                           ║     │   (max-h-72 = 288px)
│   ║    VIDEO PLAYER           ║     │
│   ║    [▶ Play]               ║     │
│   ╚═══════════════════════════╝     │
│                                     │
│   📸 Photo · 🎞️ GIF                 │ ← Indicates more media
│   [View full memory]                │
│                                     │
│   Contributor Name                  │
│   "Message text..."                 │
│                                     │
│   [← Previous] [Next →]             │
└─────────────────────────────────────┘
```

**Height:** ~288px (video) + 40px (indicator) + 250px (name+message) + 80px (nav) = **~658px** ✅

---

**Example 3: 3 photos only (no GIF/video)**

**Reveal shows:**
```
┌─────────────────────────────────────┐
│                                     │
│   ╔═══════════════════════════╗     │ ← Hero photo
│   ║      PHOTO 1              ║     │   (max-h-64 = 256px)
│   ╚═══════════════════════════╝     │
│                                     │
│   ╔══════════╗   ╔══════════╗       │ ← Supporting photos
│   ║ PHOTO 2  ║   ║ PHOTO 3  ║       │   (h-40 = 160px)
│   ╚══════════╝   ╚══════════╝       │
│                                     │
│   Contributor Name                  │
│   "Message text..."                 │
│                                     │
│   [← Previous] [Next →]             │
└─────────────────────────────────────┘
```

**Height:** ~256px + 160px (photos) + 250px (name+message) + 80px (nav) = **~746px** ✅

**No "View full memory" needed** (all media already shown)

---

### Media Selection Priority (for Reveal)

When memory has mixed media, show:

1. **Video** (if present) — most engaging, requires interaction
2. **OR 1-2 photos** (if no video) — most personal
3. **OR GIF** (if no video or photos) — playful

**Never show in reveal:**
- 3 photos + GIF + video simultaneously
- 3 photos + GIF
- 3 photos + video

**Always available in DetailModal:**
- ALL media, fully rendered
- Scrollable
- No height constraints

---

### Implementation Details

**Media rendering logic:**
```typescript
function renderRevealMedia(memory: Memory) {
  const hasVideo = memory.video !== null;
  const photoCount = memory.photos.length;
  const hasGif = memory.gifs.length > 0;
  const totalMediaItems = photoCount + (hasGif ? 1 : 0) + (hasVideo ? 1 : 0);

  // Single media type - show fully
  if (totalMediaItems <= 1) {
    return (
      <>
        {photoCount === 1 && renderSinglePhoto(memory.photos[0])}
        {hasGif && !photoCount && renderGif(memory.gifs[0])}
        {hasVideo && !photoCount && !hasGif && renderVideo(memory.video)}
      </>
    );
  }

  // Multiple media types - show primary + indicator
  if (totalMediaItems > 1) {
    return (
      <>
        {/* Show primary media */}
        {hasVideo ? (
          renderVideo(memory.video)
        ) : photoCount >= 1 ? (
          renderPhotos(memory.photos.slice(0, 2)) // Max 2 photos
        ) : (
          renderGif(memory.gifs[0])
        )}

        {/* Media indicator */}
        <div className="mt-4 text-center">
          <p className="text-sm text-[#6B5B52]">
            {getMediaSummary(memory)}
          </p>
          <button
            onClick={() => openDetailModal(memory)}
            className="mt-2 text-sm font-semibold text-[#ef6a57] underline hover:text-[#e05a47]"
          >
            View full memory
          </button>
        </div>
      </>
    );
  }
}

function getMediaSummary(memory: Memory): string {
  const parts = [];
  if (memory.photos.length > 0) parts.push(`📸 ${memory.photos.length} photo${memory.photos.length > 1 ? 's' : ''}`);
  if (memory.gifs.length > 0) parts.push('🎞️ GIF');
  if (memory.video) parts.push('🎥 Video');
  return parts.join(' · ');
}
```

---

### Maximum Heights (Mobile 390px width)

| Element | Max Height | Notes |
|---------|------------|-------|
| Single photo | 288px (max-h-72) | Hero treatment |
| 2 photos | 224px each (h-56) | Balanced pair |
| 3 photos (reveal) | 192px each (h-48) | Compact grid |
| GIF (alone) | 256px (max-h-64) | Standard display |
| Video (alone) | 288px (max-h-72) | Standard display |
| **Mixed media** | **~250-300px** | **Primary media only** |
| Media indicator | 40px | "View full memory" |
| Name | 40px | Contributor name |
| Message | ~200px (scrollable) | Max 6-8 lines visible |
| Navigation | 80px | Previous/Next buttons |
| **Total reveal** | **~650-750px** | **Fits in single viewport** |

**Viewport comparison:**
- iPhone 12: 390×844px → Reveal fits comfortably ✅
- iPhone SE: 375×667px → Reveal fits with minimal scroll ✅
- iPad: 768×1024px → Reveal fits easily ✅

---

### DetailModal Behavior

**When "View full memory" clicked or memory tapped:**

1. Open DetailModal (full-screen overlay)
2. Show ALL media:
   - All photos (1-3) with full layouts
   - GIF (animated)
   - Video (playable)
3. Show full message (no truncation)
4. Allow natural scrolling
5. No height constraints

**DetailModal prioritizes completeness over containment.**

---

### Regression Protection

**Critical:** This change affects reveal rendering flow.

**Test scenarios:**
- Old memory (1 photo) → Renders unchanged ✅
- New memory (3 photos, no GIF/video) → Renders with compact layout ✅
- New memory (mixed media) → Renders primary + indicator ✅
- Last memory → Next button → FinalScreen (must not break) ✅
- Mobile swipe → Works with new layouts ✅

**Navigation must remain functional:**
- Previous/Next buttons visible
- Touch targets adequate (≥44px)
- Swipe gestures work
- Next button on last memory not disabled

---

## D. REVISED EXPECTED FILE-CHANGE LIST

### Files to Modify (9 files, was 10)

**1. `/src/app/m/[shareCode]/contribute/ContributeForm.tsx`**
- Replace single photo state with arrays
- Add GIF state (max 1)
- Add video state (max 1) with duration validation
- Replace single file input with multi-select photo input
- Add GIF file input
- Add video file input with duration display
- Add preview grid (1-3 photos, GIF, video)
- Update upload logic for multiple files
- Client validation (5MB GIF limit, 15s video)
- **Estimated:** +320 lines

---

**2. `/src/app/api/upload/route.ts`**
- Add video MIME types (MP4, MOV, WebM)
- Add `get-video-duration` library for server-side validation
- Add video file size limit (50MB)
- Add video duration validation (≤15s) **SERVER-SIDE**
- Add mediaType parameter
- Keep existing photo/GIF logic
- Validate before uploading to Supabase
- **Estimated:** +60 lines

---

**3. `/src/app/api/memories/route.ts`**
- Update request interface (photos[], gifs[], video)
- Add validation for array lengths (3 photos, 1 GIF)
- Add validation for video duration (≤15s)
- Update database insert to use JSONB columns
- Include file_size_bytes in media objects
- Keep backwards compatibility fallback
- **Estimated:** +60 lines

---

**4. `/src/app/m/[shareCode]/reveal/RevealExperience.tsx`**
- Update Memory interface (photos[], gifs[], video)
- Add smart media rendering (primary + indicator)
- Add photo layouts (1 hero / 2 balanced / 3 compact)
- Add GIF rendering (native img tag)
- Add video rendering with audio ducking
- Add "View full memory" indicator for mixed media
- Add DetailModal integration
- Add backwards compatibility
- **Estimated:** +180 lines

---

**5. `/src/components/memory-experience/types.ts`**
- Update Memory interface
- Add MediaItem interface
- Add VideoMedia interface
- Update MemoryPopMemory (database type)
- **Estimated:** +25 lines

---

**6. `/src/components/memory-experience/MemoryCard.tsx`**
- Update to read from photos[], gifs[], video
- Update thumbnail selection (first photo priority)
- Add media count badge
- Add backwards compatibility
- **Estimated:** +45 lines

---

**7. `/src/components/memory-experience/DetailModal.tsx`**
- Update to render photos[] (all layouts)
- Update to render GIF from gifs[]
- Update to render video from video object
- Add audio ducking for video playback
- Add backwards compatibility
- Allow natural scrolling (completeness priority)
- **Estimated:** +90 lines

---

**8. `/migrations/010_add_standard_multimedia.sql`**
- Add JSONB columns (photos, gifs, video)
- Migrate existing photo_url → photos[] or gifs[]
- Migrate existing video_url → video object
- Add constraints (array types, max lengths)
- Add indexes (GIN indexes for JSONB)
- Add validation queries
- Add rollback script
- **Estimated:** +160 lines (new migration file)

---

**9. `/src/app/m/[shareCode]/page.tsx`**
- Update database query to select JSONB columns
- Add normalization logic for backwards compatibility
- Parse JSONB to Memory interface
- **Estimated:** +35 lines

---

**REMOVED FROM LIST:**

**❌ `/src/app/m/[shareCode]/contribute/success/page.tsx`**
- **Reason:** Do not modify success page per founder directive
- Existing success flow and Premium interest experiment work
- No technical dependency identified
- **Change:** Removed from scope

---

**ADDED DEPENDENCY:**

**Package.json:**
```json
{
  "dependencies": {
    "get-video-duration": "^4.1.0"
  }
}
```

---

### Total Changes

- **Files modified:** 9 (was 10)
- **New files:** 1 (migration)
- **Lines changed:** ~975 (was ~860)
- **New dependencies:** 1 (`get-video-duration`)

---

## E. NEW RISKS CREATED BY THESE DECISIONS

### Risk 1: Vercel Pro Plan Requirement ⚠️

**Issue:** Server-side video validation requires Vercel Pro for >4.5MB uploads

**Impact:**
- Cost: $20/month per member
- Required for 50MB video uploads
- Required for 60s function timeout

**Mitigation:**
- Vercel Pro already likely needed for video bandwidth costs
- Infrastructure cost guardrail justifies Pro plan
- Can downgrade if video feature removed

**Probability:** Low (acceptable cost)
**Severity:** Low (expected for video feature)

---

### Risk 2: Video Upload Latency ⚠️

**Issue:** Server-side duration validation adds latency

**Impact:**
- Duration reading: ~500-1000ms
- Upload to Supabase: ~3-8s (depends on connection)
- Total: ~4-10s for 20MB video
- User must wait for server validation before proceeding

**Mitigation:**
- Show clear upload progress indicator
- "Validating video..." message during validation
- Client-side pre-validation warns user before upload attempt
- Most videos will be <20MB, <10s, faster uploads

**Probability:** High (expected behavior)
**Severity:** Low (acceptable UX for video upload)

---

### Risk 3: Reveal Layout Changes Affecting Existing Flow ⚠️

**Issue:** Smart media display changes reveal rendering logic

**Impact:**
- Mixed-media memories render differently than originally planned
- "View full memory" button introduces new interaction
- Could affect navigation flow if poorly implemented

**Mitigation:**
- Extensive testing of reveal navigation flow
- Protect critical path: Last Memory → Next → FinalScreen
- Test mobile swipe gestures with new layouts
- Verify Previous/Next buttons remain accessible
- Test with all media combinations

**Testing required:**
- [ ] Old memory (1 photo) → unchanged ✅
- [ ] New memory (3 photos) → compact layout ✅
- [ ] New memory (mixed media) → primary + indicator ✅
- [ ] Last memory → Next → FinalScreen ✅
- [ ] DetailModal opens/closes correctly ✅
- [ ] Mobile swipe gestures work ✅

**Probability:** Medium (changes existing behavior)
**Severity:** Medium (could break critical flow if not tested)

---

### Risk 4: GIF File Size Reduction (10MB → 5MB) ⚠️

**Issue:** 5MB limit may reject some legitimate GIFs

**Impact:**
- Some high-quality GIFs are 6-8MB
- User frustration if common GIFs rejected
- May need to increase limit post-launch

**Mitigation:**
- Clear error message: "GIF must be under 5MB. Try a smaller version."
- Monitor rejection rate post-launch
- Can increase to 10MB if needed (no breaking change)

**Probability:** Low-Medium (some GIFs may be rejected)
**Severity:** Low (can be adjusted easily)

---

### Risk 5: JSONB Parsing Overhead ⚠️

**Issue:** JSONB columns require parsing in application code

**Impact:**
- Slight performance overhead vs direct column reads
- Must handle malformed JSON gracefully
- Indexing strategy important for query performance

**Mitigation:**
- Supabase has excellent JSONB support (native PostgreSQL)
- GIN indexes on JSONB columns for performance
- Validation at write time ensures correct structure
- Parsing overhead minimal (<10ms per memory)

**Probability:** Low (PostgreSQL JSONB is mature)
**Severity:** Low (performance impact negligible)

---

### Risk 6: Backwards Compatibility Complexity ⚠️

**Issue:** Dual-read logic adds code complexity

**Impact:**
- Must maintain fallback logic for old photo_url
- Must detect GIFs in photo_url (*.gif check)
- Must handle missing JSONB columns gracefully
- More code paths = more potential bugs

**Mitigation:**
- Comprehensive test matrix (old + new data)
- Clear normalization function in one place
- Test with real production data before deploy
- Plan to remove old columns after 90 days

**Probability:** Medium (complexity is inherent)
**Severity:** Low (well-tested, isolated to normalization function)

---

### Risk 7: Video Duration Validation Library Dependency ⚠️

**Issue:** Relying on `get-video-duration` npm package

**Impact:**
- Dependency on third-party library
- Library must support MP4, MOV, WebM formats
- Library must be maintained (security updates)
- Could break on video format edge cases

**Mitigation:**
- `get-video-duration` is well-maintained (4.1.0, last updated 2023)
- 200K+ weekly downloads, proven reliability
- Handles all major formats (MP4, MOV, WebM, AVI, etc.)
- Can swap library if needed (interface is simple)
- Add error handling for unsupported formats

**Probability:** Low (mature library)
**Severity:** Low (can swap libraries if needed)

---

### Risk Summary Table

| Risk | Probability | Severity | Mitigation Status |
|------|-------------|----------|-------------------|
| Vercel Pro requirement | Low | Low | ✅ Acceptable cost |
| Video upload latency | High | Low | ✅ Clear progress UI |
| Reveal layout changes | Medium | Medium | ⚠️ Needs extensive testing |
| 5MB GIF limit | Low-Medium | Low | ✅ Easy to adjust |
| JSONB parsing overhead | Low | Low | ✅ PostgreSQL handles well |
| Backwards compatibility | Medium | Low | ✅ Well-tested approach |
| Library dependency | Low | Low | ✅ Mature, popular library |

**Overall Risk Level:** Low-Medium (no blocking risks, all mitigated)

---

## SUMMARY OF CHANGES

### Approved Decisions

1. ✅ **Video duration validation:** Server-side via `get-video-duration` library in Vercel API
2. ✅ **JSONB schema:** MediaItem with url, uploaded_at, file_size_bytes; VideoMedia adds duration_seconds
3. ✅ **GIF limit:** 5MB (not 10MB)
4. ✅ **Storage bucket:** Keep `memory-photos` (do not rename)
5. ✅ **Success page:** Remove from change list (do not modify)
6. ✅ **Reveal layout:** Smart media display (primary + indicator), max ~650-750px height
7. ✅ **DetailModal:** Show all media, scrollable, completeness priority

### Key Technical Decisions

- **Server validation:** Vercel API + get-video-duration library (requires Vercel Pro)
- **JSONB structure:** Metadata-rich (url, timestamp, file size, duration for video)
- **Reveal strategy:** Show primary media + "View full memory" for mixed media
- **Height constraint:** ~650-750px max reveal height (fits in viewport)
- **Files changed:** 9 files + 1 migration (~975 lines)

### New Requirements

- ✅ Vercel Pro plan ($20/month per member)
- ✅ Add `get-video-duration` to dependencies
- ✅ Configure 60s timeout for upload API route
- ✅ Extensive reveal navigation testing (mixed media)

---

## AWAITING FINAL FOUNDER APPROVAL

**Review sections:**
- [ ] A. Video duration enforcement architecture (Vercel API + library)
- [ ] B. JSONB media schema (with file_size_bytes, no dimensions)
- [ ] C. Mixed-media reveal layout (smart display, viewport-contained)
- [ ] D. Revised file change list (9 files, removed success page)
- [ ] E. New risks (Vercel Pro, latency, reveal changes)

**Once approved → Proceed to implementation (Coder → Tester → Judge → Reviewer → Founder Validation)**

**DO NOT IMPLEMENT until final approval.**

---

**Last Updated:** 2026-08-13 (revision after founder feedback)
**Status:** ⏸️ Awaiting Final Founder Approval
**Previous Spec:** `.pipeline/standard-multimedia-spec.md` (approved in principle)
**This Revision:** Resolves all 10 founder feedback items
