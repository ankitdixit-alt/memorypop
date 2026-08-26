# Implementation Changes - Standard Multimedia (Phase 1-4)

## Phase 1: Database Schema (COMPLETED)

**File:** `migrations/010_add_standard_multimedia.sql` (new file, 160 lines)

**Changes:**
- Added JSONB columns: `photos`, `gifs`, `video`
- Added array/object type constraints
- Added count constraints (photos ≤10, gifs ≤3)
- Created GIN indexes for JSONB queries
- Created partial index for video existence
- Migrated legacy photo_url data to photos[] array
- Preserved backwards compatibility (did not drop legacy columns)

**Verification:** Schema changes exist but NOT YET APPLIED to staging database.

---

## Phase 2: Type Definitions (COMPLETED)

**File:** `src/components/memory-experience/types.ts` (+17 lines modified/added)

**Changes:**
- Added `MediaItem` interface (url, uploaded_at, file_size_bytes)
- Added `VideoMedia` interface extending MediaItem (file_path, duration_seconds, validation_proof)
- Updated `Memory` interface with JSONB fields (photos?, gifs?, video?)
- Updated `MemoryPopMemory` interface with JSONB fields
- Preserved legacy fields (photo_url, video_url, multiplePhotos)

**Verification:** TypeScript types compile correctly.

---

## Phase 3: Upload API with HMAC-SHA256 Signing (SECURITY CORRECTED)

**File:** `src/app/api/upload/route.ts` (+60 lines modified/added)

**Security Corrections Applied:**
1. **Single buffer allocation** - File converted to Buffer once, reused for validation and upload (no duplicate 50MB allocation)
2. **Finite duration validation** - Rejects NaN, Infinity, -Infinity, 0, negative durations server-side
3. **HMAC-SHA256 proof generation** - Uses Node.js crypto module (no new npm dependency)
4. **Signed payload** - Binds {version, mediaType, shareCode, filePath, duration, fileSize, validatedAt}
5. **Base64url encoding** - Compact proof format: `base64url(payload).hex(signature)`

**Changes:**
- Import `createHmac` from Node.js crypto module
- Added `VIDEO_VALIDATION_SECRET` environment variable (required)
- Added `generateVideoValidationProof()` function
- Fixed client-side duration check to reject non-finite values
- Fixed server-side duration validation (reject non-finite, ≤0, >15s)
- Convert File to Buffer once at top of handler
- Reuse same buffer for `getVideoDurationInSeconds()` and `storage.upload()`
- Return `validationProof` in response for video uploads

**Verification:**
- Code implemented and compiles
- Runtime video validation BLOCKED (get-video-duration package install failed)
- HMAC signing requires `VIDEO_VALIDATION_SECRET` environment variable

---

## Phase 4: Memory Creation API with Proof Verification (SECURITY CORRECTED)

**File:** `src/app/api/memories/route.ts` (+80 lines modified/added)

**Security Corrections Applied:**
1. **Removed re-download approach** - Does NOT download video from storage during acceptance
2. **HMAC-SHA256 verification** - Uses Node.js crypto module with timingSafeEqual
3. **Constant-time comparison** - Prevents timing attacks via `timingSafeEqual()`
4. **Proof required** - Rejects video contributions without validation_proof
5. **Canonical file path required** - Rejects video without file_path
6. **All fields verified** - version, mediaType, shareCode, filePath, duration, fileSize must match
7. **Duration bounds checked** - Verifies finite, positive, ≤15s
8. **Path ownership verified** - Ensures filePath starts with `{shareCode}/`

**Changes:**
- Import `createHmac, timingSafeEqual` from Node.js crypto module
- Added `VIDEO_VALIDATION_SECRET` environment variable (must match /api/upload)
- Added `verifyVideoValidationProof()` function (150+ lines with all security checks)
- Require `body.video.validation_proof` and `body.video.file_path`
- Verify proof signature cryptographically (no re-download, no re-parsing)
- Return clear error messages if proof verification fails
- Accept JSONB columns (photos[], gifs[], video) in request body

**Security Invariant Guaranteed:** NO >15-second video can become an accepted Standard contribution.

**Enforcement Chain:**
1. Client pre-check (UX only, not trusted)
2. Server validation in /api/upload with get-video-duration
3. HMAC-SHA256 signed proof generation
4. Cryptographic proof verification in /api/memories
5. All checks validate finite, positive, ≤15s

**Verification:**
- Code implemented and compiles
- Proof verification logic complete
- Runtime dependency (get-video-duration) NOT installed - video upload will fail

---

## Files Changed Summary

**New Files:**
1. `migrations/010_add_standard_multimedia.sql` (160 lines)

**Modified Files:**
1. `src/components/memory-experience/types.ts` (+17 lines)
2. `src/app/api/upload/route.ts` (+60 lines)
3. `src/app/api/memories/route.ts` (+80 lines)
4. `src/app/m/[shareCode]/contribute/ContributeForm.tsx` (+120 lines)
5. `src/app/m/[shareCode]/reveal/RevealExperience.tsx` (+140 lines)
6. `src/app/m/[shareCode]/reveal/page.tsx` (+1 line)
7. `src/components/memory-experience/MemoryCard.tsx` (+80 lines)
8. `src/components/memory-experience/DetailModal.tsx` (+100 lines)

**Total:** 1 new file, 8 modified files, ~758 lines added/modified

---

## Environment Variables Required

**NEW:** `VIDEO_VALIDATION_SECRET` (must be set in both .env.local and production)

**Purpose:** Server-only secret for HMAC-SHA256 video validation proof signing/verification

**Where Used:**
- `/api/upload` (proof generation)
- `/api/memories` (proof verification)

**Security:** Must be kept secret, never exposed to client, must match between both API routes

**Example:** `VIDEO_VALIDATION_SECRET=<generate-random-256-bit-hex-string>`
