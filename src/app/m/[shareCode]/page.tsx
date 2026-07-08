import { supabase } from "@/lib/supabase";

export default async function MemoryPopPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  const { data } = await supabase
    .from("memorypops")
    .select("*")
    .eq("share_code", shareCode)
    .single();  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
        <p className="text-5xl">❤️</p>

<h1 className="mt-6 text-4xl font-bold">
  {data?.recipient_name}&apos;s {data?.occasion} MemoryPop
</h1>
        <p className="mt-4 text-lg leading-8 text-[#6B5B52]">
        “{data?.story}”
        <div className="mt-10">
  <button className="rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white">
    ❤️ Add Your Memory
  </button>
</div>
        </p>
      </div>
    </main>
  );
}