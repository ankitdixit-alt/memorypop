"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { MEMORYPOP_PLUS } from "@/config/plus";

interface DashboardPlusFeaturesProps {
  isPremium: boolean;
  shareCode: string;
  memorypopId: string;
  customMusicUrl: string | null;
}

export function DashboardPlusFeatures({ isPremium, shareCode, memorypopId, customMusicUrl }: DashboardPlusFeaturesProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasClickedInterest, setHasClickedInterest] = useState(false);
  const [showBetaCodeInput, setShowBetaCodeInput] = useState(false);
  const [betaCode, setBetaCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionError, setRedemptionError] = useState("");

  // Custom music state
  const [currentMusicUrl, setCurrentMusicUrl] = useState<string | null>(customMusicUrl);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [musicUploadError, setMusicUploadError] = useState("");
  const [musicUploadSuccess, setMusicUploadSuccess] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ file: File; url: string } | null>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handle payment verification on mount if upgraded=true param
  useEffect(() => {
    const verifyPayment = async () => {
      if (searchParams.get("upgraded") === "true" && !isPremium) {
        try {
          const response = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shareCode }),
          });

          if (response.ok) {
            // Show welcome message
            setShowWelcome(true);
            // Remove upgraded param and refresh
            router.push(`/dashboard/${shareCode}`);
            router.refresh();
          }
        } catch (error) {
          console.error("Payment verification failed:", error);
        }
      } else if (searchParams.get("upgraded") === "true" && isPremium) {
        // Already premium, just show welcome message
        setShowWelcome(true);
        // Auto-dismiss after 10 seconds
        const timer = setTimeout(() => setShowWelcome(false), 10000);
        return () => clearTimeout(timer);
      }
    };

    verifyPayment();
  }, [searchParams, shareCode, isPremium, router]);

  const handleInterestClick = () => {
    // Track Plus interest event
    trackEvent('premium_interest_clicked', {
      share_code: shareCode,
      source: 'dashboard',
    });

    // Show inline success state
    setHasClickedInterest(true);
  };

  const handleBetaCodeRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedeeming(true);
    setRedemptionError("");

    try {
      // Get memorypop ID from share code
      const response = await fetch(`/api/memorypops/share/${shareCode}`);
      if (!response.ok) {
        throw new Error("Failed to fetch MemoryPop");
      }
      const { id: memorypopId } = await response.json();

      // Redeem beta code
      const redeemResponse = await fetch(`/api/memorypops/${memorypopId}/redeem-beta-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: betaCode.trim() }),
      });

      const result = await redeemResponse.json();

      if (!redeemResponse.ok) {
        setRedemptionError(result.error || "Redemption failed");
        return;
      }

      // Success - show welcome message and refresh
      trackEvent('beta_code_redeemed', {
        share_code: shareCode,
        source: 'dashboard',
      });

      setShowWelcome(true);
      router.push(`/dashboard/${shareCode}?upgraded=true`);
      router.refresh();
    } catch (error) {
      console.error("Beta code redemption error:", error);
      setRedemptionError("An unexpected error occurred. Please try again.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleMusicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a'];
    if (!allowedTypes.includes(file.type)) {
      setMusicUploadError('Only MP3 and M4A audio files are allowed.');
      return;
    }

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setMusicUploadError('File too large. Maximum size is 20MB.');
      return;
    }

    // Clear errors and show preview
    setMusicUploadError("");
    const previewUrl = URL.createObjectURL(file);
    setPreviewFile({ file, url: previewUrl });
  };

  const handleCancelPreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.url);
      setPreviewFile(null);
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (musicInputRef.current) {
      musicInputRef.current.value = '';
    }
  };

  const handleConfirmUpload = async () => {
    if (!previewFile) return;

    setIsUploadingMusic(true);
    setUploadProgress(0);
    setMusicUploadError("");
    setMusicUploadSuccess(false);

    try {
      // Step 1: Get signed upload URL
      const urlResponse = await fetch(`/api/memorypops/${memorypopId}/custom-music`);
      if (!urlResponse.ok) {
        const error = await urlResponse.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { uploadUrl, token, filePath, maxFileSize, allowedTypes } = await urlResponse.json();

      // Step 2: Upload directly to Supabase Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': previewFile.file.type,
          'x-upsert': 'true',
        },
        body: previewFile.file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Storage upload failed');
      }

      setUploadProgress(70);

      // Step 3: Validate and attach to gift
      const validateResponse = await fetch(`/api/memorypops/${memorypopId}/custom-music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      const result = await validateResponse.json();

      if (!validateResponse.ok) {
        setMusicUploadError(result.error || 'Validation failed');
        return;
      }

      setUploadProgress(100);

      // Success - cleanup preview and update state
      handleCancelPreview();
      setCurrentMusicUrl(result.storagePath); // Store path to indicate music exists
      setMusicUploadSuccess(true);

      trackEvent('custom_music_uploaded', {
        share_code: shareCode,
        file_size: result.fileSize,
        file_type: result.fileType,
      });

      // Auto-dismiss success message
      setTimeout(() => setMusicUploadSuccess(false), 5000);

      // Refresh page to update reveal
      router.refresh();
    } catch (error) {
      console.error('Music upload error:', error);
      setMusicUploadError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsUploadingMusic(false);
      setUploadProgress(0);
    }
  };

  const handleMusicRemove = async () => {
    if (!confirm('Remove custom music? Your reveal will use the default music instead.')) {
      return;
    }

    setIsUploadingMusic(true);
    setMusicUploadError("");

    try {
      const response = await fetch(`/api/memorypops/${memorypopId}/custom-music`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        setMusicUploadError(result.error || 'Failed to remove music');
        return;
      }

      // Success
      setCurrentMusicUrl(null);
      trackEvent('custom_music_removed', {
        share_code: shareCode,
      });

      // Refresh page to update reveal
      router.refresh();
    } catch (error) {
      console.error('Music remove error:', error);
      setMusicUploadError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploadingMusic(false);
    }
  };

  return (
    <>
      {/* Welcome Message */}
      {showWelcome && (
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-6 shadow-lg text-white animate-fadeIn">
          <div className="text-center">
            <div className="text-5xl mb-3">❤️</div>
            <h2 className="text-2xl font-bold mb-2">Welcome to {MEMORYPOP_PLUS.name}!</h2>
            <p className="text-white/90 mb-1">
              Thank you for becoming one of our founding supporters.
            </p>
            <p className="text-white/90">Your upgrade helps us build the future of MemoryPop.</p>
            <button
              onClick={() => setShowWelcome(false)}
              className="mt-4 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Custom Music Section - Only show for Plus users */}
      {isPremium && (
        <div className="mt-6 rounded-2xl bg-white border-2 border-[#FFD700] p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">🎵</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#3a241e] mb-1">
                Custom Reveal Music
              </h3>
              <p className="text-sm text-[#6B5B52]">
                Upload your own music for the reveal experience. Supports MP3 and M4A files up to 20MB.
              </p>
            </div>
          </div>

          {previewFile ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#fff8ef] border border-[#FFD700]/30 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">🎵</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3a241e] truncate">{previewFile.file.name}</p>
                    <p className="text-xs text-[#856b5f]">{(previewFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <audio
                  ref={previewAudioRef}
                  src={previewFile.url}
                  controls
                  className="w-full"
                />
              </div>

              {isUploadingMusic && (
                <div className="space-y-2">
                  <div className="w-full bg-[#F0DED2] rounded-full h-2">
                    <div
                      className="bg-[#ef6a57] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-[#856b5f]">Uploading... {uploadProgress}%</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmUpload}
                  disabled={isUploadingMusic}
                  className="flex-1 rounded-full bg-[#ef6a57] px-6 py-3 font-semibold text-white hover:bg-[#e05a47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingMusic ? 'Uploading...' : 'Confirm Upload'}
                </button>
                <button
                  onClick={handleCancelPreview}
                  disabled={isUploadingMusic}
                  className="px-6 py-3 text-sm font-semibold text-[#856b5f] hover:text-[#6B5B52] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : currentMusicUrl ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#fff8ef] border border-[#FFD700]/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl">✓</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3a241e]">Custom music active</p>
                      <p className="text-xs text-[#856b5f] truncate">Your reveal uses custom music</p>
                    </div>
                  </div>
                  <button
                    onClick={handleMusicRemove}
                    disabled={isUploadingMusic}
                    className="px-4 py-2 text-sm font-semibold text-[#ef6a57] hover:text-[#e05a47] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <button
                onClick={() => musicInputRef.current?.click()}
                disabled={isUploadingMusic}
                className="w-full rounded-full border-2 border-[#ead8c9] bg-white px-6 py-3 text-sm font-semibold text-[#3a241e] hover:border-[#FFD700] hover:bg-[#fff8ef] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Replace Music
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => musicInputRef.current?.click()}
                disabled={isUploadingMusic}
                className="w-full rounded-full bg-[#ef6a57] px-6 py-3 font-semibold text-white hover:bg-[#e05a47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Music
              </button>
              <p className="text-xs text-[#856b5f] text-center">
                No custom music yet. The reveal uses default music based on your occasion.
              </p>
            </div>
          )}

          <input
            ref={musicInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a"
            onChange={handleMusicSelect}
            disabled={isUploadingMusic}
            className="hidden"
          />

          {musicUploadError && (
            <div className="mt-3 rounded-lg border-2 border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {musicUploadError}
            </div>
          )}

          {musicUploadSuccess && (
            <div className="mt-3 rounded-lg border-2 border-green-300 bg-green-50 p-3 text-sm text-green-800">
              ✓ Music uploaded successfully! Your reveal will use your custom music.
            </div>
          )}
        </div>
      )}

      {/* Plus CTA - Only show if not premium */}
      {!isPremium && (
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#fff8ef] to-[#fff1e6] border-2 border-[#FFD700] p-6 shadow-sm">
          <div className="text-center">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-xl font-bold text-[#3a241e] mb-2">{MEMORYPOP_PLUS.name}</h3>
            <p className="text-sm font-semibold text-[#856b5f] mb-2">
              {MEMORYPOP_PLUS.tagline}
            </p>
            <p className="text-sm text-[#6B5B52] mb-4 whitespace-pre-line">
              {MEMORYPOP_PLUS.fullSummary}
            </p>
            <p className="text-sm font-bold text-[#ef6a57] mb-4">
              {MEMORYPOP_PLUS.priceLabel} {MEMORYPOP_PLUS.price}
            </p>

            {!hasClickedInterest && !showBetaCodeInput ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/plus"
                  className="inline-block rounded-full border border-[#ef6a57] bg-white px-8 py-3 font-semibold text-[#ef6a57] transition-colors hover:bg-[#fff8ef]"
                >
                  Learn More About Plus
                </Link>
                <button
                  onClick={() => setShowBetaCodeInput(true)}
                  className="rounded-full bg-[#ef6a57] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#e05a47]"
                >
                  Upgrade to Plus
                </button>
                <button
                  onClick={handleInterestClick}
                  className="text-sm text-[#856b5f] hover:text-[#6B5B52] underline"
                >
                  Notify me when payment is available
                </button>
              </div>
            ) : showBetaCodeInput ? (
              <div className="space-y-4">
                <div className="text-left space-y-2 text-sm text-[#3a241e]">
                  <p className="font-semibold">Enter Your Beta Access Code</p>
                  <p className="text-[#6B5B52]">
                    During our beta period, Plus is activated with a complimentary access code at <span className="font-bold">€0</span>.
                    No payment details required.
                  </p>
                </div>

                <form onSubmit={handleBetaCodeRedeem} className="space-y-3">
                  <input
                    type="text"
                    value={betaCode}
                    onChange={(e) => setBetaCode(e.target.value)}
                    placeholder="Enter beta code"
                    disabled={isRedeeming}
                    className="w-full rounded-full border border-[#ead8c9] bg-white px-6 py-3 text-center text-[#3a241e] placeholder:text-[#a89687] focus:border-[#ef6a57] focus:outline-none focus:ring-2 focus:ring-[#ef6a57]/20 disabled:opacity-50"
                    required
                  />

                  {redemptionError && (
                    <p className="text-sm text-[#ef6a57] text-center">
                      {redemptionError}
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={isRedeeming || !betaCode.trim()}
                      className="rounded-full bg-[#ef6a57] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#e05a47] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRedeeming ? "Activating..." : "Activate Plus for €0"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBetaCodeInput(false);
                        setBetaCode("");
                        setRedemptionError("");
                      }}
                      className="text-sm text-[#856b5f] hover:text-[#6B5B52] underline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                <div className="text-xs text-[#856b5f] text-left space-y-1">
                  <p>Don&apos;t have a code?</p>
                  <button
                    onClick={handleInterestClick}
                    className="text-[#ef6a57] hover:text-[#e05a47] underline"
                  >
                    Register your interest for future beta access
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[#2B1E18]">
                <p className="font-semibold mb-1">
                  {MEMORYPOP_PLUS.comingSoonConfirmation}
                </p>
                <p className="text-[#6B5B52]">
                  {MEMORYPOP_PLUS.comingSoonFollowup}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
