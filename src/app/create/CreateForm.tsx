"use client";
import { ChangeEvent, useState, useMemo, useEffect } from "react";
import { getCelebrationExperience } from "@/lib/celebrationExperience";
import { getCoverTheme } from "@/lib/coverTheme";
import { trackEvent } from "@/lib/analytics";
import { trackCreateStarted } from "@/lib/analytics-ga4";
import { type CelebrationMood } from "@/lib/celebrationMood";
import { getOccasionConfig } from "@/lib/occasionExperience";
import OccasionSelector from "@/components/OccasionSelector";
import MoodSelector from "@/components/MoodSelector";
import CuratedGifPicker from "@/components/contribute/CuratedGifPicker";
import type { CuratedGif } from "@/lib/curatedGifs";
import type { MediaItem, VideoMedia } from "@/components/memory-experience/types";

interface CreateFormProps {
  initialOccasion: string;
}

export default function CreateForm({ initialOccasion }: CreateFormProps) {
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState(initialOccasion);
  const [recipient, setRecipient] = useState("");
  const [story, setStory] = useState("");
  const [mood, setMood] = useState<CelebrationMood | null>(null); // Required, no default
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedCover, setSelectedCover] = useState("none");
  const [celebrationDate, setCelebrationDate] = useState("");
  const [showOccasionSelector, setShowOccasionSelector] = useState(false);

  // Phase 4: Creator multimedia state (matching contributor pattern)
  const [creatorName, setCreatorName] = useState("");
  const [photos, setPhotos] = useState<Array<{file: File; preview: string}>>([]);
  const [selectedCuratedGif, setSelectedCuratedGif] = useState<CuratedGif | null>(null);
  const [video, setVideo] = useState<{file: File; preview: string; duration: number} | null>(null);
  const [uploadErrors, setUploadErrors] = useState<{photos?: string; gifs?: string; video?: string}>({});

  const progress = (step / 3) * 100; // 3 steps (1, 2, 3)

  // Track creation funnel entry
  useEffect(() => {
    // Determine source from referrer or URL params
    const referrer = document.referrer;
    let source = 'direct';

    if (referrer.includes('birthday-memory-book')) {
      source = 'landing_page_birthday';
    } else if (referrer.includes('retirement-memory-book')) {
      source = 'landing_page_retirement';
    } else if (referrer.includes('farewell-memory-book')) {
      source = 'landing_page_farewell';
    } else if (referrer.includes('occasions')) {
      source = 'occasions_page';
    } else if (referrer) {
      source = 'referral';
    }

    // Track with Mixpanel (existing)
    trackEvent('create_started', {
      page_path: '/create',
      source_page: referrer || undefined,
      occasion: occasion,
    });

    // Track with GA4 (Phase 2C)
    trackCreateStarted(source, occasion);
  }, [occasion]);

  // Clear mood if it becomes invalid for the new occasion
  useEffect(() => {
    if (!mood || !occasion) return;

    const occasionConfig = getOccasionConfig(occasion);
    const validAtmospheres = occasionConfig.atmospheres;

    // If current mood is not in the list of valid atmospheres for this occasion, clear it
    if (!validAtmospheres.includes(mood)) {
      setMood(null);
    }
  }, [occasion, mood]);

  // Get composed celebration experience (occasion + mood)
  const celebrationExperience = useMemo(() => {
    if (occasion && recipient) {
      return getCelebrationExperience({
        occasion,
        mood: mood,
        recipientName: recipient
      });
    }
    return null;
  }, [occasion, mood, recipient]);

  // Get adaptive theme for preview
  // Text colors adapt to selected cover style background
  const previewTheme = useMemo(() => {
    return getCoverTheme(selectedCover);
  }, [selectedCover]);

  // Phase 4: Creator multimedia handlers (reuse contributor validation logic)
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
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  }

  function removePhoto(index: number) {
    setPhotos(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  function handleCuratedGifSelect(gif: CuratedGif) {
    setSelectedCuratedGif(gif);
    setUploadErrors(prev => ({...prev, gifs: undefined}));
  }

  function handleCuratedGifRemove() {
    setSelectedCuratedGif(null);
  }

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

    // Validate file size
    if (file.size > 50 * 1024 * 1024) {
      setUploadErrors(prev => ({
        ...prev,
        video: 'Video must be under 50MB.'
      }));
      return;
    }

    // Client-side duration check (UX only, server will validate authoritatively)
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';

    try {
      await new Promise<void>((resolve, reject) => {
        videoElement.onloadedmetadata = () => resolve();
        videoElement.onerror = () => reject(new Error('Could not load video'));
        videoElement.src = URL.createObjectURL(file);
      });

      const duration = videoElement.duration;

      if (!Number.isFinite(duration) || duration <= 0) {
        setUploadErrors(prev => ({
          ...prev,
          video: 'Could not determine video duration. The file may be corrupted.'
        }));
        URL.revokeObjectURL(videoElement.src);
        return;
      }

      if (duration > 15) {
        setUploadErrors(prev => ({
          ...prev,
          video: `Video is ${duration.toFixed(1)} seconds long. Standard MemoryPops have a 15-second video limit.`
        }));
        URL.revokeObjectURL(videoElement.src);
        return;
      }

      // Clear errors
      setUploadErrors(prev => ({...prev, video: undefined}));

      setVideo({
        file,
        preview: URL.createObjectURL(file),
        duration,
      });
    } catch (error) {
      setUploadErrors(prev => ({
        ...prev,
        video: 'Could not read video. Please ensure it is a valid video file.'
      }));
      URL.revokeObjectURL(videoElement.src);
    }
  }

  function removeVideo() {
    if (video) {
      URL.revokeObjectURL(video.preview);
    }
    setVideo(null);
  }

  // Upload media to Supabase (reuse /api/upload endpoint from contributor flow)
  async function uploadMediaToSupabase(
    file: File,
    mediaType: 'photo' | 'video',
    shareCode: string
  ): Promise<{
    url: string;
    filePath: string;
    fileSize: number;
    duration?: number;
    validationProof?: string;
  } | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('shareCode', shareCode);
      formData.append('mediaType', mediaType);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        console.error('Upload error:', errorData.error);
        return null;
      }

      const data = await response.json();
      return {
        url: data.publicUrl,
        filePath: data.filePath,
        fileSize: data.fileSize,
        duration: data.duration, // Only present for videos
        validationProof: data.validationProof, // Only present for videos
      };
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  }

  async function saveMemoryPop() {
    setCreateError("");
    setIsCreating(true);

    try {
      // Step 1: Create MemoryPop (existing logic)
      const response = await fetch('/api/memorypops/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_name: recipient,
          occasion,
          story,
          tone: mood,
          celebration_date: celebrationDate || null,
          cover_style: selectedCover,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setIsCreating(false);
        setCreateError(result.error || 'Failed to create MemoryPop');
        return;
      }

      const shareCode = result.shareCode;

      // Step 2: If creator has multimedia, create first memory (Phase 4)
      const hasMultimedia = photos.length > 0 || selectedCuratedGif || video;

      if (hasMultimedia) {
        try {
          // Upload photos
          const uploadedPhotos: MediaItem[] = [];
          if (photos.length > 0) {
            const photoUploads = await Promise.all(
              photos.map(photo => uploadMediaToSupabase(photo.file, 'photo', shareCode))
            );

            for (const result of photoUploads) {
              if (result) {
                uploadedPhotos.push({
                  url: result.url,
                  uploaded_at: new Date().toISOString(),
                  file_size_bytes: result.fileSize,
                });
              } else {
                throw new Error('Photo upload failed');
              }
            }
          }

          // Add curated GIF (no upload needed - using stable CDN URLs)
          const uploadedGifs: MediaItem[] = [];
          if (selectedCuratedGif) {
            uploadedGifs.push({
              url: selectedCuratedGif.url,
              uploaded_at: new Date().toISOString(),
              file_size_bytes: 0, // Unknown for curated GIFs
            });
          }

          // Upload video (with server-side validation and HMAC)
          let uploadedVideo: VideoMedia | null = null;
          if (video) {
            const videoResult = await uploadMediaToSupabase(video.file, 'video', shareCode);
            if (videoResult) {
              // CRITICAL: Only accept server-validated duration with proof
              if (typeof videoResult.duration !== 'number') {
                throw new Error('Video duration validation failed. Please try again.');
              }

              if (!videoResult.validationProof) {
                throw new Error('Video validation proof missing. Please try again.');
              }

              uploadedVideo = {
                url: videoResult.url,
                file_path: videoResult.filePath,
                uploaded_at: new Date().toISOString(),
                file_size_bytes: videoResult.fileSize,
                duration_seconds: videoResult.duration,
                validation_proof: videoResult.validationProof,
              };
            } else {
              throw new Error('Video upload failed');
            }
          }

          // Create first memory via /api/memories (reuse contributor endpoint)
          const memoryResponse = await fetch('/api/memories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shareCode,
              contributorName: creatorName || 'From the creator',
              message: story,
              photos: uploadedPhotos,
              gifs: uploadedGifs,
              video: uploadedVideo,
            }),
          });

          if (!memoryResponse.ok) {
            const errorData = await memoryResponse.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || 'Failed to save creator memory');
          }
        } catch (multimediaError) {
          // Multimedia upload failed, but MemoryPop was created
          // Log error but continue to success page (MemoryPop is valid without multimedia)
          console.error('Creator multimedia upload failed:', multimediaError);
          setCreateError('MemoryPop created, but multimedia upload failed. You can add memories later.');
        }
      }

      // Step 3: Track and redirect
      const referrer = document.referrer;
      const fromLandingPage = referrer.includes('birthday-memory-book') ||
        referrer.includes('retirement-memory-book') ||
        referrer.includes('farewell-memory-book');

      // Track create_completed event (Mixpanel) - Phase 4: include multimedia tracking
      trackEvent('create_completed', {
        share_code: shareCode,
        occasion: occasion,
        recipient_name: recipient,
        celebration_date: celebrationDate || null,
        mood: mood,
        has_story: !!story,
        has_photos: photos.length > 0,
        photo_count: photos.length,
        has_gif: !!selectedCuratedGif,
        has_video: !!video,
        has_creator_multimedia: hasMultimedia,
        creator_name_provided: !!creatorName,
        selected_cover: selectedCover,
        from_landing_page: fromLandingPage,
      });

      // Track create_completed event (GA4)
      const { trackCreateCompleted } = await import('@/lib/analytics-ga4');
      trackCreateCompleted(shareCode, occasion, fromLandingPage);

      // Redirect to success page
      window.location.href = `/success?shareCode=${shareCode}&token=${result.managementToken}&recipient=${encodeURIComponent(
        recipient
      )}&occasion=${encodeURIComponent(occasion)}`;

    } catch (error) {
      setIsCreating(false);
      setCreateError('Network error. Please try again.');
      console.error('Create error:', error);
    }
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <main className="min-h-screen bg-[#FFF8F2] text-[#2B1E18]">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
        <div className="mb-6">
          {step > 1 && (
            <button
              onClick={goBack}
              className="mb-4 text-sm font-semibold text-[#6B5B52] hover:text-[#FF6B57]"
            >
              ← Back
            </button>
          )}

          <p className="text-sm font-semibold text-[#FF6B57]">
            {step === 1 && (celebrationExperience?.progressLabel || "🌱 Starting the celebration")}
            {step === 2 && "💛 Making it personal"}
            {step === 3 && "🎉 Ready to celebrate"}
          </p>

          <div className="mt-3 h-2 rounded-full bg-[#F0DED2]">
            <div
              className="h-2 rounded-full bg-[#FF6B57] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-[#6B5B52]">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <section className="rounded-[2rem] bg-white p-8 shadow-xl">
            <h1 className="text-4xl font-bold">Start a MemoryPop</h1>
            <p className="mt-4 text-gray-600">
              {recipient
                ? `Let's create one beautiful celebration ${recipient} will never forget.`
                : (celebrationExperience?.helperText || "Let's create one beautiful celebration your loved one will never forget.")}
            </p>

            <label className="mt-8 block font-semibold">What are we celebrating?</label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                "Birthday",
                "Anniversary",
                "Wedding",
                "New Baby",
                "Graduation",
                "Retirement",
                "Farewell",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setOccasion(item)}
                  className={`rounded-2xl border p-4 text-left font-semibold transition-all ${
                    occasion === item
                      ? "border-[#FF6B57] bg-[#FFF1EC]"
                      : "border-[#F0DED2]"
                  } active:ring-2 active:ring-[#FF6B57] active:ring-offset-1`}
                >
                  {item === "Birthday" ? "🎂 " : ""}
                  {item}
                </button>
              ))}
            </div>

            {/* View All Occasions Button */}
            <button
              type="button"
              onClick={() => setShowOccasionSelector(true)}
              className="mt-4 w-full rounded-2xl border border-[#F0DED2] bg-white p-4 text-center font-semibold text-[#6B5B52] hover:border-[#FF6B57] hover:bg-[#FFF1EC] hover:text-[#FF6B57] active:ring-2 active:ring-[#FF6B57] transition-all"
            >
              View All Occasions →
            </button>

            {/* Occasion Selector Modal */}
            <OccasionSelector
              isOpen={showOccasionSelector}
              onClose={() => setShowOccasionSelector(false)}
              onSelect={(selectedOccasion) => {
                setOccasion(selectedOccasion);
                setShowOccasionSelector(false);
              }}
              currentOccasion={occasion}
            />

            <label className="mt-8 block font-semibold">Who&apos;s today&apos;s star?</label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Rahul"
              className="mt-3 w-full rounded-2xl border border-[#F0DED2] px-5 py-4 text-lg outline-none focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57] focus:ring-opacity-50"
            />

            <button
              onClick={() => setStep(2)}
              disabled={!recipient}
              className="mt-8 rounded-full bg-[#FF6B57] px-7 py-4 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed active:ring-2 active:ring-white active:ring-offset-2 transition-all"
            >
              Make it personal →
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-[2rem] bg-white p-8 shadow-xl">
            {/* Mood Selection at Top */}
            <h1 className="text-4xl font-bold">How should this celebration feel?</h1>
            <p className="mt-4 text-gray-600">
              Choose the atmosphere you&apos;d like everyone to help create.
            </p>

            <div className="mt-8 mb-8">
              <MoodSelector
                selectedMood={mood}
                onSelect={(selectedMood) => setMood(selectedMood)}
                occasion={occasion}
              />
            </div>

            {/* Visual Separation */}
            <div className="border-t border-[#F0DED2] my-8"></div>

            {/* Message Writing Section */}
            <h2 className="text-2xl font-bold">Make it personal</h2>
            <p className="mt-4 text-gray-600">
              If someone asked why {recipient} is special, what would you say?
            </p>

            {/* Message Starters */}
            {celebrationExperience?.messageStarters && (
              <div className="mt-6 mb-4">
                <label className="block font-semibold text-sm text-[#6B5B52] mb-2">
                  Need inspiration? Try one of these messages about {recipient}:
                </label>
                <div className="flex flex-col gap-2">
                  {celebrationExperience.messageStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStory(starter)}
                      className="text-left text-sm rounded-xl border border-[#F0DED2] bg-white px-4 py-3 hover:border-[#FF6B57] hover:bg-[#FFF1EC] active:ring-2 active:ring-[#FF6B57] transition-all"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={celebrationExperience?.formPlaceholders?.message || "Share your message..."}
              className="mt-8 min-h-40 w-full rounded-2xl border border-[#F0DED2] px-5 py-4 text-lg outline-none focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57] focus:ring-opacity-50"
            />

            {/* Celebration Date (Optional) */}
            <div className="mt-6">
              <label className="block font-semibold">
                Celebration Date <span className="text-gray-400">(optional)</span>
              </label>
              <p className="mt-1 text-sm text-[#6B5B52]">
                Helps contributors understand when the celebration takes place.
              </p>
              <input
                type="date"
                value={celebrationDate}
                onChange={(e) => setCelebrationDate(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-[#F0DED2] px-5 py-4 text-lg outline-none focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57] focus:ring-opacity-50"
              />
            </div>

            {/* Emoji Shortcuts */}
            {celebrationExperience?.emojiShortcuts && (
              <div className="mt-4">
                <label className="block font-semibold text-sm text-[#6B5B52] mb-2">
                  Choose a celebration icon:
                </label>
                <div className="flex flex-wrap gap-2">
                  {celebrationExperience.emojiShortcuts.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const newText = story.substring(0, start) + emoji + story.substring(end);
                          setStory(newText);
                          // Restore cursor position after emoji
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                            textarea.focus();
                          }, 0);
                        } else {
                          setStory(story + emoji);
                        }
                      }}
                      className="text-2xl w-12 h-12 rounded-lg border border-[#F0DED2] bg-white hover:border-[#FF6B57] hover:bg-[#FFF1EC] active:ring-2 active:ring-[#FF6B57] transition-all flex items-center justify-center"
                      aria-label={`Add ${emoji} emoji`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cover Presets */}
            {celebrationExperience?.coverPresets && (
              <div className="mt-6">
                <label className="block font-semibold mb-2">
                  Choose a cover style <span className="text-gray-400">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {celebrationExperience.coverPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedCover(preset.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        selectedCover === preset.id
                          ? "border-[#FF6B57] ring-2 ring-[#FF6B57] ring-offset-2"
                          : "border-[#F0DED2]"
                      } active:ring-2 active:ring-[#FF6B57] active:ring-offset-1`}
                    >
                      <div
                        className="w-full h-16 rounded-xl mb-2"
                        style={{ background: preset.gradient }}
                      />
                      <p className="font-semibold text-sm">{preset.label}</p>
                      {preset.description && (
                        <p className="text-xs text-[#6B5B52] mt-1">{preset.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 4: Creator Multimedia Section */}
            <div className="mt-8 border-t border-[#F0DED2] pt-8">
              <h2 className="text-2xl font-bold mb-2">Add Photos, GIFs, or Video (Optional)</h2>
              <p className="text-gray-600 mb-6">
                As the creator, you can be the first contributor! Add up to 3 photos, 1 GIF, and 1 video (≤15s).
              </p>

              {/* Creator Name */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Your Name</label>
                <p className="text-sm text-gray-600 mb-3">
                  So {recipient} knows who started this MemoryPop.
                </p>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full rounded-2xl border border-[#F0DED2] px-5 py-4 text-lg outline-none focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Optional — if left blank, we'll show "From the creator".
                </p>
              </div>

              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">📸 Photos (up to 3)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoUpload}
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
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
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
                  selectedGifId={selectedCuratedGif?.id}
                  onSelect={handleCuratedGifSelect}
                  onRemove={handleCuratedGifRemove}
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
                      onChange={handleVideoUpload}
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
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600"
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

            <button
              onClick={() => setStep(3)}
              disabled={!mood || !story}
              className="mt-8 rounded-full bg-[#FF6B57] px-7 py-4 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed active:ring-2 active:ring-white active:ring-offset-2 transition-all"
            >
              See your MemoryPop →
            </button>
          </section>
        )}

        {step === 3 && (
          <section className="rounded-[2rem] bg-white p-8 shadow-xl">
            <p className="text-4xl">🎁</p>
            <h1 className="mt-4 text-4xl font-bold">
              Here&apos;s your MemoryPop for {recipient}
            </h1>

            <div
              className="mt-8 overflow-hidden rounded-[1.7rem] p-8 shadow-inner"
              style={{
                background: celebrationExperience?.coverPresets?.find(p => p.id === selectedCover)?.gradient ||
                  'linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)'
              }}
            >
              <p
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: previewTheme.secondaryText }}
              >
                {occasion} MemoryPop
              </p>

              <h2
                className="mt-3 text-4xl font-bold"
                style={{ color: previewTheme.primaryText }}
              >
                For {recipient} ❤️
              </h2>

              <p
                className="mt-6 text-xl leading-9"
                style={{ color: previewTheme.primaryText }}
              >
                &ldquo;{story}&rdquo;
              </p>

              {photos.length > 0 && (
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo.preview}
                      alt="Memory"
                      className="h-28 w-full rounded-2xl object-cover shadow"
                    />
                  ))}
                </div>
              )}

              <div className="mt-8 rounded-2xl bg-white/70 p-5">
                <p className="font-semibold">Coming next</p>
                <p className="mt-2 text-sm text-[#6B5B52]">
                  Invite friends and family to add their own memories, photos and wishes.
                </p>
              </div>
            </div>

            {createError && (
              <div className="mt-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-center">
                <p className="font-semibold text-red-800">Failed to create MemoryPop</p>
                <p className="mt-1 text-sm text-red-600">{createError}</p>
                <button
                  onClick={() => setCreateError("")}
                  className="mt-2 text-sm text-red-600 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={saveMemoryPop}
                disabled={isCreating}
                className="rounded-full bg-[#FF6B57] px-7 py-4 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed active:ring-2 active:ring-white active:ring-offset-2 transition-all"
              >
                {isCreating ? "Creating..." : "Create My MemoryPop ❤️"}
              </button>
              <button className="rounded-full border border-[#F0DED2] bg-white px-7 py-4 font-semibold">
                Share MemoryPop
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
