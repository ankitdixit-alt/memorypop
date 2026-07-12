import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ShareButtons } from "@/components/ShareButtons";
import { DashboardPlusFeatures } from "@/components/DashboardPlusFeatures";
import { Suspense } from "react";
import Link from "next/link";
import { getOccasionCopy } from "@/lib/occasions";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  // Fetch MemoryPop
  const { data: memorypop, error } = await supabase
    .from("memorypops")
    .select("*")
    .eq("share_code", shareCode)
    .single();

  if (error || !memorypop) {
    notFound();
  }

  // Fetch memories
  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .eq("memorypop_id", memorypop.id)
    .order("created_at", { ascending: false });

  // Calculate metrics
  const memoryCount = memories?.length || 0;
  const photoCount = memories?.filter(m => m.photo_url).length || 0;
  const messagesCount = memories?.filter(
    (m) => m.message && m.message.trim() !== ""
  ).length || 0;
  const contributorCount = new Set(
    memories?.map((m) => m.contributor_name) || []
  ).size;

  // Generate share link
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const shareLink = `${protocol}://${host}/m/${shareCode}`;

  // Get occasion-specific copy
  const occasionCopy = getOccasionCopy(memorypop.occasion, memorypop.recipient_name);

  return (
    <main className="min-h-screen bg-[#fff8ef] px-6 py-12 text-[#3a241e]">
      <div className="mx-auto max-w-3xl">

        {/* Header with Plus Badge */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#856b5f]">
            Dashboard
          </p>
          <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
            <h1 className="text-4xl font-bold">
              {memorypop.recipient_name}&apos;s {memorypop.occasion}
            </h1>
            {memorypop.is_premium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] px-3 py-1 text-sm font-bold text-white shadow-md">
                ✨ Plus
              </span>
            )}
          </div>
        </div>

        {/* Plus Features (Welcome Message & Upgrade CTA) */}
        <Suspense fallback={null}>
          <DashboardPlusFeatures
            isPremium={memorypop.is_premium || false}
            shareCode={shareCode}
          />
        </Suspense>

        {/* Progress Card */}
        {memoryCount > 0 && (
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm text-center">
            <div className="text-5xl mb-4">❤️</div>
            <h2 className="text-3xl font-bold text-[#3a241e] mb-2">
              {memoryCount} {memoryCount === 1 ? "Memory" : "Memories"} Collected
            </h2>
            <p className="text-[#856b5f]">
              Goal: Collect memories before the celebration.
            </p>
          </div>
        )}

        {/* Memory Counter Breakdown */}
        {memoryCount > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-[#3a241e]">{messagesCount}</p>
              <p className="mt-1 text-sm text-[#856b5f]">
                {messagesCount === 1 ? "Message" : "Messages"}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-[#3a241e]">{photoCount}</p>
              <p className="mt-1 text-sm text-[#856b5f]">
                {photoCount === 1 ? "Photo" : "Photos"}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-[#3a241e]">{contributorCount}</p>
              <p className="mt-1 text-sm text-[#856b5f]">
                {contributorCount === 1 ? "Contributor" : "Contributors"}
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-[#856b5f]">
            Quick Actions
          </p>

          <div className="flex flex-col gap-3">
            <ShareButtons
              shareLink={shareLink}
              recipient={memorypop.recipient_name}
            />

            <Link
              href={`/m/${shareCode}`}
              className="rounded-full border border-[#ead8c9] bg-white px-7 py-4 text-center font-semibold text-[#3a241e] transition-colors hover:bg-[#fff8ef]"
            >
              Preview MemoryPop
            </Link>

            {memoryCount > 0 && (
              <Link
                href={`/m/${shareCode}/reveal`}
                className="rounded-full bg-[#ef6a57] px-7 py-4 text-center font-semibold text-white transition-colors hover:bg-[#e05a47]"
              >
                Reveal Celebration
              </Link>
            )}
          </div>
        </div>

        {/* Story Card */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#856b5f]">
                Story
              </p>
              <p className="mt-2 leading-relaxed text-[#3a241e]">
                &ldquo;{memorypop.story}&rdquo;
              </p>
            </div>
            <span className="ml-4 rounded-full bg-[#fff1e6] px-4 py-1.5 text-sm font-semibold text-[#ef6a57]">
              {memorypop.status}
            </span>
          </div>
        </div>

        {/* Contributors List or Empty State */}
        {memories && memories.length > 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#856b5f]">
              Recent Contributors
            </p>

            <div className="space-y-3">
              {/* Group by contributor */}
              {(Array.from(
                memories.reduce((acc, memory) => {
                  if (!acc.has(memory.contributor_name)) {
                    acc.set(memory.contributor_name, memory.created_at);
                  }
                  return acc;
                }, new Map<string, string>())
              ) as [string, string][]).map(([name, createdAt]) => (
                <div
                  key={name}
                  className="flex items-center justify-between border-b border-[#ead8c9] pb-3 last:border-0 last:pb-0"
                >
                  <p className="font-semibold text-[#3a241e]">{name}</p>
                  <p className="text-sm text-[#856b5f]">
                    {new Date(createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">{occasionCopy.emoji}</div>
            <p className="text-lg text-[#3a241e] mb-2">No memories yet.</p>
            <p className="text-[#856b5f]">
              {occasionCopy.emptyStateMessage}
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
