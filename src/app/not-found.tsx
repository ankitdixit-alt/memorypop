import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          {/* Icon */}
          <div className="mb-6 text-6xl">🔍</div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[#2B1E18]">
            Page Not Found
          </h1>

          {/* Message */}
          <p className="mt-4 text-lg text-[#6B5B52]">
            We couldn&apos;t find the page you&apos;re looking for. It may have been moved or deleted.
          </p>

          {/* Action */}
          <div className="mt-8">
            <Link
              href="/"
              className="inline-block rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white transition-colors hover:bg-[#e55a47]"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
