/**
 * Dashboard Loading State
 *
 * Shown automatically by Next.js while the dashboard page is loading.
 * Provides visual feedback during server-side data fetching.
 */

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#fff8ef] px-6 py-12 text-[#3a241e]">
      <div className="mx-auto max-w-3xl">

        {/* Header Skeleton */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#856b5f]">
            Dashboard
          </p>
          <div className="mt-2 flex items-center justify-center">
            <div className="h-10 w-64 animate-pulse rounded-lg bg-[#ead8c9]" />
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="mt-10 rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="flex flex-col items-center gap-4">
            {/* Spinner */}
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ead8c9] border-t-[#ef6a57]" />

            {/* Loading Text */}
            <p className="text-lg font-semibold text-[#3a241e]">
              Loading your MemoryPop...
            </p>
            <p className="text-sm text-[#856b5f]">
              Just a moment while we fetch your celebration.
            </p>
          </div>
        </div>

        {/* Skeleton Cards - Shows Page Structure */}
        <div className="mt-6 space-y-6">
          {/* Quick Actions Card Skeleton */}
          <div className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />

          {/* Story Card Skeleton */}
          <div className="h-48 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>

      </div>
    </main>
  );
}
