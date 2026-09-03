"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { MEMORYPOP_PLUS } from "@/config/plus";

interface DashboardPlusFeaturesProps {
  isPremium: boolean;
  shareCode: string;
}

export function DashboardPlusFeatures({ isPremium, shareCode }: DashboardPlusFeaturesProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasClickedInterest, setHasClickedInterest] = useState(false);

  // Handle payment verification on mount if upgraded=true param
  useEffect(() => {
    const verifyPayment = async () => {
      if (searchParams.get("upgraded") === "true" && !isPremium) {
        try {
          const response = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shareCode }),
          });

          if (response.ok) {
            // Show welcome message
            setShowWelcome(true);
            // Remove upgraded param and refresh
            router.push(`/dashboard/${shareCode}`);
            router.refresh();
          }
        } catch (error) {
          console.error("Payment verification failed:", error);
        }
      } else if (searchParams.get("upgraded") === "true" && isPremium) {
        // Already premium, just show welcome message
        setShowWelcome(true);
        // Auto-dismiss after 10 seconds
        const timer = setTimeout(() => setShowWelcome(false), 10000);
        return () => clearTimeout(timer);
      }
    };

    verifyPayment();
  }, [searchParams, shareCode, isPremium, router]);

  const handleInterestClick = () => {
    // Track Plus interest event
    trackEvent('premium_interest_clicked', {
      share_code: shareCode,
      source: 'dashboard',
    });

    // Show inline success state
    setHasClickedInterest(true);
  };

  return (
    <>
      {/* Welcome Message */}
      {showWelcome && (
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-6 shadow-lg text-white animate-fadeIn">
          <div className="text-center">
            <div className="text-5xl mb-3">❤️</div>
            <h2 className="text-2xl font-bold mb-2">Welcome to {MEMORYPOP_PLUS.name}!</h2>
            <p className="text-white/90 mb-1">
              Thank you for becoming one of our founding supporters.
            </p>
            <p className="text-white/90">Your upgrade helps us build the future of MemoryPop.</p>
            <button
              onClick={() => setShowWelcome(false)}
              className="mt-4 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Plus CTA - Only show if not premium */}
      {!isPremium && (
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#fff8ef] to-[#fff1e6] border-2 border-[#FFD700] p-6 shadow-sm">
          <div className="text-center">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-xl font-bold text-[#3a241e] mb-2">{MEMORYPOP_PLUS.name}</h3>
            <p className="text-sm font-semibold text-[#856b5f] mb-2">
              {MEMORYPOP_PLUS.tagline}
            </p>
            <p className="text-sm text-[#6B5B52] mb-4 whitespace-pre-line">
              {MEMORYPOP_PLUS.fullSummary}
            </p>
            <p className="text-sm font-bold text-[#ef6a57] mb-4">
              {MEMORYPOP_PLUS.priceLabel} {MEMORYPOP_PLUS.price}
            </p>

            {!hasClickedInterest ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/plus"
                  className="inline-block rounded-full border border-[#ef6a57] bg-white px-8 py-3 font-semibold text-[#ef6a57] transition-colors hover:bg-[#fff8ef]"
                >
                  Learn More About Plus
                </Link>
                <button
                  onClick={handleInterestClick}
                  className="rounded-full bg-[#ef6a57] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#e05a47]"
                >
                  {MEMORYPOP_PLUS.comingSoonCTA}
                </button>
                <p className="text-xs text-[#856b5f]">Coming soon</p>
              </div>
            ) : (
              <div className="text-sm text-[#2B1E18]">
                <p className="font-semibold mb-1">
                  {MEMORYPOP_PLUS.comingSoonConfirmation}
                </p>
                <p className="text-[#6B5B52]">
                  {MEMORYPOP_PLUS.comingSoonFollowup}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
