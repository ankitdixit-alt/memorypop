"use client";

import { ChangeEvent, useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCelebrationExperience, type CelebrationExperience } from "@/lib/celebrationExperience";
import { ShareButtons } from "@/components/ShareButtons";
import { trackEvent } from "@/lib/analytics";
import { getCoverGradient, getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";

export default function ContributePage() {
  const params = useParams();
  const router = useRouter();
  const shareCode = params.shareCode as string;

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [celebrationExperience, setCelebrationExperience] = useState<CelebrationExperience | null>(null);
  const [recipientName, setRecipientName] = useState<string>("");
  const [occasion, setOccasion] = useState<string>("");
  const [contributorCount, setContributorCount] = useState<number>(0);
  const [celebrationDate, setCelebrationDate] = useState<string | null>(null);
  const [coverStyle, setCoverStyle] = useState<string | null>(null);

  // Fetch occasion and recipient name for celebration experience
  useEffect(() => {
    async function loadCelebrationExperience() {
      const { data } = await supabase
        .from("memorypops")
        .select("occasion, recipient_name, celebration_date, cover_style, tone")
        .eq("share_code", shareCode)
        .single();

      if (data) {
        setRecipientName(data.recipient_name);
        setOccasion(data.occasion);
        setCelebrationDate(data.celebration_date);
        setCoverStyle(data.cover_style);
        setCelebrationExperience(
          getCelebrationExperience({
            occasion: data.occasion,
            mood: data.tone,
            recipientName: data.recipient_name
          })
        );
      }
    }
    loadCelebrationExperience();
  }, [shareCode]);

  // Get adaptive theme for celebration timeline and narrative
  // This ensures text is readable on both light and dark gradients
  const contributorTheme = useMemo(() => {
    return getCoverTheme(coverStyle);
  }, [coverStyle]);

  function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
  }

  async function uploadPhotoToSupabase(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${shareCode}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('memory-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('memory-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  }

  async function handleSubmit() {
    if (!name || !message) {
      setSubmitError("Please enter your name and message");
      return;
    }

    setSubmitError(""); // Clear any previous errors
    setIsSubmitting(true);

    try {
      // Upload photo if selected
      let photoUrl = "";
      if (photoFile) {
        const uploadedUrl = await uploadPhotoToSupabase(photoFile);
        photoUrl = uploadedUrl || "";
      }

      // Find the memorypop by share_code
      const { data: memorypop, error: fetchError } = await supabase
        .from("memorypops")
        .select("id")
        .eq("share_code", shareCode)
        .single();

      if (fetchError || !memorypop) {
        setSubmitError("Could not find the MemoryPop");
        setIsSubmitting(false);
        return;
      }

      // Insert into memories table
      const { error: insertError } = await supabase
        .from("memories")
        .insert({
          memorypop_id: memorypop.id,
          contributor_name: name,
          message: message,
          photo_url: photoUrl,
        });

      if (insertError) {
        setSubmitError("Failed to save memory: " + insertError.message);
        setIsSubmitting(false);
        return;
      }

      // Fetch contributor count for progress display
      const { count: memoryCount, error: countError } = await supabase
        .from("memories")
        .select("*", { count: "exact", head: true })
        .eq("memorypop_id", memorypop.id);

      if (!countError && typeof memoryCount === "number") {
        setContributorCount(memoryCount);
      }

      // Track contribution_submitted event
      trackEvent('contribution_submitted', {
        share_code: shareCode,
        memorypop_id: memorypop.id,
        occasion: occasion,
        recipient_name: recipientName,
        contributor_name: name,
        has_photo: !!photoUrl,
        message_length: message.length,
        contributor_count: memoryCount || 1,
      });

      // Show success state instead of immediate redirect
      setSubmitSuccess(true);
      setIsSubmitting(false);
    } catch (error) {
      setSubmitError("An error occurred");
      setIsSubmitting(false);
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
              href={`/m/${shareCode}`}
              className="mt-8 inline-block rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white active:ring-2 active:ring-white active:ring-offset-2 transition-all"
            >
              View All Memories
            </a>
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={celebrationExperience?.formPlaceholders?.name || "e.g. Mum"}
            className="mt-3 w-full rounded-2xl border border-[#F0DED2] px-5 py-4 outline-none focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57] focus:ring-opacity-50"
          />

          <label className="mt-8 block font-semibold">{celebrationExperience?.contributorPrompt}</label>

          <textarea
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

          <label className="mt-8 block font-semibold">
            Add a favourite photo <span className="text-gray-400">(optional)</span>
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="mt-3 block w-full rounded-2xl border border-[#F0DED2] bg-white px-5 py-4 text-sm"
          />

          {photo && (
            <img
              src={photo}
              alt="Selected memory"
              className="mt-4 h-48 w-full rounded-2xl object-cover"
            />
          )}

          {submitError && (
            <div className="mt-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-center">
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
            onClick={handleSubmit}
            disabled={isSubmitting || !name || !message}
            className="mt-8 w-full rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed active:ring-2 active:ring-white active:ring-offset-2 transition-all"
          >
            {isSubmitting ? "Saving..." : `❤️ ${celebrationExperience?.contributeCTA || "Add Memory"}`}
          </button>
        </div>

      </div>
    </main>
  );
}