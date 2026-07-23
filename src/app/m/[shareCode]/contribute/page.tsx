/**
 * Contribute Page - Server Component
 *
 * Phase 2: Server-first architecture
 * - Queries MemoryPop data server-side using service role
 * - Passes data to ContributeForm client component as props
 * - No database credentials exposed to browser
 */

import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import ContributeForm from "./ContributeForm";

export default async function ContributePage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  // Query MemoryPop data server-side
  const { data: memorypop, error } = await supabaseServer
    .from("memorypops")
    .select("recipient_name, occasion, celebration_date, cover_style, tone")
    .eq("share_code", shareCode)
    .single();

  // Handle not found
  if (error || !memorypop) {
    notFound();
  }

  // Render client component with server-fetched data
  return (
    <ContributeForm
      shareCode={shareCode}
      recipientName={memorypop.recipient_name}
      occasion={memorypop.occasion}
      celebrationDate={memorypop.celebration_date}
      coverStyle={memorypop.cover_style}
      tone={memorypop.tone}
    />
  );
}
