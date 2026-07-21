"use client";
import { ChangeEvent, useState, useMemo, useEffect } from "react";
import { getCelebrationExperience } from "@/lib/celebrationExperience";
import { getCoverTheme } from "@/lib/coverTheme";
import { trackEvent } from "@/lib/analytics";
import OccasionSelector from "@/components/OccasionSelector";

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState("Birthday");
  const [recipient, setRecipient] = useState("");
  const [story, setStory] = useState("");
  const [tone, setTone] = useState("Heartfelt");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedCover, setSelectedCover] = useState("none");
  const [celebrationDate, setCelebrationDate] = useState("");
  const [showOccasionSelector, setShowOccasionSelector] = useState(false);

  const progress = (step / 3) * 100;

  // Track creation funnel entry
  useEffect(() => {
    trackEvent('create_started', {
      page_path: '/create',
      source_page: document.referrer || undefined,
    });
  }, []);

  // Get composed celebration experience (occasion + mood)
  const celebrationExperience = useMemo(() => {
    if (occasion && recipient) {
      return getCelebrationExperience({
        occasion,
        mood: tone,
        recipientName: recipient
      });
    }
    return null;
  }, [occasion, tone, recipient]);

  // Get adaptive theme for preview
  // Text colors adapt to selected cover style background
  const previewTheme = useMemo(() => {
    return getCoverTheme(selectedCover);
  }, [selectedCover]);

  function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 3);
    const photoUrls = files.map((file) => URL.createObjectURL(file));
    setPhotos(photoUrls);
  }
async function saveMemoryPop() {
  setCreateError("");
  setIsCreating(true);

  // Call server-side API instead of direct Supabase insert
  try {
    const response = await fetch('/api/memorypops/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient_name: recipient,
        occasion,
        story,
        tone,
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

    // Track create_completed event
    trackEvent('create_completed', {
      share_code: result.shareCode,
      occasion: occasion,
      recipient_name: recipient,
      celebration_date: celebrationDate || null,
      tone: tone,
      has_story: !!story,
      has_photos: photos.length > 0,
      photo_count: photos.length,
      selected_cover: selectedCover,
    });

    // Redirect to success page with management token
    // Session cookie already established by server
    // Management token passed once for recovery display
    // SECURITY: Token in URL is acceptable (client-side navigation, consumed immediately)
    window.location.href = `/success?shareCode=${result.shareCode}&token=${result.managementToken}&recipient=${encodeURIComponent(
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
            <h1 className="text-4xl font-bold">Make it personal</h1>
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
                  Add some emotion:
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

            <label className="mt-6 block font-semibold">Choose the mood of this MemoryPop</label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {["Heartfelt", "Funny", "Emotional", "Simple"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTone(item)}
                  className={`rounded-2xl border p-4 text-left font-semibold transition-all ${
                    tone === item
                      ? "border-[#FF6B57] bg-[#FFF1EC]"
                      : "border-[#F0DED2]"
                  } active:ring-2 active:ring-[#FF6B57] active:ring-offset-1`}
                >
                  {item}
                </button>
              ))}
            </div>

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

            <div className="mt-6">
              <label className="block font-semibold">
                Share a few favourite memories{" "}
                <span className="text-gray-400">(optional)</span>
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="mt-3 block w-full rounded-2xl border border-[#F0DED2] bg-white px-5 py-4 text-sm focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57] focus:ring-opacity-50 outline-none"
              />

              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <img
                      key={photo}
                      src={photo}
                      alt="Selected memory"
                      className="h-24 w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!story}
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
                  {photos.map((photo) => (
                    <img
                      key={photo}
                      src={photo}
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