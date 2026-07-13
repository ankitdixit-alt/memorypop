'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function TestContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('trigger') === 'true') {
      throw new Error('Test error for Sentry production');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-[#2B1E18]">Sentry Test Page</h1>
        <p className="mt-4 text-[#6B5B52]">
          Add <code className="rounded bg-[#F0DED2] px-2 py-1">?trigger=true</code> to URL to test error capture
        </p>
        <p className="mt-4 text-sm text-[#6B5B52]">
          ⚠️ This page should be removed before Private Beta launch
        </p>
      </div>
    </div>
  );
}

export default function TestSentryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestContent />
    </Suspense>
  );
}
