import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
        <p className="text-5xl">🎉</p>

        <h1 className="mt-6 text-4xl font-bold">
          Your MemoryPop is ready!
        </h1>

        <p className="mt-4 text-lg leading-8 text-[#6B5B52]">
          Your celebration has been saved. Next, we'll help you invite friends
          and family to add their memories.
        </p>

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