'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capture error with Sentry
    console.error('Global error boundary caught:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              {/* Icon */}
              <div className="mb-6 text-6xl">⚠️</div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-[#2B1E18]">
                Something Went Wrong
              </h1>

              {/* Error Message */}
              <p className="mt-4 text-lg text-[#6B5B52]">
                We encountered an unexpected error. Please try again in a moment.
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
                <Link
                  href="/"
                  className="rounded-full border-2 border-[#F0DED2] bg-white px-8 py-4 font-semibold text-[#2B1E18] transition-colors hover:border-[#FF6B57] hover:text-[#FF6B57]"
                >
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
