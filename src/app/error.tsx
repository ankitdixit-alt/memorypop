'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging (will add Sentry in Issue #7)
    console.error('Error boundary caught:', error);
  }, [error]);

  // Determine error type from message
  const isNetworkError =
    error.message.includes('NETWORK_ERROR') ||
    error.message.includes('fetch failed') ||
    error.message.includes('timeout');

  const isNotFound = error.message.includes('NOT_FOUND');

  // If it's a not-found error, let Next.js handle it
  if (isNotFound) {
    throw error; // Will be caught by not-found.tsx
  }

  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          {/* Icon */}
          <div className="mb-6 text-6xl">
            {isNetworkError ? '🌐' : '⚠️'}
          </div>

          {/* Error Title */}
          <h1 className="text-3xl font-bold text-[#2B1E18]">
            {isNetworkError ? 'Connection Error' : 'Something Went Wrong'}
          </h1>

          {/* Error Message */}
          <p className="mt-4 text-lg text-[#6B5B52]">
            {isNetworkError
              ? "We couldn't connect to the server. Please check your internet connection and try again."
              : "We encountered an unexpected error. Please try again in a moment."}
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {/* Try Again Button */}
            <button
              onClick={() => reset()}
              className="rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white transition-colors hover:bg-[#e55a47]"
            >
              Try Again
            </button>

            {/* Go Home Button */}
            <a
              href="/"
              className="rounded-full border-2 border-[#F0DED2] bg-white px-8 py-4 font-semibold text-[#2B1E18] transition-colors hover:border-[#FF6B57] hover:text-[#FF6B57]"
            >
              Go Home
            </a>
          </div>

          {/* Error Details (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-[#6B5B52]">
                Error Details (dev only)
              </summary>
              <pre className="mt-4 overflow-auto rounded-lg bg-[#F0DED2] p-4 text-xs text-[#2B1E18]">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </main>
  );
}
