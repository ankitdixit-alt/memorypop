import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ShareButtons } from "@/components/ShareButtons";
import { CreatorAccessSection } from "@/components/CreatorAccessSection";
import { getCelebrationExperience } from "@/lib/celebrationExperience";
import { isCreatorAuthorized } from "@/lib/creatorSession";
import type { Metadata } from "next";

/**
 * SEO Foundation Phase 1 - Task 3 & 4
 * Success page should not be indexed (transactional page)
 */
export const metadata: Metadata = {
  title: 'Success',
  description: 'Your MemoryPop has been created successfully.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/success',
  },
};

type SuccessPageProps = {
  searchParams: Promise<{
    recipient?: string;
    occasion?: string;
    shareCode?: string;
    token?: string; // Management token (shown once for recovery)
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  const recipient = params.recipient || "your loved one";
  const occasion = params.occasion || "Celebration";
  const shareCode = params.shareCode || "";
  const managementToken = params.token || ""; // Management token from creation (shown once)

  // Verify creator session exists
  // If no session, creator somehow bypassed creation flow
  if (shareCode) {
    const authorized = await isCreatorAuthorized(shareCode);
    if (!authorized) {
      // No session - suspicious, redirect to create
      redirect('/create');
    }
  }

  // Get current host for dynamic URL generation
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const shareLink = `${baseUrl}/m/${shareCode}/contribute`;

  // Get celebration experience (occasion + default mood composition)
  const celebrationExperience = getCelebrationExperience({
    occasion,
    recipientName: recipient
  });

  // Check if email feature is enabled
  const isEmailFeatureEnabled = process.env.CREATOR_EMAIL_ENABLED === 'true';

  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center">

        {/* SECTION 1: CELEBRATION */}
        <p className="text-5xl">{celebrationExperience.emoji}</p>

        <h1 className="mt-6 text-4xl font-bold">
          {recipient}&apos;s MemoryPop is Ready!
        </h1>

        <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#6B5B52]">
          Now invite friends and family to add memories before the celebration.
        </p>

        <div className="mt-8 w-full border-t border-[#ead8c9]"></div>

        {/* SECTION 2: INVITE CONTRIBUTORS (PRIMARY CTA) */}
        <div className="mt-8 w-full rounded-2xl border-2 border-[#ef6a57] bg-white p-6 shadow-md">
          <h2 className="text-2xl font-bold text-[#3a241e] mb-2">
            Invite Friends & Family
          </h2>
          <p className="text-sm text-[#6B5B52] mb-6">
            Share this link to collect memories for {recipient}.
          </p>

          <div className="flex justify-center">
            <ShareButtons
              shareLink={shareLink}
              recipient={recipient}
              whatsappMessage={celebrationExperience.whatsappMessage}
              shareCode={shareCode}
            />
          </div>
        </div>

        <div className="mt-8 w-full border-t border-[#ead8c9]"></div>

        {/* SECTION 3: KEEP ACCESS SAFE (Email Recommended, Link Alternative) */}
        {isEmailFeatureEnabled && managementToken && (
          <CreatorAccessSection
            shareCode={shareCode}
            managementToken={managementToken}
            baseUrl={baseUrl}
          />
        )}

        {/* If email feature disabled, show link only */}
        {(!isEmailFeatureEnabled || !managementToken) && managementToken && (
          <div className="mt-8 w-full rounded-2xl border border-[#ead8c9] bg-white p-6 shadow-sm">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-[#3a241e] mb-2">
                Keep your creator access safe
              </h2>
            </div>

            <PrivateCreatorLinkFallback
              shareCode={shareCode}
              managementToken={managementToken}
              baseUrl={baseUrl}
            />
          </div>
        )}

        <div className="mt-8 w-full border-t border-[#ead8c9]"></div>

        {/* SECTION 4: DASHBOARD & NAVIGATION (Always Enabled) */}
        <Link
          href={`/dashboard/${shareCode}`}
          className="mt-8 inline-block rounded-full border-2 border-[#ef6a57] bg-white px-7 py-4 font-semibold text-[#ef6a57] transition-colors hover:bg-[#fff8ef] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 transition-all"
        >
          View Creator Dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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

// Fallback Private Creator Link component (when email feature disabled)
function PrivateCreatorLinkFallback({
  shareCode,
  managementToken,
  baseUrl,
}: {
  shareCode: string;
  managementToken: string;
  baseUrl: string;
}) {
  const managementLink = `${baseUrl}/manage/${managementToken}`;

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#856b5f] mb-2 text-center">
          Your Private Creator Link:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={managementLink}
            readOnly
            className="flex-1 rounded-lg border border-[#ead8c9] bg-white px-4 py-3 text-sm text-[#3a241e] font-mono focus:outline-none focus:ring-2 focus:ring-[#ef6a57]"
            aria-label="Private Creator Link"
          />
        </div>
      </div>

      <div className="rounded-lg bg-[#fff8f2] border border-[#ead8c9] p-4 text-center">
        <p className="text-sm font-semibold text-[#3a241e] mb-1">
          ⚠️ Keep this link private
        </p>
        <p className="text-xs text-[#6B5B52] leading-relaxed">
          Anyone with it can manage your MemoryPop.
        </p>
      </div>
    </div>
  );
}
