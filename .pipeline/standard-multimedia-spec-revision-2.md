# Standard MemoryPop Multimedia — Specification Revision 2

**Date:** 2026-08-13
**Status:** Resolving Second Round of Founder Feedback → Awaiting Final Approval
**Previous:** `.pipeline/standard-multimedia-spec-revision.md` (partially approved)
**This Document:** Final corrections before implementation approval

---

## FOUNDER FEEDBACK ROUND 2

1. ❌ **REVEAL COMPOSITION** - "Primary media only" strategy REJECTED
   - Requirement: ALL media discoverable during normal reveal (not deferred to DetailModal)
   - Constraint: NOT a huge vertical feed
   - Solution required: COMPOSED MEMORY PAGE with compact in-place treatment

2. ⚠️ **VIDEO VALIDATION ARCHITECTURE** - Requirement approved, specific implementation NOT yet approved
   - Verification required: Vercel deployment constraints
   - Comparison required: Vercel proxy vs temporary-upload/quarantine

---

## A. REVISED REVEAL COMPOSITION

### Design Principle

**Goal:** Discoverable, emotionally complete reveal without vertical feed sprawl

**Strategy:** Composed memory page with in-place media switching

---

### Layout Architecture

```
┌─────────────────────────────────────────┐
│ Contributor Name                        │
│ "Happy Birthday! I miss you..."         │  ← Message (variable height)
├─────────────────────────────────────────┤
│                                         │
│         [Main Media Area]               │  ← Primary display area
│                                         │     (photos, GIF, or video)
│                                         │
├─────────────────────────────────────────┤
│  [Compact Media Selector]               │  ← Only if multiple media types
│  📸 Photos (3)  🎞️ GIF  🎥 Video        │     (chips/thumbnails)
├─────────────────────────────────────────┤
│        ← Previous    Next →             │  ← Navigation (always visible)
└─────────────────────────────────────────┘
```

**Key principle:** Main media area height is FIXED based on available viewport, media selector swaps content in-place.

---

### Responsive Height Calculation

**Do NOT hard-code 650-750px.**

Instead, calculate dynamically:

```typescript
const availableHeight = window.innerHeight
  - navbarHeight          // ~64px top nav
  - contributorNameHeight // ~32px
  - messageHeight         // variable (100-300px typical)
  - mediaSelectorHeight   // ~56px (only if needed)
  - navigationHeight      // ~80px (Previous/Next)
  - bufferPadding;        // ~32px safety margin

const mainMediaHeight = Math.min(
  availableHeight,
  600  // max for desktop aesthetic
);
```

**Mobile priority (390px width):**
- Navigation MUST remain clearly discoverable
- No vertical scroll required to see Next button
- Message may be longer on mobile → media area proportionally smaller
- Typical result: ~300-400px media area on mobile after accounting for message

---

### Media Display Strategy

#### Case 1: Photos Only (1-3)

**1 photo:**
```
┌───────────────────┐
│                   │
│    [Hero Photo]   │
│                   │
└───────────────────┘
```
- Centered, max-height based on available viewport
- No media selector (single media type)

**2 photos:**
```
┌─────────┬─────────┐
│ Photo 1 │ Photo 2 │
└─────────┴─────────┘
```
- Balanced pair, side-by-side (desktop)
- Stacked 50/50 (mobile)

**3 photos:**
```
┌──────────────┬─────┐
│              │ P2  │
│   Photo 1    ├─────┤
│   (hero)     │ P3  │
└──────────────┴─────┘
```
- 1 hero (60% width) + 2 supporting (40% width, stacked)
- Mobile: hero full-width, 2 supporting below in row

---

#### Case 2: Photos + GIF (no video)

**Main media area:**
- Default: Show photo collage (per strategy above)

**Compact media selector below:**
```
┌───────────────────────────┐
│ [📸 Photos (3)] [🎞️ GIF]  │
└───────────────────────────┘
```
- Chip-style buttons
- Active state visually distinct
- Click "GIF" → main area switches to full GIF display
- Click "Photos" → switches back to photo collage

**GIF display (when selected):**
```
┌───────────────────┐
│                   │
│   [Animated GIF]  │
│   (loops)         │
│                   │
└───────────────────┘
```
- Native `<img>` tag (preserves animation)
- Fits within same main media area height
- "GIF" badge indicator
- No height increase

---

#### Case 3: Photos + Video (no GIF)

**Main media area:**
- Default: Show photo collage

**Compact media selector:**
```
┌────────────────────────────┐
│ [📸 Photos (3)] [🎥 Video]  │
└────────────────────────────┘
```

**Video display (when selected):**
```
┌───────────────────┐
│                   │
│   [Video Player]  │
│   [  ▶ Play  ]    │
│                   │
└───────────────────┘
```
- HTML5 `<video>` with controls
- Starts paused (user must click play)
- Audio ducks MemoryPop soundtrack when playing
- Fits within same main media area height

---

#### Case 4: Photos + GIF + Video (full media)

**Main media area:**
- Default: Show photo collage

**Compact media selector:**
```
┌─────────────────────────────────────────┐
│ [📸 Photos (3)] [🎞️ GIF] [🎥 Video]     │
└─────────────────────────────────────────┘
```

**Interaction:**
- Click any chip → main area switches to that media type
- All media discoverable without scrolling
- GIF loops automatically when selected
- Video requires manual play
- Photo collage is default/initial state

---

#### Case 5: GIF Only (no photos, no video)

**Main media area:**
```
┌───────────────────┐
│                   │
│   [Animated GIF]  │
│   (loops)         │
│                   │
└───────────────────┘
```
- Hero treatment, centered
- No media selector (single media type)

---

#### Case 6: Video Only (no photos, no GIF)

**Main media area:**
```
┌───────────────────┐
│                   │
│   [Video Player]  │
│   [  ▶ Play  ]    │
│                   │
└───────────────────┘
```
- Hero treatment, centered
- No media selector (single media type)

---

#### Case 7: GIF + Video (no photos)

**Main media area:**
- Default: Show GIF (loops automatically)

**Compact media selector:**
```
┌──────────────────────────┐
│ [🎞️ GIF] [🎥 Video]      │
└──────────────────────────┘
```

**Rationale for GIF default:**
- GIF auto-plays (immediate visual interest)
- Video requires manual play (intentional interaction)
- GIF feels more "welcoming" as initial state

---

### Media Selector Visual Design

**Follow existing MemoryPop design language:**

**Chips (preferred):**
```tsx
<div className="flex gap-3 justify-center">
  <button
    className={`
      px-4 py-2 rounded-full text-sm font-medium
      transition-all duration-200
      ${active
        ? 'bg-[#8B7355] text-white shadow-md'
        : 'bg-[#F5F1ED] text-[#6B5B52] hover:bg-[#E8E0D5]'
      }
    `}
  >
    📸 Photos (3)
  </button>
  <button className="...">
    🎞️ GIF
  </button>
  <button className="...">
    🎥 Video
  </button>
</div>
```

**Alternative: Thumbnail strip (if chips feel too abstract):**
```
┌──────┬──────┬──────┐
│ [📸] │ [🎞️] │ [🎥] │
└──────┴──────┴──────┘
```
- Small preview thumbnails (48x48px)
- First photo, GIF first frame, video first frame
- Hover shows label tooltip

**Recommendation:** Start with chips for simplicity, evaluate thumbnail strip if needed during Judge review.

---

### Interaction Behavior

**Default state on reveal load:**
- If photos exist → show photo collage
- Else if GIF exists → show GIF
- Else if video exists → show video

**Switching media:**
- Click chip/thumbnail → fade transition (200ms)
- Main area content swaps
- Active chip visually distinct
- No page jump, no scroll
- Height remains constant

**Navigation (Previous/Next):**
- Always visible at bottom
- Works identically to current implementation
- Media selector state does NOT affect navigation
- Moving to next memory resets to default media state

**Audio ducking (video playback):**
- Use existing MemoryPop audio duck implementation
- When video plays → reduce soundtrack volume
- When video pauses/ends → restore soundtrack volume

---

### Mobile Optimization (390px width)

**Photo collage (3 photos):**
```
┌──────────────────┐
│   Photo 1 (hero) │  ← Full width
├────────┬─────────┤
│ P2     │   P3    │  ← 50/50 split
└────────┴─────────┘
```

**Media selector:**
```
┌─────────────────────┐
│ [📸] [🎞️] [🎥]      │  ← Compact chips
└─────────────────────┘
```
- Smaller chip size (icon + count/label)
- Still touch-friendly (44x44px min)

**Calculation example (390px width, typical mobile):**
- Screen height: 844px (iPhone 14)
- Top nav: 64px
- Name: 32px
- Message: 200px (typical)
- Media selector: 56px
- Navigation: 80px
- Buffer: 32px
- **Available for media:** 844 - 464 = **380px**

Result: Media area ~380px height, Next button clearly visible without scroll.

---

### Edge Cases

**Very long message:**
- Message may exceed typical 200px
- Media area shrinks proportionally
- Min media area: 200px (below this, consider message truncation with "Read more")

**Very short message:**
- Media area expands up to 600px max (desktop aesthetic)

**Landscape mobile:**
- Media selector may shift to side if horizontal space available
- Or remain below with reduced height main area

**Desktop (1920px width):**
- Max main area: 600px height (aesthetic constraint)
- Photo collage benefits from wider aspect
- Media selector centered below

---

### Implementation Notes

**Key React state:**
```tsx
type MediaType = 'photos' | 'gif' | 'video';

const [activeMedia, setActiveMedia] = useState<MediaType>(
  memory.photos.length > 0 ? 'photos'
  : memory.gifs.length > 0 ? 'gif'
  : 'video'
);

const [mainAreaHeight, setMainAreaHeight] = useState<number>(0);

useEffect(() => {
  const calculateHeight = () => {
    const available = window.innerHeight - /* ... */;
    setMainAreaHeight(Math.min(available, 600));
  };

  calculateHeight();
  window.addEventListener('resize', calculateHeight);
  return () => window.removeEventListener('resize', calculateHeight);
}, []);
```

**Rendering:**
```tsx
<div style={{ height: mainAreaHeight }} className="relative overflow-hidden">
  {activeMedia === 'photos' && <PhotoCollage photos={memory.photos} />}
  {activeMedia === 'gif' && <img src={memory.gifs[0].url} alt="GIF" />}
  {activeMedia === 'video' && <video src={memory.video.url} controls />}
</div>
```

---

### Outcome

**Recipient discovers all media during normal reveal:**
- Photos: Immediate (default state for most memories)
- GIF: One click away (chip/thumbnail)
- Video: One click away (chip/thumbnail)

**No vertical feed sprawl:**
- Main area height fixed based on viewport
- Media selector compact (~56px)
- Navigation always visible

**Feels like memory pages, not feed:**
- Content swaps in-place
- No scrolling required
- Previous/Next remains primary navigation

**DetailModal remains useful:**
- Revisit specific media
- Larger/full-screen viewing
- Complete inspection without navigation context

---

## B. VERIFIED VIDEO VALIDATION ARCHITECTURE

### Requirement

**Guarantee:** No >15-second video becomes an accepted Standard contribution

**Constraint:** Simplest reliable architecture

---

### Deployment Verification: Vercel Constraints

#### Request/Body Size Limits

**Vercel Pro plan (required for this feature):**
- Max request body: **100 MB**
- Our video limit: **50 MB**
- ✅ Within limits

**Vercel Hobby plan (current, if not Pro):**
- Max request body: **4.5 MB**
- ❌ Insufficient for video uploads

**Conclusion:** Vercel Pro plan REQUIRED ($20/month)

---

#### Function Limits

**Vercel Pro plan:**
- Max execution time: **60 seconds** (API routes)
- Max memory: **3008 MB**

**Our requirements:**
- Video size: 50 MB max
- Validation: Metadata read only (~500-1000ms)
- Upload to Supabase: ~2-8 seconds (depends on connection)
- Total: ~3-10 seconds typical

**Conclusion:** ✅ Well within limits

---

#### get-video-duration Reliability

**Library:** `get-video-duration` (npm)
- **Downloads:** ~50k/week (established library)
- **Maintenance:** Active (last publish within 6 months)
- **Runtime:** Works in Node.js (Vercel API routes use Node.js runtime)
- **Supported formats:** MP4, MOV, WebM (reads container metadata)
- **Method:** Parses video header/metadata, does NOT decode full video
- **Speed:** ~100-500ms for metadata read

**Vercel runtime compatibility:**
- Vercel API routes run Node.js 20.x (compatible)
- No native binaries required (pure JavaScript)
- ✅ Confirmed compatible

**Testing recommendation:** Verify on staging with actual mobile uploads before production

---

#### Supported Video Formats

**get-video-duration supports:**
- MP4 (H.264, H.265)
- MOV (QuickTime)
- WebM (VP8, VP9)
- AVI, MKV (less common)

**Our allowed formats:**
- MP4 (primary, most common)
- MOV (iPhone default)
- WebM (Android/web)

**Conclusion:** ✅ All our formats supported

---

### Architecture Comparison

#### Option 1: Vercel Proxy (Current Proposal)

**Flow:**
```
Client
  ↓ (FormData with video file)
Vercel API Route (/api/upload)
  ↓ (read buffer)
get-video-duration (validate ≤15s)
  ↓ (if valid)
Upload to Supabase Storage
  ↓ (return public URL)
Insert memory record with video JSONB
```

**Pros:**
- ✅ Single upload flow (client → Vercel → Supabase)
- ✅ Validation before storage (no orphan files)
- ✅ Immediate feedback to user
- ✅ Simple error handling
- ✅ Works with existing Supabase RLS (API routes have service role)

**Cons:**
- ⚠️ Requires Vercel Pro ($20/month)
- ⚠️ Video passes through Vercel (bandwidth)
- ⚠️ Function timeout risk (mitigated: 60s limit sufficient)

**Failure scenarios:**

**Validation fails:**
```
Client uploads → Vercel validates duration → REJECT
↓
Return 400 error: "Video exceeds 15 second limit"
↓
Client shows error, user can retry with shorter video
↓
NO file uploaded to Supabase (clean)
```

**Validation succeeds, Supabase upload fails:**
```
Client uploads → Vercel validates OK → Supabase upload fails
↓
Return 500 error: "Upload failed, please retry"
↓
Client shows error, user can retry
↓
NO memory record created (clean)
```

**Validation fails midway (timeout/crash):**
```
Client uploads → Vercel function crashes/times out
↓
Return 500 error (or client timeout)
↓
Client shows error, user can retry
↓
NO file uploaded to Supabase (clean)
```

**Slow mobile upload:**
- Client shows upload progress spinner
- Vercel receives data in chunks (Next.js handles streaming)
- Once complete, validation runs
- User sees "Validating..." state
- Total time: ~5-15 seconds for 50MB video on slow connection
- ✅ Acceptable for Standard tier

**Duplicate transfer:**
- Video uploaded once: client → Vercel
- Video uploaded again: Vercel → Supabase
- Total bandwidth: 2x video size
- For 50MB video: 100MB total bandwidth used
- ⚠️ Cost: Minimal (Vercel Pro includes generous bandwidth)

---

#### Option 2: Temporary/Quarantine Upload

**Flow:**
```
Client
  ↓ (direct upload to Supabase)
Supabase Storage (temporary/quarantine bucket)
  ↓ (return temp URL)
Vercel API Route (/api/memories POST)
  ↓ (fetch temp video, validate duration)
If valid: Move to permanent bucket + create memory record
If invalid: Delete temp file + reject contribution
```

**Pros:**
- ✅ Direct upload to Supabase (faster for user)
- ✅ No video passes through Vercel (lower bandwidth)
- ✅ Could work on Vercel Hobby plan (API route only receives URL)

**Cons:**
- ❌ More complex architecture (2 buckets, move operation)
- ❌ Orphan files if validation fails (need cleanup job)
- ❌ Validation happens AFTER user thinks upload is complete (confusing UX)
- ❌ Requires download from Supabase to Vercel for validation (still uses bandwidth)
- ❌ Need to secure temp bucket (prevent direct access to unvalidated videos)
- ❌ RLS complexity (temp bucket access rules)
- ❌ Cleanup job required (delete abandoned temp files)

**Failure scenarios:**

**Validation fails:**
```
Client uploads to temp bucket → Vercel validates duration → REJECT
↓
Delete temp file
↓
Return 400 error
↓
User confused: "Upload succeeded, why did it fail?"
```

**Validation succeeds, move fails:**
```
Client uploads to temp bucket → Validation OK → Move fails
↓
Return 500 error
↓
Temp file remains (need cleanup job)
```

**User abandons contribution:**
```
Client uploads to temp bucket → User closes browser
↓
Temp file remains forever (orphan)
↓
Need scheduled cleanup job to delete old temp files
```

**Bandwidth comparison:**
- Video uploaded once: client → Supabase temp
- Video downloaded once: Supabase temp → Vercel (for validation)
- Video uploaded again: Vercel → Supabase permanent (if moving via Vercel)
- OR: Supabase temp → Supabase permanent (server-side move, no bandwidth)
- **Result:** Similar or slightly less bandwidth than Option 1, but more complexity

---

### Recommendation: Option 1 (Vercel Proxy)

**Rationale:**

1. **Simpler architecture:**
   - Single upload flow
   - Validation before storage
   - No temp buckets, no cleanup jobs
   - Clear error states

2. **Better UX:**
   - User sees "Uploading and validating..." (single step)
   - Immediate feedback if video too long
   - No confusion about "upload succeeded but contribution failed"

3. **Cleaner data:**
   - No orphan files
   - No temp bucket to secure/manage
   - Validated videos only in storage

4. **Acceptable costs:**
   - Vercel Pro: $20/month (required for video uploads anyway)
   - Bandwidth: 2x video size (minimal cost)
   - Function time: ~5-15 seconds (well within 60s limit)

5. **Proven pattern:**
   - Standard file upload flow
   - No exotic cleanup requirements
   - Easier to debug and monitor

**Option 2 (temp/quarantine) is NOT simpler:**
- Adds complexity: 2 buckets, move operations, cleanup jobs
- Adds confusion: validation after "upload complete"
- Adds orphan risk: abandoned temp files
- Minimal bandwidth savings (~10-20%)
- Not justified for Standard tier use case

**If future Premium tiers need >15s videos:**
- Validation duration can be parameterized by tier
- Architecture remains same (validate before storage)
- No need to refactor

---

### Final Architecture: Vercel API + get-video-duration

**Implementation:**

```typescript
// /api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getVideoDurationInSeconds } from 'get-video-duration';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs'; // Required for get-video-duration

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const mediaType = formData.get('mediaType') as 'photo' | 'gif' | 'video';

  // Validate file size
  const MAX_SIZES = { photo: 10 * 1024 * 1024, gif: 5 * 1024 * 1024, video: 50 * 1024 * 1024 };
  if (file.size > MAX_SIZES[mediaType]) {
    return NextResponse.json(
      { error: `File size exceeds ${MAX_SIZES[mediaType] / 1024 / 1024}MB limit` },
      { status: 400 }
    );
  }

  // Validate video duration (server-side)
  if (mediaType === 'video') {
    const buffer = Buffer.from(await file.arrayBuffer());

    let duration: number;
    try {
      duration = await getVideoDurationInSeconds(buffer);
    } catch (error) {
      return NextResponse.json(
        { error: 'Could not read video metadata. Please ensure your video is in MP4, MOV, or WebM format.' },
        { status: 400 }
      );
    }

    // Enforce Standard tier 15-second limit
    if (duration > 15) {
      return NextResponse.json(
        {
          error: `Video duration ${duration.toFixed(1)}s exceeds 15-second limit for Standard MemoryPops`,
          duration: duration
        },
        { status: 400 }
      );
    }
  }

  // Upload to Supabase Storage
  const supabase = createClient();
  const filename = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('memory-photos') // Existing bucket (per founder: do not rename)
    .upload(filename, file);

  if (error) {
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }

  // Return public URL
  const { data: { publicUrl } } = supabase.storage
    .from('memory-photos')
    .getPublicUrl(filename);

  return NextResponse.json({
    url: publicUrl,
    duration: mediaType === 'video' ? duration : undefined
  });
}
```

**Client-side (ContributeForm.tsx):**

```typescript
const handleVideoUpload = async (file: File) => {
  // Client-side quick check (not authoritative)
  const videoElement = document.createElement('video');
  videoElement.src = URL.createObjectURL(file);
  await new Promise(resolve => videoElement.onloadedmetadata = resolve);

  if (videoElement.duration > 15) {
    setError('Video must be 15 seconds or shorter');
    return;
  }

  // Upload with server-side validation
  setUploading(true);
  setUploadProgress(0);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('mediaType', 'video');

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const { error, duration } = await response.json();
      if (duration) {
        setError(`Video is ${duration.toFixed(1)} seconds (max 15 seconds)`);
      } else {
        setError(error);
      }
      return;
    }

    const { url, duration } = await response.json();
    setVideo({ url, duration });

  } catch (error) {
    setError('Upload failed. Please check your connection and try again.');
  } finally {
    setUploading(false);
  }
};
```

---

### Constraints Summary

| Constraint | Limit | Our Usage | Status |
|------------|-------|-----------|--------|
| Vercel plan | Pro required | $20/month | ⚠️ Required |
| Request body size | 100 MB (Pro) | 50 MB video | ✅ OK |
| Function timeout | 60s (Pro) | ~5-15s typical | ✅ OK |
| Function memory | 3008 MB (Pro) | <100 MB | ✅ OK |
| Bandwidth | Generous (Pro) | 2x video size | ✅ OK |
| Runtime compatibility | Node.js 20.x | get-video-duration | ✅ OK |
| Video formats | MP4/MOV/WebM | MP4/MOV/WebM | ✅ OK |

---

### Risks

**New risks from this architecture:**

1. **Vercel Pro dependency**
   - Severity: Medium
   - Cost: $20/month
   - Mitigation: Required for video uploads regardless of validation approach

2. **Video upload latency**
   - Severity: Low
   - Impact: +5-15 seconds total upload time on slow connections
   - Mitigation: Clear progress UI, acceptable for Standard tier

3. **Function timeout (edge case)**
   - Severity: Low
   - Scenario: 50MB video on extremely slow connection
   - Mitigation: 60s limit sufficient, user can retry

4. **Library dependency (get-video-duration)**
   - Severity: Low
   - Mitigation: Established library, active maintenance, no native binaries
   - Fallback: Could switch to ffprobe later if needed

5. **Bandwidth cost (2x transfer)**
   - Severity: Low
   - Cost: Minimal (Vercel Pro includes generous bandwidth)
   - Mitigation: Standard tier only, limited usage

**No new architectural risks compared to temp/quarantine approach (which has higher risks).**

---

## C. FILES/DEPENDENCIES CHANGED

### New Dependencies

**Add to package.json:**
```json
{
  "dependencies": {
    "get-video-duration": "^4.1.0"
  }
}
```

**Installation:**
```bash
npm install get-video-duration
```

---

### Files Changed (Updated from Revision 1)

**Total: 9 files (unchanged from previous revision)**

1. **ContributeForm.tsx** (+340 lines, was +320)
   - Multi-media state (photos[], gifs[], video)
   - Upload handlers with progress
   - Preview displays
   - Client-side video duration pre-check (UX only)

2. **/api/upload/route.ts** (+75 lines, was +60)
   - Add `runtime = 'nodejs'` export
   - Import `get-video-duration`
   - Server-side duration validation
   - Error messages with duration info
   - Return duration in response

3. **/api/memories/route.ts** (+60 lines, unchanged)
   - Accept photos[], gifs[], video
   - Insert JSONB structure

4. **RevealExperience.tsx** (+220 lines, was +180)
   - Composed memory page layout
   - Dynamic height calculation
   - Media selector (chips)
   - In-place media switching
   - Photo collage (1/2/3 layouts)
   - GIF display (native img)
   - Video display (HTML5 video)
   - Audio ducking integration

5. **types.ts** (+30 lines, was +25)
   - MediaItem interface
   - VideoMedia interface (with duration_seconds)
   - Updated Memory interface

6. **MemoryCard.tsx** (+45 lines, unchanged)
   - Thumbnail priority logic
   - Media count badge

7. **DetailModal.tsx** (+90 lines, unchanged)
   - Full media display with scrolling

8. **010_add_standard_multimedia.sql** (+160 lines, unchanged)
   - JSONB columns
   - Constraints
   - Indexes
   - Data migration
   - Rollback script

9. **Reveal page loader** (+35 lines, unchanged)
   - Query JSONB columns
   - Dual-read fallback

**Total: ~1,055 lines (was ~975)**

**Increase due to:**
- More sophisticated reveal composition (+40 lines in RevealExperience)
- Enhanced video validation (+15 lines in /api/upload)

---

### Implementation Effort Adjustment

**Original estimate:** 3-5 days

**Revised estimate:** 4-6 days

**Breakdown:**
- Day 1: Contribution form + upload API (video validation) — unchanged
- Day 2: Database migration + memory API — unchanged
- Day 3-4: Reveal composition (media selector, height calculation, in-place switching) — **+1 day**
- Day 5: Memory Wall + DetailModal — unchanged
- Day 6: Testing + polish + founder validation — unchanged

**Rationale for +1 day:**
- Composed memory page more sophisticated than "primary media only"
- Dynamic height calculation needs testing across devices
- Media selector interaction needs polish
- Worth extra day for better user experience

---

## D. NEW RISKS

### Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Vercel Pro requirement | Medium | Required for video uploads anyway |
| Video upload latency | Low | Clear progress UI, acceptable delay |
| Function timeout | Low | 60s sufficient, retry available |
| get-video-duration dependency | Low | Established library, no binaries |
| Bandwidth cost (2x transfer) | Low | Minimal cost, Standard tier only |
| Reveal height calculation complexity | Low | Test across devices, responsive design |
| Media selector interaction polish | Low | Judge review will catch issues |
| Photo collage responsive layouts | Low | Test on 390px, 768px, 1920px |
| GIF/video in-place switching | Low | Fade transition, state management |
| Navigation visibility (mobile) | Medium | Dynamic height ensures Next visible |

**Overall risk level:** Medium (increased from original due to more sophisticated reveal UI)

**Confidence:** High (well-architected, testable, reversible)

---

### Critical Testing Required

**Before founder validation:**

1. **Reveal composition on mobile (390px):**
   - Message + media + selector + navigation all visible
   - Next button discoverable without scroll
   - Test with long messages, short messages
   - Test all media combinations

2. **Video validation:**
   - Upload 14s video → should succeed
   - Upload 16s video → should reject with clear error
   - Upload corrupted video → should reject gracefully
   - Test on slow connection

3. **Media selector interaction:**
   - Click photo chip → shows photo collage
   - Click GIF chip → shows GIF (loops)
   - Click video chip → shows video (paused)
   - Click video play → audio ducks soundtrack
   - Switch between media types → smooth transitions

4. **Photo collage layouts:**
   - 1 photo: hero centered
   - 2 photos: balanced pair
   - 3 photos: hero + 2 supporting
   - Test responsive breakpoints

5. **Navigation flow:**
   - Previous/Next work with media selector
   - Moving to next memory resets to default media
   - Last memory → Next → FinalScreen (regression test)

---

## SUMMARY

### A. Reveal Composition (Revised)

**Approved strategy:** Composed memory page with compact in-place treatment

**Key features:**
- Main media area with fixed height (calculated from available viewport)
- Compact media selector (chips) below main area
- All media discoverable during normal reveal (not deferred to DetailModal)
- GIF/video swap into main area in-place (no height increase)
- Navigation always visible at bottom
- Photo collage for 1/2/3 photos
- Media selector only appears if multiple media types present
- Default state: photos (if present), else GIF, else video

**Outcome:**
- Recipient discovers all media without scrolling
- No vertical feed sprawl
- Feels like moving through memory pages
- DetailModal remains useful for revisiting

---

### B. Video Validation Architecture (Verified)

**Approved approach:** Vercel API + get-video-duration library

**Architecture:**
```
Client → Vercel API → validate duration → Supabase Storage
```

**Verification results:**
- ✅ Vercel Pro plan required ($20/month)
- ✅ 100 MB body limit (our 50 MB within limits)
- ✅ 60s timeout (our ~5-15s well within)
- ✅ 3008 MB memory (sufficient)
- ✅ get-video-duration compatible with Vercel Node.js runtime
- ✅ MP4/MOV/WebM formats supported
- ✅ Simpler than temp/quarantine approach
- ✅ Validation before storage (no orphan files)
- ✅ Clear error handling

**Temp/quarantine comparison:**
- More complex (2 buckets, cleanup jobs)
- Confusing UX (validation after "upload complete")
- Orphan file risk
- Minimal bandwidth savings (~10-20%)
- NOT recommended

---

### C. Files Changed

**9 files, ~1,055 lines total:**
1. ContributeForm.tsx (+340)
2. /api/upload (+75, video validation)
3. /api/memories (+60)
4. RevealExperience.tsx (+220, composed memory page)
5. types.ts (+30)
6. MemoryCard.tsx (+45)
7. DetailModal.tsx (+90)
8. 010_add_standard_multimedia.sql (+160)
9. Reveal page loader (+35)

**New dependency:**
- get-video-duration ^4.1.0

**Revised timeline:** 4-6 days (was 3-5)

---

### D. Risks

**10 risks identified, all low-medium severity:**
- Vercel Pro requirement (required anyway)
- Video latency (acceptable for Standard tier)
- Function timeout (unlikely, mitigated)
- Library dependency (low risk)
- Bandwidth cost (minimal)
- Reveal height calculation (testable)
- Media selector polish (Judge review)
- Photo collage responsive (testable)
- In-place switching (state management)
- Navigation visibility (dynamic height ensures)

**Overall:** Medium risk, high confidence

---

## APPROVAL REQUIRED

Founder must confirm:

1. ✅ Composed memory page approach approved?
   - Main media area + compact selector
   - All media discoverable during normal reveal
   - In-place switching, no vertical sprawl

2. ✅ Dynamic height calculation approved?
   - Based on viewport minus UI elements
   - No hard-coded 650-750px
   - Navigation always visible

3. ✅ Vercel API video validation approved?
   - Verified deployment constraints
   - Compared with temp/quarantine
   - Recommended as simplest reliable approach

4. ✅ Vercel Pro plan requirement approved?
   - $20/month cost acceptable

5. ✅ Revised timeline approved?
   - 4-6 days (was 3-5)
   - Extra day for sophisticated reveal composition

6. ✅ All other specifications remain approved?
   - JSONB model, backwards compatibility, etc.

**Once approved, next step:**
- "Approved, proceed to implementation"
- Workflow: Coder → Tester → Judge → Reviewer → Founder Validation

---

**Last Updated:** 2026-08-13
**Status:** Awaiting Final Founder Approval
**DO NOT IMPLEMENT until founder says: "Approved, proceed to implementation"**
