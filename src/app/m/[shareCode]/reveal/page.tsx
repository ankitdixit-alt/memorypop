import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RevealExperience from "./RevealExperience";
import type { Metadata } from "next";

/**
 * SEO Foundation Phase 1 - Task 3 & 4
 * Reveal page metadata with noindex/follow
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}): Promise<Metadata> {
  const { shareCode } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.com';

  // Fetch MemoryPop for personalized title
  const { data: memorypop } = await supabase
    .from("memorypops")
    .select("recipient_name, occasion")
    .eq("share_code", shareCode)
    .single();

  if (memorypop) {
    return {
      title: `${memorypop.recipient_name}'s ${memorypop.occasion} - Reveal`,
      description: `Experience ${memorypop.recipient_name}'s special celebration reveal.`,
      // Reveal pages should not be indexed (pre-date private experience)
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: `${baseUrl}/m/${shareCode}/reveal`,
      },
    };
  }

  return {
    title: 'Reveal Experience',
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/m/${shareCode}/reveal`,
    },
  };
}

export default async function RevealPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  // Fetch MemoryPop
  const { data: memoryPop, error: memoryPopError } = await supabase
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

  // Fetch memories with photos
  const { data: memories, error: memoriesError } = await supabase
    .from("memories")
    .select("*")
    .eq("memorypop_id", memoryPop.id)
    .order("created_at", { ascending: false }); // Most recent first for impact

  if (memoriesError) {
    throw new Error(`Failed to fetch memories: ${memoriesError.message}`);
  }

  // Pass to client component
  return (
    <RevealExperience
      recipientName={memoryPop.recipient_name}
      occasion={memoryPop.occasion}
      memories={memories || []}
      memorypopId={memoryPop.id}
      celebrationDate={memoryPop.celebration_date}
      coverStyle={memoryPop.cover_style}
      shareCode={shareCode}
      mood={memoryPop.tone}
    />
  );
}
