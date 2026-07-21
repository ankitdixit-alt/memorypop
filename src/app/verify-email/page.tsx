/**
 * Email Verification Page
 * Sprint 1: Security Fix - Email verification error handling
 *
 * Displays verification status and error messages
 * Redirects happen in API route, this page only shows errors
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Email Verification | MemoryPop',
  description: 'Verify your email to access your MemoryPop dashboard.',
  robots: { index: false, follow: false },
};

type VerifyEmailPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const error = params.error;

  const errorMessages: Record<string, { title: string; message: string; emoji: string }> = {
    invalid: {
      emoji: "⚠️",
      title: "Invalid Verification Link",
      message: "This verification link is invalid or has already been used. Please request a new verification email from your dashboard.",
    },
    expired: {
      emoji: "⏰",
      title: "Link Expired",
      message: "This verification link has expired. Verification links are valid for 24 hours. Please request a new one from your dashboard.",
    },
    locked: {
      emoji: "🔒",
      title: "Too Many Attempts",
      message: "Too many failed verification attempts. For security, this verification has been locked. Please contact support for assistance.",
    },
    'not-found': {
      emoji: "🔍",
      title: "MemoryPop Not Found",
      message: "We couldn't find the MemoryPop associated with this verification link. Please check the link and try again.",
    },
    server: {
      emoji: "⚠️",
      title: "Verification Error",
      message: "Something went wrong during verification. Please try again or contact support if the problem persists.",
    },
  };

  const errorContent = error ? errorMessages[error] : null;

  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
        {errorContent ? (
          <>
            <p className="text-5xl">{errorContent.emoji}</p>
            <h1 className="mt-6 text-4xl font-bold">{errorContent.title}</h1>
            <p className="mt-3 text-lg text-[#6B5B52]">{errorContent.message}</p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/"
                className="rounded-full border-2 border-[#ef6a57] bg-white px-7 py-4 font-semibold text-[#ef6a57] transition-colors hover:bg-[#fff8ef]"
              >
                Back Home
              </Link>

              {error === 'expired' || error === 'invalid' ? (
                <Link
                  href="/"
                  className="rounded-full bg-[#ef6a57] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#e05745]"
                >
                  Create New MemoryPop
                </Link>
              ) : null}
            </div>

            {error === 'locked' && (
              <div className="mt-8 rounded-2xl border border-[#ead8c9] bg-white p-6">
                <p className="text-sm text-[#6B5B52]">
                  Need help? Contact us at{' '}
                  <a
                    href="mailto:support@memorypop.app"
                    className="text-[#ef6a57] underline hover:text-[#e05745]"
                  >
                    support@memorypop.app
                  </a>
                </p>
              </div>
            )}
          </>
        ) : (
          // Loading state (should not normally be seen - API redirects immediately)
          <>
            <p className="text-5xl">✉️</p>
            <h1 className="mt-6 text-4xl font-bold">Verifying Your Email...</h1>
            <p className="mt-3 text-lg text-[#6B5B52]">
              Please wait while we verify your email address.
            </p>
            <div className="mt-8 h-2 w-48 animate-pulse rounded-full bg-[#ead8c9]"></div>
          </>
        )}
      </div>
    </main>
  );
}
