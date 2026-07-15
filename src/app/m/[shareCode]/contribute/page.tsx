"use client";

import { ChangeEvent, useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getOccasionCopy, type OccasionCopy } from "@/lib/occasions";

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
  const [occasionCopy, setOccasionCopy] = useState<OccasionCopy | null>(null);
  const [recipientName, setRecipientName] = useState<string>("");
  const [occasion, setOccasion] = useState<string>("");

  // Fetch occasion and recipient name for occasion-aware copy
  useEffect(() => {
    async function loadOccasionCopy() {
      const { data } = await supabase
        .from("memorypops")
        .select("occasion, recipient_name")
        .eq("share_code", shareCode)
        .single();

      if (data) {
        setRecipientName(data.recipient_name);
        setOccasion(data.occasion);
        setOccasionCopy(getOccasionCopy(data.occasion, data.recipient_name));
      }
    }
    loadOccasionCopy();
  }, [shareCode]);

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

      // Show success state instead of immediate redirect
      setSubmitSuccess(true);
      setIsSubmitting(false);
    } catch (error) {
      setSubmitError("An error occurred");
      setIsSubmitting(false);
    }
  }

  // v2: Use occasion-specific contribute narrative from occasions.ts
  // This replaces the generateNarrative function with centralized copy
  const narrative = occasionCopy?.contributeNarrative;

  // v2: Success state - show thank you message after contribution
  if (submitSuccess && occasionCopy?.successMessage) {
    return (
      <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl text-center">
            <p className="text-6xl mb-6">{occasionCopy.emoji}</p>
            <h1 className="text-3xl font-bold text-[#2B1E18] mb-4">
              {occasionCopy.successMessage.title}
            </h1>
            <p className="text-lg leading-relaxed text-[#6B5B52] mb-8">
              {occasionCopy.successMessage.message}
            </p>
            <a
              href={`/m/${shareCode}`}
              className="inline-block rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white active:ring-2 active:ring-white active:ring-offset-2 transition-all"
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

        {/* Narrative Block - v2: Enhanced with 4th line "why it matters" */}
        {narrative && (
          <div className="mb-8 rounded-[2rem] bg-white p-8 shadow-xl text-center">
            <p className="text-5xl">{occasionCopy?.emoji}</p>
            <div className="mt-6 space-y-4">
              <p className="text-lg leading-relaxed text-[#2B1E18]">
                {narrative.line1}
              </p>
              <p className="text-lg leading-relaxed text-[#6B5B52]">
                {narrative.line2}
              </p>
              {narrative.line3 && (
                <p className="text-lg leading-relaxed font-semibold text-[#2B1E18]">
                  {narrative.line3}
                </p>
              )}
              {narrative.line4 && (
                <p className="text-lg leading-relaxed text-[#FF6B57] font-semibold">
                  {narrative.line4}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contribution Form */}
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <p className="text-center text-5xl">{occasionCopy?.emoji || "❤️"}</p>

          <h1 className="mt-6 text-center text-4xl font-bold">
            {occasionCopy?.actionLabel || (recipientName ? `Add a memory for ${recipientName}` : "Add a memory")}
          </h1>

          <p className="mt-4 text-center text-[#6B5B52]">
            Write something that will make them smile.
          </p>

          <label className="mt-8 block font-semibold">Your Name</label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={occasionCopy?.formPlaceholders?.name || "e.g. Mum"}
            className="mt-3 w-full rounded-2xl border border-[#F0DED2] px-5 py-4 outline-none focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57] focus:ring-opacity-50"
          />

          <label className="mt-8 block font-semibold">Your Memory</label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={occasionCopy?.formPlaceholders?.message || "Write something heartfelt..."}
            className="mt-3 min-h-40 w-full rounded-2xl border border-[#F0DED2] px-5 py-4 outline-none focus:border-[#FF6B57] focus:ring-2 focus:ring-[#FF6B57] focus:ring-opacity-50"
          />

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
            {isSubmitting ? "Saving..." : `❤️ ${occasionCopy?.contributeCTA || "Add Memory"}`}
          </button>
        </div>

      </div>
    </main>
  );
}