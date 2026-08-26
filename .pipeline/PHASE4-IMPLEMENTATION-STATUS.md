# Phase 4 Implementation Status - Creator Multimedia

**Date:** 2026-08-17
**Status:** ⚠️ PARTIAL IMPLEMENTATION - REQUIRES COMPLETION

---

## What Was Completed

### 1. Shared Validation Utilities ✅ COMPLETE

**File Created:** `/src/lib/mediaValidation.ts`

**Features:**
- `validatePhotoFile()` - validates photos (type, size)
- `validateVideoFile()` - validates videos (type, size, duration)
- `getVideoDuration()` - extracts video duration
- `STANDARD_LIMITS` constant - Single source of truth for limits

**Benefits:**
- Shared validation logic between creator and contributor
- No duplicate validation code
- ONE Standard multimedia rule set

---

## What Needs To Be Completed

### 2. Update CreateForm State

**File:** `/src/app/create/CreateForm.tsx`

**Current state (line 22):**
```typescript
const [photos, setPhotos] = useState<string[]>([]);
```

**Must change to:**
```typescript
// Import at top
import type { CuratedGif } from "@/lib/curatedGifs";
import { validatePhotoFile, validateVideoFile } from "@/lib/mediaValidation";
import CuratedGifPicker from "@/components/contribute/CuratedGifPicker";

// State changes
const [creatorName, setCreatorName] = useState("");
const [photos, setPhotos] = useState<Array<{file: File; preview: string}>>([]);
const [selectedCuratedGif, setSelectedCuratedGif] = useState<CuratedGif | null>(null);
const [video, setVideo] = useState<{file: File; preview: string; duration: number} | null>(null);
const [uploadErrors, setUploadErrors] = useState<{photos?: string; gifs?: string; video?: string}>({});
```

---

### 3. Add Photo Upload Handler

**Add after line 95 (after handlePhotoUpload that currently exists):**

```typescript
function handlePhotoUploadNew(event: ChangeEvent<HTMLInputElement>) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  // Validate count
  const remainingSlots = 3 - photos.length;
  if (files.length > remainingSlots) {
    setUploadErrors(prev => ({
      ...prev,
      photos: `You can add up to 3 photos. You have ${remainingSlots} remaining.`
    }));
    return;
  }

  // Validate each file
  for (const file of files) {
    const validation = validatePhotoFile(file);
    if (!validation.valid) {
      setUploadErrors(prev => ({...prev, photos: validation.error}));
      return;
    }
  }

  setUploadErrors(prev => ({...prev, photos: undefined}));

  const newPhotos = files.map(file => ({
    file,
    preview: URL.createObjectURL(file)
  }));

  setPhotos(prev => [...prev, ...newPhotos]);
}

function handlePhotoRemove(index: number) {
  setPhotos(prev => {
    const updated = [...prev];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    return updated;
  });
}
```

---

### 4. Add Video Upload Handler

```typescript
async function handleVideoUploadNew(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (video) {
    setUploadErrors(prev => ({
      ...prev,
      video: 'You can add up to 1 video. Remove the existing video first.'
    }));
    return;
  }

  const validation = await validateVideoFile(file);
  if (!validation.valid) {
    setUploadErrors(prev => ({...prev, video: validation.error}));
    return;
  }

  setUploadErrors(prev => ({...prev, video: undefined}));

  setVideo({
    file,
    preview: URL.createObjectURL(file),
    duration: validation.duration!
  });
}

function handleVideoRemove() {
  if (video) {
    URL.revokeObjectURL(video.preview);
    setVideo(null);
  }
}
```

---

### 5. Add Multimedia UI to Step 2

**After the message textarea (around line 321), add:**

```typescript
{/* Creator Multimedia Section */}
<div className="mt-8 border-t border-[#F0DED2] pt-8">
  <h2 className="text-2xl font-bold mb-2">Add Photos, GIFs, or Video (Optional)</h2>
  <p className="text-gray-600 mb-6">
    As the creator, you can be the first contributor! Add up to 3 photos, 1 GIF, and 1 video (≤15s).
  </p>

  {/* Creator Name */}
  <div className="mb-6">
    <label className="block font-semibold mb-2">Your Name</label>
    <p className="text-sm text-gray-600 mb-3">
      This will show as the contributor name for your first memory.
    </p>
    <input
      type="text"
      value={creatorName}
      onChange={(e) => setCreatorName(e.target.value)}
      placeholder="Your name"
      className="w-full rounded-2xl border border-[#F0DED2] px-5 py-4 text-lg outline-none focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57]"
    />
  </div>

  {/* Photo Upload */}
  <div className="mb-6">
    <label className="block font-semibold mb-2">📸 Photos (up to 3)</label>
    <input
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      multiple
      onChange={handlePhotoUploadNew}
      disabled={photos.length >= 3}
      className="hidden"
      id="creator-photo-upload"
    />
    <label
      htmlFor="creator-photo-upload"
      className={`block text-center rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all ${
        photos.length >= 3
          ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
          : 'border-[#F0DED2] hover:border-[#FF6B57] hover:bg-[#FFF1EC]'
      }`}
    >
      <p className="text-lg font-semibold">
        {photos.length >= 3 ? '3/3 Photos Added' : `Add Photos (${photos.length}/3)`}
      </p>
      <p className="text-sm text-gray-600 mt-1">JPEG, PNG, or WebP • Max 10MB each</p>
    </label>

    {uploadErrors.photos && (
      <p className="mt-2 text-sm text-red-600">{uploadErrors.photos}</p>
    )}

    {/* Photo Previews */}
    {photos.length > 0 && (
      <div className="mt-4 grid grid-cols-3 gap-3">
        {photos.map((photo, idx) => (
          <div key={idx} className="relative">
            <img
              src={photo.preview}
              alt={`Photo ${idx + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handlePhotoRemove(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* GIF Picker */}
  <div className="mb-6">
    <label className="block font-semibold mb-2">🎞️ Curated GIF (up to 1)</label>
    <CuratedGifPicker
      occasion={occasion}
      selectedGif={selectedCuratedGif}
      onSelect={(gif) => {
        setSelectedCuratedGif(gif);
        setUploadErrors(prev => ({...prev, gifs: undefined}));
      }}
      onRemove={() => setSelectedCuratedGif(null)}
    />
    {uploadErrors.gifs && (
      <p className="mt-2 text-sm text-red-600">{uploadErrors.gifs}</p>
    )}
  </div>

  {/* Video Upload */}
  <div className="mb-6">
    <label className="block font-semibold mb-2">🎥 Video (up to 1, ≤15 seconds)</label>
    {!video ? (
      <>
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleVideoUploadNew}
          className="hidden"
          id="creator-video-upload"
        />
        <label
          htmlFor="creator-video-upload"
          className="block text-center rounded-2xl border-2 border-dashed border-[#F0DED2] p-8 cursor-pointer hover:border-[#FF6B57] hover:bg-[#FFF1EC] transition-all"
        >
          <p className="text-lg font-semibold">Add Video</p>
          <p className="text-sm text-gray-600 mt-1">MP4, MOV, or WebM • Max 50MB • ≤15 seconds</p>
        </label>
      </>
    ) : (
      <div className="relative">
        <video
          src={video.preview}
          controls
          className="w-full rounded-lg"
        />
        <button
          type="button"
          onClick={handleVideoRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-4 py-2"
        >
          Remove Video
        </button>
        <p className="mt-2 text-sm text-gray-600">Duration: {video.duration.toFixed(1)}s</p>
      </div>
    )}
    {uploadErrors.video && (
      <p className="mt-2 text-sm text-red-600">{uploadErrors.video}</p>
    )}
  </div>
</div>
```

---

### 6. Update saveMemoryPop() Function

**Replace existing saveMemoryPop() with:**

```typescript
async function saveMemoryPop() {
  setCreateError("");
  setIsCreating(true);

  try {
    // Build FormData (not JSON - supports file uploads)
    const formData = new FormData();

    // MemoryPop details
    formData.append('recipientName', recipient);
    formData.append('occasion', occasion);
    formData.append('tone', mood || 'simple_classic');
    formData.append('celebrationDate', celebrationDate || '');
    formData.append('coverStyle', selectedCover);

    // Creator's memory details
    formData.append('creatorName', creatorName || 'Anonymous');
    formData.append('creatorMessage', story);

    // Upload photos
    photos.forEach((photo, index) => {
      formData.append(`photo_${index}`, photo.file);
    });

    // Upload curated GIF (URL only)
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

    // Track
    trackEvent('memorypop_created', {
      occasion,
      mood,
      has_creator_multimedia: photos.length > 0 || selectedCuratedGif !== null || video !== null,
      photo_count: photos.length,
      has_gif: selectedCuratedGif !== null,
      has_video: video !== null,
    });

    // Redirect
    window.location.href = `/m/${data.memorypop.share_code}`;
  } catch (error) {
    console.error('Create error:', error);
    setCreateError(error instanceof Error ? error.message : 'Failed to create MemoryPop');
  } finally {
    setIsCreating(false);
  }
}
```

---

### 7. Update API Endpoint

**File:** `/src/app/api/memorypops/create/route.ts`

**CRITICAL CHANGES NEEDED:**

1. Change from `application/json` to `multipart/form-data` parsing
2. Upload photos to Supabase Storage
3. Upload video with HMAC validation
4. Create first memory with multimedia

**This requires significant API refactoring - see separate API implementation guide**

---

## Status Summary

**Completed:**
- ✅ Shared validation utilities

**Requires Implementation:**
- ⚠️ CreateForm state updates
- ⚠️ Photo/video upload handlers
- ⚠️ Multimedia UI in Step 2
- ⚠️ Updated saveMemoryPop() function
- ⚠️ API endpoint refactoring (MAJOR)

**Estimated Remaining Work:** 4-6 hours

---

## Critical Blocker

The API endpoint refactoring is substantial and requires:
- FormData parsing (not JSON)
- Supabase Storage integration
- Video HMAC generation
- First memory creation
- Error handling

Without browser testing, I cannot verify the full flow works correctly.

---

## Recommendation

**Option A:** Founder completes API implementation using specification
**Option B:** Defer Phase 4 to post-launch, validate Phases 1,2,5,6 first
**Option C:** External developer implements and tests full Phase 4

---

**Status:** Utilities complete, Form changes documented, API requires implementation
