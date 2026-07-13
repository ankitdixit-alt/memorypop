import Link from "next/link";
import { headers } from "next/headers";
import { ShareButtons } from "@/components/ShareButtons";
import { getOccasionCopy } from "@/lib/occasions";

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

  // Get current host for dynamic URL generation
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const shareLink = `${protocol}://${host}/m/${shareCode}`;

  // Get occasion-specific copy
  const occasionCopy = getOccasionCopy(occasion, recipient);

  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
        <p className="text-5xl">{occasionCopy.emoji}</p>

        <h1 className="mt-6 text-4xl font-bold">
          Your MemoryPop is Ready!
        </h1>

        <p className="mt-3 text-lg text-[#6B5B52]">
          {occasionCopy.celebrationMessage}
        </p>

        {occasionCopy.subMessage && (
          <p className="mt-2 text-lg text-[#6B5B52]">
            {occasionCopy.subMessage}
          </p>
        )}

        <p className="mt-5 max-w-xl text-lg leading-8 text-[#6B5B52]">
          Your celebration has been safely saved. Now invite friends and family
          to add their memories.
        </p>

        <div className="mt-10 w-full rounded-3xl border border-[#ead8c9] bg-white p-6 shadow-sm">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-[#856b5f]">
            {occasionCopy.sharePrompt}
          </p>

          <div className="flex justify-center">
            <ShareButtons shareLink={shareLink} recipient={recipient} />
          </div>
        </div>

        <div className="mt-10 w-full border-t border-[#ead8c9]"></div>

        <Link
          href={`/dashboard/${shareCode}`}
          className="mt-10 rounded-full border-2 border-[#ef6a57] bg-white px-7 py-4 font-semibold text-[#ef6a57] transition-colors hover:bg-[#fff8ef] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 transition-all"
        >
          View Creator Dashboard
        </Link>

        <div className="mt-10 w-full border-t border-[#ead8c9]"></div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create"
            className="rounded-full border border-[#ead8c9] bg-white px-7 py-4 font-semibold text-[#3a241e] transition-colors hover:bg-[#fff8ef] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 transition-all"
          >
            Create Another
          </Link>

          <Link
            href="/"
            className="rounded-full border border-[#ead8c9] bg-white px-7 py-4 font-semibold text-[#3a241e] transition-colors hover:bg-[#fff8ef] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 transition-all"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}