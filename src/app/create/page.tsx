"use client";
import { supabase } from "@/lib/supabase";
import { ChangeEvent, useState, useMemo } from "react";
import { getOccasionCopy } from "@/lib/occasions";

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState("Birthday");
  const [recipient, setRecipient] = useState("");
  const [story, setStory] = useState("");
  const [tone, setTone] = useState("Heartfelt");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCover, setSelectedCover] = useState("none");

  const progress = (step / 3) * 100;

  // Get occasion-specific copy
  const occasionCopy = useMemo(() => {
    if (occasion && recipient) {
      return getOccasionCopy(occasion, recipient);
    }
    return null;
  }, [occasion, recipient]);

  function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 3);
    const photoUrls = files.map((file) => URL.createObjectURL(file));
    setPhotos(photoUrls);
  }
async function saveMemoryPop() {
  setIsCreating(true);

  const { data, error} = await supabase
    .from("memorypops")
    .insert({
      recipient_name: recipient,
      occasion,
      story,
      tone,
      status: "collecting",
      share_code: crypto.randomUUID(),
    })
    .select()
    .single();

  if (error) {
    setIsCreating(false);
    alert(error.message);
    return;
  }

  // Keep loading state true during redirect
  window.location.href = `/success?shareCode=${data.share_code}&recipient=${encodeURIComponent(
    data.recipient_name
  )}&occasion=${encodeURIComponent(data.occasion)}`;
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
            {step === 1 && "🌱 Starting the celebration"}
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
              {occasionCopy?.helperText || "Let’s create one beautiful celebration your loved one will never forget."}
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
                  className={`rounded-2xl border p-4 text-left font-semibold ${
                    occasion === item
                      ? "border-[#FF6B57] bg-[#FFF1EC]"
                      : "border-[#F0DED2]"
                  }`}
                >
                  {item === "Birthday" ? "🎂 " : ""}
                  {item}
                </button>
              ))}
            </div>

            <label className="mt-8 block font-semibold">Who’s today’s star?</label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Rahul"
              className="mt-3 w-full rounded-2xl border border-[#F0DED2] px-5 py-4 text-lg outline-none focus:border-[#FF6B57]"
            />

            <button
              onClick={() => setStep(2)}
              disabled={!recipient}
              className="mt-8 rounded-full bg-[#FF6B57] px-7 py-4 font-semibold text-white disabled:opacity-40"
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
            {occasionCopy?.messageStarters && (
              <div className="mt-6 mb-4">
                <label className="block font-semibold text-sm text-[#6B5B52] mb-2">
                  Need inspiration? Try one of these:
                </label>
                <div className="flex flex-col gap-2">
                  {occasionCopy.messageStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStory(starter)}
                      className="text-left text-sm rounded-xl border border-[#F0DED2] bg-white px-4 py-3 hover:border-[#FF6B57] hover:bg-[#FFF1EC] transition-colors"
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
              placeholder="e.g. He always brings the family together and makes everyone laugh."
              className="mt-8 min-h-40 w-full rounded-2xl border border-[#F0DED2] px-5 py-4 text-lg outline-none focus:border-[#FF6B57]"
            />

            {/* Emoji Shortcuts */}
            {occasionCopy?.emojiShortcuts && (
              <div className="mt-4">
                <label className="block font-semibold text-sm text-[#6B5B52] mb-2">
                  Add some emotion:
                </label>
                <div className="flex flex-wrap gap-2">
                  {occasionCopy.emojiShortcuts.map((emoji, idx) => (
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
                      className="text-2xl w-10 h-10 rounded-lg border border-[#F0DED2] bg-white hover:border-[#FF6B57] hover:bg-[#FFF1EC] transition-colors flex items-center justify-center"
                      aria-label={`Add ${emoji} emoji`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="mt-6 block font-semibold">Choose the feeling</label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {["Heartfelt", "Funny", "Emotional", "Simple"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTone(item)}
                  className={`rounded-2xl border p-4 text-left font-semibold ${
                    tone === item
                      ? "border-[#FF6B57] bg-[#FFF1EC]"
                      : "border-[#F0DED2]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Cover Presets */}
            {occasionCopy?.coverPresets && (
              <div className="mt-6">
                <label className="block font-semibold mb-2">
                  Choose a cover style <span className="text-gray-400">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {occasionCopy.coverPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedCover(preset.id)}
                      className={`rounded-2xl border p-4 text-left ${
                        selectedCover === preset.id
                          ? "border-[#FF6B57] ring-2 ring-[#FF6B57] ring-offset-2"
                          : "border-[#F0DED2]"
                      }`}
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
                className="mt-3 block w-full rounded-2xl border border-[#F0DED2] bg-white px-5 py-4 text-sm"
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
              className="mt-8 rounded-full bg-[#FF6B57] px-7 py-4 font-semibold text-white disabled:opacity-40"
            >
              See your MemoryPop →
            </button>
          </section>
        )}

        {step === 3 && (
          <section className="rounded-[2rem] bg-white p-8 shadow-xl">
            <p className="text-4xl">🎁</p>
            <h1 className="mt-4 text-4xl font-bold">
              Here’s your MemoryPop for {recipient}
            </h1>

            <div
              className="mt-8 overflow-hidden rounded-[1.7rem] p-8 shadow-inner"
              style={{
                background: occasionCopy?.coverPresets?.find(p => p.id === selectedCover)?.gradient ||
                  'linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)'
              }}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-[#6B5B52]">
                {occasion} MemoryPop
              </p>

              <h2 className="mt-3 text-4xl font-bold">For {recipient} ❤️</h2>

              <p className="mt-6 text-xl leading-9 text-[#4A372F]">
                “{story}”
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
  onClick={saveMemoryPop}
  disabled={isCreating}
  className="rounded-full bg-[#FF6B57] px-7 py-4 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
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