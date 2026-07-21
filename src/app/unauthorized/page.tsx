/**
 * Unauthorized Access Page
 *
 * Shown when user tries to access creator dashboard without valid session.
 * Provides clear explanation and path back to creating a MemoryPop.
 *
 * SEO: Marked as noindex (private page)
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unauthorized Access',
  robots: { index: false, follow: false },
};

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string }>;
}) {
  const params = await searchParams;
  const returnUrl = params.return;

  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-6 text-4xl font-bold">Creator Access Required</h1>
        <p className="mt-3 text-lg text-[#6B5B52]">
          You need a creator management link to access this page.
        </p>
        <p className="mt-2 text-sm text-[#6B5B52]">
          Check your email for the creator dashboard link, or create a new MemoryPop.
        </p>
        <Link
          href="/"
          className="mt-10 rounded-full border-2 border-[#ef6a57] bg-white px-7 py-4 font-semibold text-[#ef6a57] transition-colors hover:bg-[#fff8ef]"
        >
          Create a MemoryPop
        </Link>
        {returnUrl && (
          <p className="mt-6 text-xs text-[#8B7A70]">
            You were trying to access: {decodeURIComponent(returnUrl)}
          </p>
        )}
      </div>
    </main>
  );
}
