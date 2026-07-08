import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{
    recipient?: string;
    occasion?: string;
    shareCode?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  const recipient = params.recipient || "your loved one";
  const occasion = params.occasion || "Celebration";
  const shareCode = params.shareCode || "";

  const shareLink = `https://memorypop.vercel.app/m/${shareCode}`;

  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
        <p className="text-5xl">🎉</p>

        <h1 className="mt-6 text-4xl font-bold">
          {recipient}&apos;s {occasion} MemoryPop is ready!
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-8 text-[#6B5B52]">
          Your celebration has been safely saved. Now invite friends and family
          to add their memories.
        </p>

        <div className="mt-10 w-full rounded-3xl border border-[#F0DED2] bg-white p-6 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#6B5B52]">
            Share your MemoryPop
          </p>

          <div className="rounded-2xl bg-[#FFF8F2] p-4 text-sm break-all">
            {shareLink}
          </div>

          <p className="mt-4 text-sm text-[#6B5B52]">
            Copy this link manually for now. Contributor page coming next ❤️
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create"
            className="rounded-full bg-[#FF6B57] px-7 py-4 font-semibold text-white"
          >
            Create Another
          </Link>

          <Link
            href="/"
            className="rounded-full border border-[#F0DED2] bg-white px-7 py-4 font-semibold"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}