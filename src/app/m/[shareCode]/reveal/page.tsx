import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RevealExperience from "./RevealExperience";

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
    />
  );
}
