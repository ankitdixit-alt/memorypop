# Increment 1 Corrections - Phase 4: Creator Multimedia Parity

**Date:** 2026-08-17
**Status:** ⚠️ REQUIRES SIGNIFICANT DEVELOPMENT (Specification Complete)

---

## Problem Identified

**Current state:**
- **Contributors** can add Standard multimedia (3 photos + 1 GIF + 1 video ≤15s)
- **Creators** can only add a text story at creation time (no multimedia)

**Founder directive:**
> Give creator same Standard multimedia allowance as contributors. Creator is "first contributor" principle.

**Gap:**
- ContributeForm: 842 lines, full multimedia upload implemented ✅
- CreateForm: 532 lines, only basic photo preview (not uploaded) ❌
- API: `/api/memorypops/create` doesn't handle multimedia upload ❌

---

## Architecture Decision: Shared Components

**Goal:** Extract multimedia upload logic from ContributeForm into reusable shared components.

**Benefits:**
- Code reuse (DRY principle)
- Consistent UX between creator and contributor flows
- Easier maintenance
- Single source of truth for validation rules

**Components to create:**

### 1. SharedPhotoUpload
**Location:** `/src/components/shared-media/SharedPhotoUpload.tsx`

**Responsibilities:**
- Handle file selection (up to 3 photos)
- Validate file type (JPEG, PNG, WebP)
- Validate file size (<10MB each)
- Generate preview URLs
- Display photo previews with remove buttons
- Show upload progress
- Handle errors

**Props:**
```typescript
interface SharedPhotoUploadProps {
  photos: Array<{file: File; preview: string; uploading: boolean}>;
  onPhotosChange: (photos: Array<{file: File; preview: string; uploading: boolean}>) => void;
  maxPhotos?: number; // Default: 3
  maxSizeMB?: number; // Default: 10
  error?: string;
  onErrorChange?: (error: string | undefined) => void;
}
```

### 2. SharedCuratedGifPicker
**Location:** `/src/components/shared-media/SharedCuratedGifPicker.tsx`

**Responsibilities:**
- Display curated GIF library grid
- Handle GIF selection (up to 1)
- Show selected GIF preview
- Handle GIF removal
- Filter by occasion (optional)

**Props:**
```typescript
interface SharedCuratedGifPickerProps {
  selectedGif: CuratedGif | null;
  onGifSelect: (gif: CuratedGif) => void;
  onGifRemove: () => void;
  occasion?: string; // For filtering
  error?: string;
  onErrorChange?: (error: string | undefined) => void;
}
```

**Note:** CuratedGifPicker already exists at `/src/components/contribute/CuratedGifPicker.tsx`. This should be moved/refactored to shared location.

### 3. SharedVideoUpload
**Location:** `/src/components/shared-media/SharedVideoUpload.tsx`

**Responsibilities:**
- Handle file selection (up to 1 video)
- Validate file type (MP4, MOV, WebM)
- Validate file size (<50MB)
- Validate duration (≤15s)
- Generate preview URL
- Extract video duration
- Display video preview with controls
- Show duration badge
- Handle errors

**Props:**
```typescript
interface SharedVideoUploadProps {
  video: {file: File; preview: string; duration: number; uploading: boolean} | null;
  onVideoChange: (video: {file: File; preview: string; duration: number; uploading: boolean} | null) => void;
  maxSizeMB?: number; // Default: 50
  maxDurationSeconds?: number; // Default: 15
  error?: string;
  onErrorChange?: (error: string | undefined) => void;
}
```

---

## Implementation Steps

### Step 1: Extract SharedPhotoUpload Component

**Source:** Extract from `/src/app/m/[shareCode]/contribute/ContributeForm.tsx` (lines 70-125)

**Key logic to extract:**
```typescript
// Photo upload handler (up to 3 photos, 10MB each)
function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
  const files = Array.from(event.target.files || []);

  if (files.length === 0) return;

  // Validate count (Standard tier: max 3 photos)
  const remainingSlots = 3 - photos.length;
  if (files.length > remainingSlots) {
    setUploadErrors(prev => ({
      ...prev,
      photos: `You can add up to 3 photos. You have ${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} remaining.`
    }));
    return;
  }

  // Validate file types and sizes
  for (const file of files) {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadErrors(prev => ({
        ...prev,
        photos: 'Only JPEG, PNG, and WebP photos are allowed.'
      }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadErrors(prev => ({
        ...prev,
        photos: 'Each photo must be under 10MB.'
      }));
      return;
    }
  }

  // Clear errors
  setUploadErrors(prev => ({...prev, photos: undefined}));

  // Add photos with preview URLs
  const newPhotos = files.map(file => ({
    file,
    preview: URL.createObjectURL(file),
    uploading: false,
  }));

  setPhotos(prev => [...prev, ...newPhotos]);
}
```

**UI components to extract:**
- File input button with styling
- Photo preview grid (1/2/3 photo layouts)
- Remove button for each photo
- Error message display
- Upload progress indicators

---

### Step 2: Move/Refactor CuratedGifPicker

**Current location:** `/src/components/contribute/CuratedGifPicker.tsx`
**New location:** `/src/components/shared-media/SharedCuratedGifPicker.tsx`

**Changes needed:**
- Make occasion filtering prop optional
- Extract gift grid UI into reusable component
- Add clearer selected state indicator
- Support both modal and inline display modes

---

### Step 3: Extract SharedVideoUpload Component

**Source:** Extract from `/src/app/m/[shareCode]/contribute/ContributeForm.tsx` (lines 137-220)

**Key logic to extract:**
```typescript
// Video upload handler (up to 1 video, 50MB, 15s max)
async function handleVideoUpload(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) return;

  // Validate count (Standard tier: max 1 video)
  if (video) {
    setUploadErrors(prev => ({
      ...prev,
      video: 'You can add up to 1 video. Remove the existing video to add a different one.'
    }));
    return;
  }

  // Validate file type
  if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) {
    setUploadErrors(prev => ({
      ...prev,
      video: 'Only MP4, MOV, and WebM videos are allowed.'
    }));
    return;
  }

  // Validate file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    setUploadErrors(prev => ({
      ...prev,
      video: 'Video must be under 50MB.'
    }));
    return;
  }

  // Validate duration (15s max for Standard tier)
  const duration = await getVideoDuration(file);
  if (duration > 15) {
    setUploadErrors(prev => ({
      ...prev,
      video: 'Video must be 15 seconds or shorter for the Standard tier.'
    }));
    return;
  }

  // Clear errors
  setUploadErrors(prev => ({...prev, video: undefined}));

  // Set video with preview
  setVideo({
    file,
    preview: URL.createObjectURL(file),
    duration,
    uploading: false,
  });
}

// Helper to get video duration
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}
```

**UI components to extract:**
- File input button with styling
- Video preview player
- Duration badge display
- Remove button
- Error message display
- Upload progress indicator

---

### Step 4: Refactor ContributeForm

**File:** `/src/app/m/[shareCode]/contribute/ContributeForm.tsx`

**Changes:**
1. Import shared components:
```typescript
import SharedPhotoUpload from '@/components/shared-media/SharedPhotoUpload';
import SharedCuratedGifPicker from '@/components/shared-media/SharedCuratedGifPicker';
import SharedVideoUpload from '@/components/shared-media/SharedVideoUpload';
```

2. Replace inline multimedia sections with shared components:
```typescript
{/* Photo upload */}
<SharedPhotoUpload
  photos={photos}
  onPhotosChange={setPhotos}
  error={uploadErrors.photos}
  onErrorChange={(error) => setUploadErrors(prev => ({...prev, photos: error}))}
/>

{/* GIF picker */}
<SharedCuratedGifPicker
  selectedGif={selectedCuratedGif}
  onGifSelect={handleCuratedGifSelect}
  onGifRemove={handleCuratedGifRemove}
  occasion={occasion}
  error={uploadErrors.gifs}
  onErrorChange={(error) => setUploadErrors(prev => ({...prev, gifs: error}))}
/>

{/* Video upload */}
<SharedVideoUpload
  video={video}
  onVideoChange={setVideo}
  error={uploadErrors.video}
  onErrorChange={(error) => setUploadErrors(prev => ({...prev, video: error}))}
/>
```

3. Remove extracted code (handlers, UI components)
4. Keep submit logic (uploads files to Supabase)

**Expected result:** ContributeForm reduced from ~842 lines to ~500-600 lines

---

### Step 5: Integrate Shared Components into CreateForm

**File:** `/src/app/create/CreateForm.tsx`

**Step 2 changes (Creator's memory):**

Currently Step 2 shows:
- Story text field (creator's message)
- Basic photo preview (not uploaded)

New Step 2 should show:
- Creator name field (for attribution as "first contributor")
- Story/message text field
- **SharedPhotoUpload** (up to 3 photos)
- **SharedCuratedGifPicker** (up to 1 GIF)
- **SharedVideoUpload** (up to 1 video ≤15s)

**State additions:**
```typescript
// Creator's name (for first memory attribution)
const [creatorName, setCreatorName] = useState("");

// Standard multimedia state (same as ContributeForm)
const [photos, setPhotos] = useState<Array<{file: File; preview: string; uploading: boolean}>>([]);
const [selectedCuratedGif, setSelectedCuratedGif] = useState<CuratedGif | null>(null);
const [video, setVideo] = useState<{file: File; preview: string; duration: number; uploading: boolean} | null>(null);

// Upload progress and errors
const [uploadErrors, setUploadErrors] = useState<{photos?: string; gifs?: string; video?: string}>({});
```

**UI updates:**
```typescript
{/* Step 2: Creator's Memory */}
{step === 2 && (
  <div>
    <h2>Share Your Memory</h2>
    <p>As the creator, you're the first contributor!</p>

    {/* Creator name */}
    <input
      type="text"
      placeholder="Your name"
      value={creatorName}
      onChange={(e) => setCreatorName(e.target.value)}
    />

    {/* Message */}
    <textarea
      placeholder="Share your story or message..."
      value={story}
      onChange={(e) => setStory(e.target.value)}
    />

    {/* Multimedia uploads */}
    <SharedPhotoUpload
      photos={photos}
      onPhotosChange={setPhotos}
      error={uploadErrors.photos}
      onErrorChange={(error) => setUploadErrors(prev => ({...prev, photos: error}))}
    />

    <SharedCuratedGifPicker
      selectedGif={selectedCuratedGif}
      onGifSelect={setSelectedCuratedGif}
      onGifRemove={() => setSelectedCuratedGif(null)}
      occasion={occasion}
      error={uploadErrors.gifs}
      onErrorChange={(error) => setUploadErrors(prev => ({...prev, gifs: error}))}
    />

    <SharedVideoUpload
      video={video}
      onVideoChange={setVideo}
      error={uploadErrors.video}
      onErrorChange={(error) => setUploadErrors(prev => ({...prev, video: error}))}
    />

    <button onClick={() => setStep(3)}>Continue to Preview</button>
  </div>
)}
```

---

### Step 6: Update API Endpoint

**File:** `/src/app/api/memorypops/create/route.ts`

**Current behavior:**
- Creates MemoryPop record
- Returns share code
- Does NOT create first memory

**New behavior:**
- Creates MemoryPop record
- **Uploads creator's multimedia to Supabase Storage**
- **Creates first memory record with multimedia**
- Returns share code

**Changes needed:**

1. **Accept multimedia in request body:**
```typescript
// New fields in FormData:
// - creatorName: string
// - creatorMessage: string
// - photo_0, photo_1, photo_2: File (optional, up to 3)
// - gif_url: string (curated GIF URL, optional)
// - video: File (optional)
```

2. **Upload photos to Supabase Storage:**
```typescript
const uploadedPhotos: MediaItem[] = [];

for (let i = 0; i < 3; i++) {
  const photoFile = formData.get(`photo_${i}`) as File | null;
  if (!photoFile) continue;

  // Upload to Supabase Storage
  const fileName = `${memorypopId}/creator-photo-${i}-${Date.now()}.${getExtension(photoFile.name)}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('memory-photos')
    .upload(fileName, photoFile);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('memory-photos')
    .getPublicUrl(fileName);

  uploadedPhotos.push({
    url: urlData.publicUrl,
    uploaded_at: new Date().toISOString(),
    file_size_bytes: photoFile.size,
  });
}
```

3. **Upload video to Supabase Storage with HMAC validation:**
```typescript
let uploadedVideo: VideoMedia | null = null;

const videoFile = formData.get('video') as File | null;
if (videoFile) {
  // Upload video
  const fileName = `${memorypopId}/creator-video-${Date.now()}.${getExtension(videoFile.name)}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('memory-videos')
    .upload(fileName, videoFile);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('memory-videos')
    .getPublicUrl(fileName);

  // Get video duration (passed from frontend)
  const duration = parseFloat(formData.get('video_duration') as string);

  // Generate HMAC validation proof
  const videoUrl = urlData.publicUrl;
  const hmacSecret = process.env.VIDEO_HMAC_SECRET;
  const hmac = createHmac('sha256', hmacSecret)
    .update(videoUrl)
    .digest('hex');

  uploadedVideo = {
    url: videoUrl,
    duration_seconds: duration,
    uploaded_at: new Date().toISOString(),
    file_size_bytes: videoFile.size,
    validation_proof: hmac,
  };
}
```

4. **Create first memory record:**
```typescript
// Create creator's memory (first memory)
const { data: creatorMemory, error: memoryError } = await supabase
  .from('memories')
  .insert({
    memorypop_id: memoryPopData.id,
    contributor_name: formData.get('creatorName') as string,
    message: formData.get('creatorMessage') as string || null,
    photos: uploadedPhotos.length > 0 ? uploadedPhotos : null,
    gifs: formData.get('gif_url') ? [{
      url: formData.get('gif_url') as string,
      uploaded_at: new Date().toISOString(),
      file_size_bytes: 0, // Curated GIF, no size tracking
    }] : null,
    video: uploadedVideo,
    // Legacy field for backwards compatibility
    photo_url: uploadedPhotos.length > 0 ? uploadedPhotos[0].url : null,
  })
  .select()
  .single();

if (memoryError) throw memoryError;
```

5. **Return success with memory count:**
```typescript
return NextResponse.json({
  success: true,
  memorypop: {
    ...memoryPopData,
    memory_count: 1, // Creator's memory
  },
});
```

---

### Step 7: Update CreateForm Submit Handler

**File:** `/src/app/create/CreateForm.tsx` (saveMemoryPop function)

**Current submission:**
```typescript
async function saveMemoryPop() {
  const response = await fetch("/api/memorypops/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipientName: recipient,
      occasion,
      tone: mood,
      celebrationDate: celebrationDate || null,
      coverStyle: selectedCover,
    }),
  });
  // ...
}
```

**New submission (with multimedia):**
```typescript
async function saveMemoryPop() {
  setCreateError("");
  setIsCreating(true);

  try {
    // Build FormData (supports file uploads)
    const formData = new FormData();

    // MemoryPop details
    formData.append('recipientName', recipient);
    formData.append('occasion', occasion);
    formData.append('tone', mood || 'simple_classic');
    formData.append('celebrationDate', celebrationDate || '');
    formData.append('coverStyle', selectedCover);

    // Creator's memory details
    formData.append('creatorName', creatorName);
    formData.append('creatorMessage', story);

    // Upload photos
    photos.forEach((photo, index) => {
      formData.append(`photo_${index}`, photo.file);
    });

    // Upload curated GIF (URL only, no file upload)
    if (selectedCuratedGif) {
      formData.append('gif_url', selectedCuratedGif.url);
    }

    // Upload video
    if (video) {
      formData.append('video', video.file);
      formData.append('video_duration', video.duration.toString());
    }

    // Submit
    const response = await fetch("/api/memorypops/create", {
      method: "POST",
      body: formData, // Send as FormData (not JSON)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create MemoryPop');
    }

    const data = await response.json();

    // Track creation success
    trackEvent('memorypop_created', {
      occasion,
      mood,
      has_creator_multimedia: photos.length > 0 || selectedCuratedGif !== null || video !== null,
      photo_count: photos.length,
      has_gif: selectedCuratedGif !== null,
      has_video: video !== null,
    });

    // Redirect to share page
    router.push(`/m/${data.memorypop.share_code}`);
  } catch (error) {
    console.error('Create error:', error);
    setCreateError(error instanceof Error ? error.message : 'Failed to create MemoryPop');
  } finally {
    setIsCreating(false);
  }
}
```

---

## Validation & Testing

### Unit Tests

**Test SharedPhotoUpload:**
- [ ] Upload 1 photo (success)
- [ ] Upload 2 photos (success)
- [ ] Upload 3 photos (success)
- [ ] Upload 4 photos (error: max 3)
- [ ] Upload invalid file type (error)
- [ ] Upload file >10MB (error)
- [ ] Remove photo (success)

**Test SharedCuratedGifPicker:**
- [ ] Select GIF (success)
- [ ] Remove GIF (success)
- [ ] Filter by occasion (correct GIFs shown)
- [ ] No occasion filter (all GIFs shown)

**Test SharedVideoUpload:**
- [ ] Upload video <15s (success)
- [ ] Upload video >15s (error)
- [ ] Upload video >50MB (error)
- [ ] Upload invalid file type (error)
- [ ] Remove video (success)
- [ ] Duration display correct

### Integration Tests

**Test CreateForm with multimedia:**
- [ ] Complete Step 1 (occasion + recipient)
- [ ] Complete Step 2 (creator memory + multimedia)
- [ ] Upload 2 photos
- [ ] Select 1 curated GIF
- [ ] Upload 1 video (10s)
- [ ] Complete Step 3 (preview)
- [ ] Submit form
- [ ] **Verify:** MemoryPop created
- [ ] **Verify:** First memory saved with multimedia
- [ ] **Verify:** Photos uploaded to Supabase Storage
- [ ] **Verify:** Video uploaded with HMAC proof
- [ ] **Verify:** GIF URL stored correctly

**Test ContributeForm (regression):**
- [ ] Contribute memory after creator
- [ ] **Verify:** Still works with shared components
- [ ] **Verify:** Second memory saved correctly
- [ ] **Verify:** Memory count increments

### E2E Testing

**Full creator → contributor → recipient flow:**
1. [ ] Creator creates MemoryPop with multimedia (2 photos, 1 GIF, 1 video)
2. [ ] Contributor adds memory with different multimedia
3. [ ] Recipient views Memory Wall
   - [ ] **Verify:** Both memories display correctly
   - [ ] **Verify:** Creator's memory shows first
4. [ ] Recipient plays reveal experience
   - [ ] **Verify:** Creator's memory appears
   - [ ] **Verify:** Multimedia displays correctly (photos, GIF, video)
5. [ ] Recipient clicks detail modal
   - [ ] **Verify:** Full multimedia display works

---

## Files to Modify

### New Files (3)
1. `/src/components/shared-media/SharedPhotoUpload.tsx` - Photo upload component (~150 lines)
2. `/src/components/shared-media/SharedCuratedGifPicker.tsx` - GIF picker (move from `/src/components/contribute/`) (~200 lines)
3. `/src/components/shared-media/SharedVideoUpload.tsx` - Video upload component (~200 lines)

### Modified Files (4)
1. `/src/app/m/[shareCode]/contribute/ContributeForm.tsx` - Refactor to use shared components (~600 lines, down from 842)
2. `/src/app/create/CreateForm.tsx` - Add multimedia support (~650 lines, up from 532)
3. `/src/app/api/memorypops/create/route.ts` - Handle multimedia upload (~200 lines, up from ~100)
4. `/src/components/contribute/CuratedGifPicker.tsx` - Delete (moved to shared location)

### Total Changes
- **New:** 3 files (~550 lines)
- **Modified:** 4 files (~300 lines changed)
- **Deleted:** 1 file (~200 lines removed)
- **Net:** ~650 lines added

---

## Estimated Effort

**Complexity:** High ⚠️

**Time estimate:** 6-8 hours

**Breakdown:**
- Extract SharedPhotoUpload: 1.5 hours
- Move/refactor SharedCuratedGifPicker: 1 hour
- Extract SharedVideoUpload: 2 hours
- Refactor ContributeForm: 1 hour
- Update CreateForm: 1.5 hours
- Update API endpoint: 2 hours
- Testing: 1 hour

**Skills required:**
- React component design
- File upload handling
- Supabase Storage API
- FormData API
- HMAC generation
- TypeScript

---

## Risks & Considerations

**1. File Upload Complexity**
- Multiple file uploads in single request
- Large file sizes (50MB videos)
- Network reliability
- Upload progress tracking

**2. State Management**
- Complex state for multimedia across 3 steps
- Preview URL cleanup (memory leaks)
- Error state synchronization

**3. API Changes**
- FormData vs JSON body (breaking change)
- File size limits on server
- Supabase Storage quota

**4. Backwards Compatibility**
- Existing MemoryPops without creator memory
- Database schema (nullable fields)
- Migration path

**5. UX Concerns**
- Long upload times
- Mobile experience (large files)
- Error recovery (partial uploads)

---

## Rollout Strategy

### Phase A: Shared Components (Day 1-2)
1. Extract SharedPhotoUpload
2. Extract SharedVideoUpload
3. Move SharedCuratedGifPicker
4. Unit test all components

### Phase B: ContributeForm Refactor (Day 2)
1. Replace inline code with shared components
2. Test contribution flow (regression)
3. Deploy to staging

### Phase C: CreateForm Update (Day 3-4)
1. Add multimedia state and UI
2. Update submit handler
3. Test creation flow
4. Deploy to staging

### Phase D: API Update (Day 4-5)
1. Accept FormData
2. Upload files to Supabase
3. Create first memory
4. Test end-to-end
5. Deploy to production

### Phase E: Monitoring & Fixes (Day 5-6)
1. Monitor error rates
2. Fix edge cases
3. Optimize upload performance
4. Update documentation

---

## Success Metrics

**Adoption:**
- % of new MemoryPops with creator multimedia
- Average multimedia count per creator memory

**Quality:**
- Creator memory upload success rate
- Error rate for multimedia uploads
- P95 upload time

**Experience:**
- Creator satisfaction (survey)
- Contributor parity (same features)
- Recipient experience (multimedia richness)

---

## Summary

**Phase 4 status:** ⚠️ Specification complete, requires 6-8 hours development

**What's documented:**
- ✅ Architecture decision (shared components)
- ✅ Component specifications with props
- ✅ Step-by-step implementation guide
- ✅ Code examples for all changes
- ✅ API endpoint updates
- ✅ Testing checklist
- ✅ Risk analysis
- ✅ Rollout strategy

**What's needed:**
- ⏸️ Developer implements shared components
- ⏸️ Developer refactors ContributeForm
- ⏸️ Developer updates CreateForm
- ⏸️ Developer modifies API endpoint
- ⏸️ QA tests full creator → contributor → recipient flow

---

## Recommendation

**Do NOT rush Phase 4 implementation.**

This is a significant refactoring that requires:
- Careful component design
- Thorough testing
- Staged rollout

**Alternative approach:**
- Complete Phases 5 & 6 (already done ✅)
- Skip Phase 3 GIFs for now (requires founder action)
- Skip Phase 4 creator multimedia (requires 6-8 hours dev)
- Perform browser testing with current state
- Return Phase 3 & 4 as post-launch improvements

**Why:**
- Phases 5 & 6 fix critical bugs (reveal consolidation, music lifecycle)
- Phase 3 & 4 are enhancements, not fixes
- Rushing complex refactors increases bug risk
- Better to ship stable fixes now, enhancements later

---

**Status:** Phase 4 specification complete, awaiting development decision ⏸️
