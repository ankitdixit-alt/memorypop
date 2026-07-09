import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

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

  if (error || !data) {
    notFound();
  }

  // Fetch memories for this memorypop
  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .eq("memorypop_id", data.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <p className="text-5xl">❤️</p>

          <h1 className="mt-6 text-4xl font-bold">
            {data.recipient_name}&apos;s {data.occasion} MemoryPop
          </h1>

          <p className="mt-4 text-lg leading-8 text-[#6B5B52]">
            &ldquo;{data.story}&rdquo;
          </p>

          <a
            href={`/m/${shareCode}/contribute`}
            className="mt-10 inline-block rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white"
          >
            ❤️ Add Your Memory
          </a>
        </div>

        {/* Memories Section */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold">Shared Memories</h2>

          {!memories || memories.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-[#6B5B52]">
                No memories yet. Be the first to add one ❤️
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
