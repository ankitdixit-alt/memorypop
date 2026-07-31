import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import PremiumRevealExperience from "./PremiumRevealExperience";
import type { Metadata } from "next";

// Opt out of static generation - this page requires database access
export const dynamic = 'force-dynamic';

/**
 * Premium Reveal Page
 * Provides a directed, cinematic reveal experience for Premium MemoryPops
 * Currently hardcoded for Emma's 30th Birthday as Private Beta validation
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}): Promise<Metadata> {
  const { shareCode } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.app';

  // Fetch MemoryPop for personalized title
  const { data: memorypop } = await supabaseServer
    .from("memorypops")
    .select("recipient_name, occasion")
    .eq("share_code", shareCode)
    .single();

  if (memorypop) {
    return {
      title: `${memorypop.recipient_name}'s ${memorypop.occasion} - Premium Reveal`,
      description: `Experience ${memorypop.recipient_name}'s special celebration in a beautifully directed reveal.`,
      // Premium reveal pages should not be indexed (private experience)
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: `${baseUrl}/m/${shareCode}/premium-reveal`,
      },
    };
  }

  return {
    title: 'Premium Reveal Experience',
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/m/${shareCode}/premium-reveal`,
    },
  };
}

export default async function PremiumRevealPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  // Check if Premium Reveal is enabled for this MemoryPop
  const premiumShareCode = process.env.PREMIUM_REVEAL_SHARE_CODE;

  if (!premiumShareCode || shareCode !== premiumShareCode) {
    // Premium Reveal not enabled for this share code
    // Redirect to standard reveal
    redirect(`/m/${shareCode}/reveal`);
  }

  // Fetch MemoryPop
  const { data: memoryPop, error: memoryPopError } = await supabaseServer
    .from("memorypops")
    .select("*")
    .eq("share_code", shareCode)
    .single();

  if (memoryPopError) {
    if (memoryPopError.code === 'PGRST116') {
      notFound();
    }
    throw new Error(`Failed to fetch MemoryPop: ${memoryPopError.message}`);
  }

  if (!memoryPop) {
    notFound();
  }

  // Fetch memories with photos and videos
  const { data: memories, error: memoriesError } = await supabaseServer
    .from("memories")
    .select("*")
    .eq("memorypop_id", memoryPop.id)
    .order("created_at", { ascending: false }); // Most recent first

  if (memoriesError) {
    throw new Error(`Failed to fetch memories: ${memoriesError.message}`);
  }

  // Pass to client component
  return (
    <PremiumRevealExperience
      recipientName={memoryPop.recipient_name}
      occasion={memoryPop.occasion}
      memories={memories || []}
      memorypopId={memoryPop.id}
      celebrationDate={memoryPop.celebration_date}
      coverStyle={memoryPop.cover_style}
      shareCode={shareCode}
      mood={memoryPop.tone}
      coverPhotoUrl={memoryPop.cover_photo_url}
    />
  );
}
