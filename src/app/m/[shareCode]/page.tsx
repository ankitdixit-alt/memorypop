import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ShareButtons } from "@/components/ShareButtons";
import { getCelebrationExperience } from "@/lib/celebrationExperience";
import { getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";
import type { Metadata } from "next";

/**
 * Normalize occasion string to match OG image filename
 * @param occasion - Raw occasion string from database
 * @returns Lowercase, hyphenated filename (e.g., "newbaby")
 */
function normalizeOccasion(occasion: string): string {
  const normalized = occasion.toLowerCase().trim();

  switch (normalized) {
    case "birthday":
      return "birthday";
    case "farewell":
      return "farewell";
    case "wedding":
      return "wedding";
    case "new baby":
      return "newbaby";
    case "graduation":
      return "graduation";
    case "retirement":
      return "retirement";
    case "anniversary":
      return "anniversary";
    default:
      return "default";
  }
}

/**
 * Generate dynamic metadata for shared MemoryPop links
 * Fetches recipient name and occasion from Supabase to personalize
 * social sharing previews across WhatsApp, Slack, LinkedIn, Facebook, X
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}): Promise<Metadata> {
  const { shareCode } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.com';

  // Set 5-second timeout for metadata fetch
  const METADATA_TIMEOUT = 5000;

  // Fallback metadata in case of fetch failure
  const fallbackMetadata: Metadata = {
    title: "MemoryPop - Celebrate Together",
    description:
      "Friends and family are creating something special. Add your memory and be part of the celebration.",
    // SEO Foundation Phase 1 - Task 3: Canonical URL
    alternates: {
      canonical: `${baseUrl}/m/${shareCode}`,
    },
    openGraph: {
      title: "MemoryPop - Celebrate Together",
      description:
        "Friends and family are creating something special. Add your memory and be part of the celebration.",
      type: "website",
      url: `/m/${shareCode}`,
      images: [
        {
          url: "/og/default.png",
          width: 1200,
          height: 630,
          alt: "MemoryPop - Celebrate Together",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "MemoryPop - Celebrate Together",
      description:
        "Friends and family are creating something special. Add your memory and be part of the celebration.",
      images: ["/og/default.png"],
    },
  };

  try {
    // Fetch with timeout
    const fetchPromise = supabase
      .from("memorypops")
      .select("recipient_name, occasion")
      .eq("share_code", shareCode)
      .single();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Metadata fetch timeout")), METADATA_TIMEOUT)
    );

    const { data, error } = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]) as { data: { recipient_name: string; occasion: string } | null; error: any };

    if (error || !data) {
      console.error("Metadata fetch error:", error);
      return fallbackMetadata;
    }

    const { recipient_name, occasion } = data;

    // Normalize occasion for image matching
    const normalizedOccasion = normalizeOccasion(occasion);
    const ogImagePath = `/og/${normalizedOccasion}.png`;

    // Personalized metadata
    const title = `${recipient_name}'s ${occasion} MemoryPop`;
    const description = `Friends and family are creating something special for ${recipient_name}. Add a memory for ${recipient_name} and be part of the celebration.`;

    return {
      title,
      description,
      // SEO Foundation Phase 1 - Task 3: Canonical URL
      alternates: {
        canonical: `${baseUrl}/m/${shareCode}`,
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: `/m/${shareCode}`,
        images: [
          {
            url: ogImagePath,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImagePath],
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return fallbackMetadata;
  }
}

export default async function MemoryPopPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  const { data, error } = await supabase
    .from("memorypops")
    .select("*")
    .eq("share_code", shareCode)
    .single();

  // Check for errors
  if (error) {
    if (error.code === 'PGRST116') {
      notFound(); // Legitimate not-found
    }
    throw new Error(`Failed to fetch MemoryPop: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  // Fetch memories for this memorypop
  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .eq("memorypop_id", data.id)
    .order("created_at", { ascending: false });

  // Generate share link
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const shareLink = `${protocol}://${host}/m/${shareCode}/contribute`;

  // Get celebration experience (occasion + mood composition)
  const celebrationExperience = getCelebrationExperience({
    occasion: data.occasion,
    mood: data.tone,
    recipientName: data.recipient_name
  });

  // Get adaptive theme for celebration narrative
  // This ensures text is readable on both light and dark gradients
  const previewTheme = getCoverTheme(data.cover_style);

  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto max-w-2xl">

        {/* Celebration Narrative Block - P0: Landing Page Context */}
        <div
          className="mb-8 rounded-[2rem] p-8 shadow-xl text-center"
          style={getCoverHeroStyle(data.cover_style)}
        >
          <p className="text-5xl">{celebrationExperience.emoji}</p>
          <div className="mt-6 space-y-4">
            <p
              className="text-lg leading-relaxed"
              style={{ color: previewTheme.primaryText }}
            >
              {celebrationExperience.landingNarrative?.line1}
            </p>
            <p
              className="text-lg leading-relaxed"
              style={{ color: previewTheme.secondaryText }}
            >
              {celebrationExperience.landingNarrative?.line2}
            </p>
            <p
              className="text-lg leading-relaxed font-semibold"
              style={{ color: previewTheme.primaryText }}
            >
              {celebrationExperience.landingNarrative?.line3}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <p className="text-5xl">{celebrationExperience.emoji}</p>

          <h1 className="mt-6 text-4xl font-bold">
            {celebrationExperience.celebrationMessage}
          </h1>

          {celebrationExperience.subMessage && (
            <p className="mt-2 text-lg text-[#6B5B52]">
              {celebrationExperience.subMessage}
            </p>
          )}

          <p className="mt-4 text-lg leading-8 text-[#6B5B52]">
            &ldquo;{data.story}&rdquo;
          </p>

          <a
            href={`/m/${shareCode}/contribute`}
            className="mt-10 inline-block rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white active:ring-2 active:ring-white active:ring-offset-2 transition-all"
          >
            {celebrationExperience.emoji} {celebrationExperience.contributeCTA}
          </a>
        </div>

        {/* Share Section */}
        <div className="mt-8 rounded-2xl border border-[#F0DED2] bg-white p-6 shadow-sm">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-[#6B5B52]">
            {celebrationExperience.sharePrompt}
          </p>

          <div className="flex justify-center">
            <ShareButtons
              shareLink={shareLink}
              recipient={data.recipient_name}
              whatsappMessage={celebrationExperience.whatsappMessage}
              shareCode={shareCode}
            />
          </div>
        </div>

        {/* Memories Section */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold">Shared Memories</h2>

          {!memories || memories.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-[#6B5B52]">
                {celebrationExperience.emptyStateMessage}
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  {memory.photo_url && (
                    <img
                      src={memory.photo_url}
                      alt="Memory photo"
                      className="mb-4 h-48 w-full rounded-xl object-cover"
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#2B1E18]">
                      {memory.contributor_name}
                    </p>
                    <p className="text-sm text-[#6B5B52]">
                      {new Date(memory.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="mt-3 leading-relaxed text-[#4A372F]">
                    {memory.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
