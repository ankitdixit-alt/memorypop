import { supabaseServer } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { hasPremiumAccess } from "@/lib/premiumEntitlement";
import MemoryPopClient from "./MemoryPopClient";
import type { Metadata } from "next";

// Opt out of static generation - this page requires database access
export const dynamic = 'force-dynamic';

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.app';

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
    const fetchPromise = supabaseServer
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
    ]) as { data: { recipient_name: string; occasion: string } | null; error: Error | null };

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

  const { data, error } = await supabaseServer
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
  const { data: memories } = await supabaseServer
    .from("memories")
    .select("*")
    .eq("memorypop_id", data.id)
    .order("created_at", { ascending: false });

  // Generate share link
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const shareLink = `${protocol}://${host}/m/${shareCode}/contribute`;

  // Check Premium access
  const isPremium = hasPremiumAccess(data);

  return (
    <MemoryPopClient
      memoryPop={data}
      memories={memories || []}
      shareLink={shareLink}
      hasPremiumAccess={isPremium}
    />
  );
}
