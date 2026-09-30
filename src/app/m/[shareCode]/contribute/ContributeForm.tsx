"use client";

import { ChangeEvent, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCelebrationExperience, type CelebrationExperience } from "@/lib/celebrationExperience";
import { ShareButtons } from "@/components/ShareButtons";
import { trackEvent } from "@/lib/analytics";
import { getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";
import type { MediaItem, VideoMedia } from "@/components/memory-experience/types";
import CuratedGifPicker from "@/components/contribute/CuratedGifPicker";
import type { CuratedGif } from "@/lib/curatedGifs";
import { getContributionLimits } from "@/config/plus";

interface Props {
  shareCode: string;
  recipientName: string;
  occasion: string;
  celebrationDate: string | null;
  coverStyle: string | null;
  tone: string | null;
  isPremium: boolean;
}

export default function ContributeForm({
  shareCode,
  recipientName,
  occasion,
  celebrationDate,
  coverStyle,
  tone,
  isPremium,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // Get tier-specific contribution limits
  const limits = useMemo(() => getContributionLimits(isPremium), [isPremium]);

  // Multimedia state (tier-based: Standard 3/1/15s, Plus 10/3/90s)
  const [photos, setPhotos] = useState<Array<{file: File; preview: string; uploading: boolean}>>([]);
  const [selectedCuratedGif, setSelectedCuratedGif] = useState<CuratedGif | null>(null);
  const [video, setVideo] = useState<{file: File; preview: string; duration: number; uploading: boolean} | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [contributorCount, setContributorCount] = useState<number>(0);

  // Upload progress and errors per media type
  const [uploadErrors, setUploadErrors] = useState<{photos?: string; gifs?: string; video?: string}>({});

  const nameInputRef = useRef<HTMLInputElement>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaPreviewRef = useRef<HTMLDivElement>(null);
  const errorMessageRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Derive celebration experience from props (no database query needed)
  const celebrationExperience = useMemo<CelebrationExperience>(() => {
    return getCelebrationExperience({
      occasion,
      mood: tone,
      recipientName,
    });
  }, [occasion, tone, recipientName]);

  // Get adaptive theme for celebration timeline and narrative
  // This ensures text is readable on both light and dark gradients
  const contributorTheme = useMemo(() => {
    return getCoverTheme(coverStyle);
  }, [coverStyle]);

  // Photo upload handler (tier-based limits)
  function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Validate count (tier-based: Standard 3, Plus 10)
    const remainingSlots = limits.photos - photos.length;
    if (files.length > remainingSlots) {
      setUploadErrors(prev => ({
        ...prev,
        photos: `You can add up to ${limits.photos} photos. You have ${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} remaining.`
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

    // Scroll to reveal previews
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mediaPreviewRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    });
  }

  // Curated GIF selection handler
  function handleCuratedGifSelect(gif: CuratedGif) {
    setSelectedCuratedGif(gif);
    setUploadErrors(prev => ({...prev, gifs: undefined}));
  }

  function handleCuratedGifRemove() {
    setSelectedCuratedGif(null);
  }

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

      // Handle invalid/non-finite duration gracefully
      if (!Number.isFinite(duration) || duration <= 0) {
        setUploadErrors(prev => ({
          ...prev,
          video: 'Could not determine video duration. The file may be corrupted.'
        }));
        URL.revokeObjectURL(videoElement.src);
        return;
      }

      if (duration > limits.videoSeconds) {
        const tierName = isPremium ? 'MemoryPop Plus' : 'Standard MemoryPops';
        setUploadErrors(prev => ({
          ...prev,
          video: `Video is ${duration.toFixed(1)} seconds long. ${tierName} have a ${limits.videoSeconds}-second video limit.`
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
        uploading: false,
      });

      // Scroll to reveal preview
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mediaPreviewRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        });
      });
    } catch (error) {
      setUploadErrors(prev => ({
        ...prev,
        video: 'Could not read video. Please ensure it is a valid video file.'
      }));
      URL.revokeObjectURL(videoElement.src);
    }
  }

  // Upload media to Supabase (photos, GIFs, video)
  async function uploadMediaToSupabase(
    file: File,
    mediaType: 'photo' | 'gif' | 'video'
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

  // Remove photo by index
  function removePhoto(index: number) {
    setPhotos(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview); // Clean up blob URL
      updated.splice(index, 1);
      return updated;
    });
  }

  // Remove GIF
  function removeGif() {
    setSelectedCuratedGif(null);
  }

  // Remove video
  function removeVideo() {
    if (video) {
      URL.revokeObjectURL(video.preview);
    }
    setVideo(null);
  }

  async function handleSubmit() {
    if (!name || !message) {
      setSubmitError("Please enter your name and message");

      // Scroll to first empty required field
      requestAnimationFrame(() => {
        if (!name && nameInputRef.current) {
          nameInputRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          nameInputRef.current.focus();
        } else if (!message && messageTextareaRef.current) {
          messageTextareaRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          messageTextareaRef.current.focus();
        }
      });

      return;
    }

    setSubmitError(""); // Clear any previous errors
    setIsSubmitting(true);

    try {
      // Upload all media to Supabase
      const uploadedPhotos: MediaItem[] = [];
      const uploadedGifs: MediaItem[] = [];
      let uploadedVideo: VideoMedia | null = null;

      // Upload photos (parallel uploads for better UX)
      if (photos.length > 0) {
        const photoUploads = await Promise.all(
          photos.map(photo => uploadMediaToSupabase(photo.file, 'photo'))
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

      // Add curated GIF (no upload needed - using stable Giphy URLs for beta)
      if (selectedCuratedGif) {
        uploadedGifs.push({
          url: selectedCuratedGif.url,
          uploaded_at: new Date().toISOString(),
          file_size_bytes: 0, // Unknown for curated GIFs (acceptable for beta)
        });
      }

      // Upload video (with server-side duration validation and signed proof)
      if (video) {
        const videoResult = await uploadMediaToSupabase(video.file, 'video');
        if (videoResult) {
          // CRITICAL: Only accept server-validated duration with proof
          // Do not fall back to client metadata
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
            duration_seconds: videoResult.duration, // Authoritative server-validated duration
            validation_proof: videoResult.validationProof, // Server-generated signed proof
          };
        } else {
          throw new Error('Video upload failed');
        }
      }

      // Call API to insert memory with JSONB multimedia (server-side)
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareCode,
          contributorName: name,
          message,
          photos: uploadedPhotos,
          gifs: uploadedGifs,
          video: uploadedVideo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setSubmitError(errorData.error || "Failed to save memory");
        setIsSubmitting(false);

        // Scroll to error message
        requestAnimationFrame(() => {
          errorMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        });

        return;
      }

      const data = await response.json();
      const memoryCount = data.memoryCount || 0;
      const memorypopId = data.memorypopId;

      setContributorCount(memoryCount);

      // Track contribution_submitted event with multimedia metadata
      trackEvent('contribution_submitted', {
        share_code: shareCode,
        memorypop_id: memorypopId,
        occasion: occasion,
        recipient_name: recipientName,
        contributor_name: name,
        has_photos: uploadedPhotos.length > 0,
        photo_count: uploadedPhotos.length,
        has_gif: selectedCuratedGif !== null,
        has_video: uploadedVideo !== null,
        message_length: message.length,
        contributor_count: memoryCount,
      });

      // Show success state instead of immediate redirect
      setSubmitSuccess(true);
      setIsSubmitting(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setSubmitError(errorMessage);
      setIsSubmitting(false);

      // Scroll to error message
      requestAnimationFrame(() => {
        errorMessageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    }
  }

  // Date formatting and calculation helpers
  function formatCelebrationDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  }

  function getTimelineMessage(dateString: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    const celebration = new Date(dateString);
    celebration.setHours(0, 0, 0, 0);

    const diffTime = celebration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} until the celebration`;
    } else if (diffDays === 0) {
      return "Today is the celebration!";
    } else {
      return "This celebration has been preserved forever";
    }
  }

  // v2: Use occasion-specific contribute narrative from composition layer
  // This replaces the generateNarrative function with centralized copy
  const narrative = celebrationExperience?.contributeNarrative;

  // v2: Success state - show thank you message after contribution
  if (submitSuccess && celebrationExperience?.successMessage) {
    let progressMessage = "";
    let progressEmoji = "";

    if (contributorCount === 1) {
      progressEmoji = "🎉";
      progressMessage = "You're the first contributor! Your memory started something special.";
    } else if (contributorCount >= 2 && contributorCount <= 4) {
      progressEmoji = "💕";
      progressMessage = `You're contributor #${contributorCount}. ${contributorCount - 1} other ${contributorCount === 2 ? 'person has' : 'people have'} already shared memories.`;
    } else if (contributorCount >= 5) {
      progressEmoji = "❤️";
      progressMessage = `${contributorCount} people have already contributed. This celebration is growing!`;
    }

    return (
      <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl text-center">
            <p className="text-6xl mb-6">{celebrationExperience.emoji}</p>
            <h1 className="text-3xl font-bold text-[#2B1E18] mb-4">
              {celebrationExperience.successMessage.title}
            </h1>
            <p className="text-lg leading-relaxed text-[#6B5B52] mb-8">
              {celebrationExperience.successMessage.message}
            </p>

            {/* Progress Celebration */}
            {contributorCount > 0 && progressMessage && (
              <div className="mt-8 rounded-xl bg-[#FFF8F2] border border-[#F0DED2] p-6">
                <p className="text-4xl mb-3">{progressEmoji}</p>
                <p className="text-base leading-relaxed text-[#4A372F]">
                  {progressMessage}
                </p>
              </div>
            )}

            {/* Viral Loop CTA */}
            <div className="mt-10 rounded-xl bg-[#FFF1EC] border border-[#FFD4CC] p-6">
              <p className="text-3xl mb-3">💌</p>
              <h2 className="text-xl font-bold text-[#2B1E18] mb-2">
                Invite Another Friend
              </h2>
              <p className="text-sm leading-relaxed text-[#6B5B52] mb-4">
                Help make this celebration even more special by inviting someone else who knows {recipientName || 'them'}.
              </p>
              <div className="flex justify-center">
                <ShareButtons
                  shareLink={`${typeof window !== 'undefined' ? window.location.origin : ''}/m/${shareCode}/contribute`}
                  recipient={recipientName}
                  whatsappMessage={celebrationExperience.whatsappMessage}
                  shareCode={shareCode}
                />
              </div>
            </div>

            <a
              href={`/m/${shareCode}?view=browse`}
              className="mt-8 inline-block rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white active:ring-2 active:ring-white active:ring-offset-2 transition-all"
            >
              View All Memories
            </a>

            {/* Product Discovery - Organic Growth Opportunity */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#6B5B52] mb-2">
                Want to create your own MemoryPop for someone special?
              </p>
              <a
                href="/"
                className="inline-block text-sm text-[#FF6B57] underline hover:text-[#e05a47] transition-colors"
              >
                Create Your Own MemoryPop
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto max-w-2xl">

        {/* Celebration Timeline */}
        {celebrationDate && (
          <div
            className="mb-8 rounded-[2rem] p-6 shadow-xl text-center border-2 border-[#F0DED2]"
            style={getCoverHeroStyle(coverStyle)}
          >
            <p className="text-3xl mb-2">{celebrationExperience?.emoji || "🎉"}</p>
            <p
              className="text-xl font-bold"
              style={{ color: contributorTheme.primaryText }}
            >
              {recipientName}&apos;s {occasion.toLowerCase()}
            </p>
            <p
              className="text-lg mt-1"
              style={{ color: contributorTheme.secondaryText }}
            >
              {formatCelebrationDate(celebrationDate)}
            </p>
            <p
              className="text-md font-semibold mt-2"
              style={{ color: contributorTheme.accentText }}
            >
              {getTimelineMessage(celebrationDate)}
            </p>
          </div>
        )}

        {/* Narrative Block - v2: Enhanced with 4th line "why it matters" */}
        {narrative && (
          <div
            className="mb-8 rounded-[2rem] p-8 shadow-xl text-center"
            style={getCoverHeroStyle(coverStyle)}
          >
            <p className="text-5xl">{celebrationExperience?.emoji}</p>
            <div className="mt-6 space-y-4">
              <p
                className="text-lg leading-relaxed"
                style={{ color: contributorTheme.primaryText }}
              >
                {narrative.line1}
              </p>
              <p
                className="text-lg leading-relaxed"
                style={{ color: contributorTheme.secondaryText }}
              >
                {narrative.line2}
              </p>
              {narrative.line3 && (
                <p
                  className="text-lg leading-relaxed font-semibold"
                  style={{ color: contributorTheme.primaryText }}
                >
                  {narrative.line3}
                </p>
              )}
              {narrative.line4 && (
                <p
                  className="text-lg leading-relaxed font-semibold"
                  style={{ color: contributorTheme.accentText }}
                >
                  {narrative.line4}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contribution Form */}
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <p className="text-center text-5xl">{celebrationExperience?.emoji || "❤️"}</p>

          <h1 className="mt-6 text-center text-4xl font-bold">
            {celebrationExperience?.contributorHeadline}
          </h1>

          <p className="mt-4 text-center text-[#6B5B52]">
            {celebrationExperience?.contributorSupportingText}
          </p>

          <label className="mt-8 block font-semibold">Your Name</label>

          <input
            ref={nameInputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={celebrationExperience?.formPlaceholders?.name || "e.g. Mum"}
            className="mt-3 w-full rounded-2xl border border-[#F0DED2] px-5 py-4 outline-none focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57] focus:ring-opacity-50"
          />

          <label className="mt-8 block font-semibold">{celebrationExperience?.contributorPrompt}</label>

          <textarea
            ref={messageTextareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={celebrationExperience?.formPlaceholders?.message || celebrationExperience?.contributorPlaceholder}
            className="mt-3 min-h-40 w-full rounded-2xl border border-[#F0DED2] px-5 py-4 outline-none focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57] focus:ring-opacity-50"
          />

          {/* Message Starters - P0: Guided Contribution */}
          {celebrationExperience?.messageStarters && celebrationExperience.messageStarters.length > 0 && (
            <div className="mt-6">
              <label className="block font-semibold text-sm text-[#6B5B52] mb-3">
                Need inspiration? Try one of these:
              </label>
              <div className="space-y-2">
                {celebrationExperience.messageStarters.map((starter, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMessage(starter);
                      const textarea = document.querySelector('textarea');
                      if (textarea) {
                        textarea.focus();
                        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="w-full text-left rounded-xl border border-[#F0DED2] bg-white px-4 py-3 text-[#4A372F] hover:border-[#FF6B57] hover:bg-[#FFF1EC] active:ring-2 active:ring-[#FF6B57] transition-all"
                  >
                    <span className="text-sm leading-relaxed">{starter}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[#6B5B52] italic">
                Click any message above to use it as a starting point. You can edit it to make it your own.
              </p>
            </div>
          )}

          {/* Standard Multimedia Section */}
          <div ref={mediaPreviewRef} className="mt-10 pt-6 border-t-2 border-[#F0DED2]">
            <h2 className="text-2xl font-bold text-[#2B1E18] mb-2">
              ✨ Bring It to Life (Optional)
            </h2>
            <p className="text-sm text-[#6B5B52] mb-6">
              Add photos, a GIF, or a video to make your memory even more special. All are optional, but they help {recipientName || 'them'} feel the moment.
            </p>

            {/* Photos Section (tier-based limits) */}
            <div className="mb-8">
              <label className="block font-semibold text-[#2B1E18] mb-1">
                📸 Photos (up to {limits.photos})
              </label>
              <p className="text-sm text-[#6B5B52] mb-3">
                Share favorite moments, places you both love, or anything that captures your connection.
              </p>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handlePhotoUpload}
                disabled={photos.length >= limits.photos}
                className="block w-full rounded-2xl border border-[#F0DED2] bg-white px-5 py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {uploadErrors.photos && (
                <div className="mt-2 rounded-lg border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                  {uploadErrors.photos}
                </div>
              )}

              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-90 md:opacity-75 md:group-hover:opacity-100 transition-opacity shadow-md"
                        aria-label="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length > 0 && photos.length < limits.photos && (
                <p className="mt-2 text-xs text-[#6B5B52] italic">
                  {limits.photos - photos.length} more photo{limits.photos - photos.length === 1 ? '' : 's'} available
                </p>
              )}
            </div>

            {/* GIF Section (up to 1 - Curated Library) */}
            <div className="mb-8">
              <CuratedGifPicker
                selectedGifId={selectedCuratedGif?.id}
                onSelect={handleCuratedGifSelect}
                onRemove={handleCuratedGifRemove}
                occasion={occasion}
              />

              {uploadErrors.gifs && (
                <div className="mt-2 rounded-lg border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                  {uploadErrors.gifs}
                </div>
              )}
            </div>

            {/* Video Section (tier-based limits) */}
            <div className="mb-6">
              <label className="block font-semibold text-[#2B1E18] mb-1">
                🎥 Video (up to 1, max {limits.videoSeconds} seconds)
              </label>
              <p className="text-sm text-[#6B5B52] mb-3">
                Share a short video message or moment. {isPremium ? 'MemoryPop Plus' : 'Standard MemoryPops'} support videos up to {limits.videoSeconds} seconds.
              </p>

              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleVideoUpload}
                disabled={!!video}
                className="block w-full rounded-2xl border border-[#F0DED2] bg-white px-5 py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {uploadErrors.video && (
                <div className="mt-2 rounded-lg border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                  {uploadErrors.video}
                </div>
              )}

              {video && (
                <div className="mt-4">
                  <div className="relative group">
                    <video
                      src={video.preview}
                      controls
                      className="w-full max-w-md h-48 rounded-xl object-cover bg-black"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                      {video.duration.toFixed(1)}s
                    </div>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-90 md:opacity-75 md:group-hover:opacity-100 transition-opacity shadow-md"
                      aria-label="Remove video"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {submitError && (
            <div ref={errorMessageRef} className="mt-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-center">
              <p className="font-semibold text-red-800">Error</p>
              <p className="mt-1 text-sm text-red-600">{submitError}</p>
              <button
                onClick={() => setSubmitError("")}
                className="mt-2 text-sm text-red-600 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <button
            ref={submitButtonRef}
            onClick={handleSubmit}
            disabled={isSubmitting || !name || !message}
            className="mt-8 w-full rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed active:ring-2 active:ring-white active:ring-offset-2 transition-all"
          >
            {isSubmitting
              ? (photos.length > 0 || selectedCuratedGif !== null || video ? "Uploading media..." : "Saving...")
              : `❤️ ${celebrationExperience?.contributeCTA || "Add Memory"}`
            }
          </button>
        </div>

      </div>
    </main>
  );
}