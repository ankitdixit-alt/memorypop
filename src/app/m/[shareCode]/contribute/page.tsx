"use client";

import { ChangeEvent, useState, useEffect } from "react";
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
  const [occasionCopy, setOccasionCopy] = useState<OccasionCopy | null>(null);

  // Fetch occasion and recipient name for occasion-aware copy
  useEffect(() => {
    async function loadOccasionCopy() {
      const { data } = await supabase
        .from("memorypops")
        .select("occasion, recipient_name")
        .eq("share_code", shareCode)
        .single();

      if (data) {
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

      // Redirect back to the view page
      router.push(`/m/${shareCode}`);
    } catch (error) {
      setSubmitError("An error occurred");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 shadow-xl">
        <p className="text-center text-5xl">{occasionCopy?.emoji || "❤️"}</p>

        <h1 className="mt-6 text-center text-4xl font-bold">
          {occasionCopy?.actionLabel || "Add Your Memory"}
        </h1>

        <p className="mt-4 text-center text-[#6B5B52]">
          Write something that will make them smile.
        </p>

        <label className="mt-8 block font-semibold">Your Name</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mum"
          className="mt-3 w-full rounded-2xl border border-[#F0DED2] px-5 py-4"
        />

        <label className="mt-8 block font-semibold">Your Memory</label>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write something heartfelt..."
          className="mt-3 min-h-40 w-full rounded-2xl border border-[#F0DED2] px-5 py-4"
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
          className="mt-8 w-full rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "❤️ Submit Memory"}
        </button>
      </div>
    </main>
  );
}