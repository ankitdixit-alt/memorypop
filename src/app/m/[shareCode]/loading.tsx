/**
 * Contribute Page Loading State
 *
 * Shown automatically by Next.js while the contribute page loads.
 * Provides visual feedback during server-side data fetching.
 */

export default function ContributeLoading() {
  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto max-w-2xl">

        {/* Header Skeleton */}
        <div className="flex flex-col items-center text-center">
          {/* Emoji Placeholder */}
          <div className="h-16 w-16 animate-pulse rounded-full bg-[#F0DED2]" />

          {/* Title Placeholder */}
          <div className="mt-6 h-12 w-80 animate-pulse rounded-lg bg-[#F0DED2]" />

          {/* Subtitle Placeholder */}
          <div className="mt-2 h-6 w-64 animate-pulse rounded-lg bg-[#F0DED2]" />
        </div>

        {/* Loading Indicator */}
        <div className="mt-10 rounded-2xl border border-[#F0DED2] bg-white p-12 text-center shadow-sm">
          <div className="flex flex-col items-center gap-4">
            {/* Spinner */}
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F0DED2] border-t-[#FF6B57]" />

            {/* Loading Text */}
            <p className="text-lg font-semibold text-[#2B1E18]">
              Loading MemoryPop...
            </p>
            <p className="text-sm text-[#6B5B52]">
              Just a moment while we load the celebration.
            </p>
          </div>
        </div>

        {/* Skeleton Cards - Shows Page Structure */}
        <div className="mt-8 space-y-4">
          {/* Share Section Skeleton */}
          <div className="h-32 animate-pulse rounded-2xl border border-[#F0DED2] bg-white shadow-sm" />

          {/* Memories Section Skeleton */}
          <div className="h-48 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>

      </div>
    </main>
  );
}
