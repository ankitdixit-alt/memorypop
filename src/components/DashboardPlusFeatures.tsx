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
  const [showBetaCodeInput, setShowBetaCodeInput] = useState(false);
  const [betaCode, setBetaCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionError, setRedemptionError] = useState("");

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

  const handleBetaCodeRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedeeming(true);
    setRedemptionError("");

    try {
      // Get memorypop ID from share code
      const response = await fetch(`/api/memorypops/share/${shareCode}`);
      if (!response.ok) {
        throw new Error("Failed to fetch MemoryPop");
      }
      const { id: memorypopId } = await response.json();

      // Redeem beta code
      const redeemResponse = await fetch(`/api/memorypops/${memorypopId}/redeem-beta-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: betaCode.trim() }),
      });

      const result = await redeemResponse.json();

      if (!redeemResponse.ok) {
        setRedemptionError(result.error || "Redemption failed");
        return;
      }

      // Success - show welcome message and refresh
      trackEvent('beta_code_redeemed', {
        share_code: shareCode,
        source: 'dashboard',
      });

      setShowWelcome(true);
      router.push(`/dashboard/${shareCode}?upgraded=true`);
      router.refresh();
    } catch (error) {
      console.error("Beta code redemption error:", error);
      setRedemptionError("An unexpected error occurred. Please try again.");
    } finally {
      setIsRedeeming(false);
    }
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

            {!hasClickedInterest && !showBetaCodeInput ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/plus"
                  className="inline-block rounded-full border border-[#ef6a57] bg-white px-8 py-3 font-semibold text-[#ef6a57] transition-colors hover:bg-[#fff8ef]"
                >
                  Learn More About Plus
                </Link>
                <button
                  onClick={() => setShowBetaCodeInput(true)}
                  className="rounded-full bg-[#ef6a57] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#e05a47]"
                >
                  Upgrade to Plus
                </button>
                <button
                  onClick={handleInterestClick}
                  className="text-sm text-[#856b5f] hover:text-[#6B5B52] underline"
                >
                  Notify me when payment is available
                </button>
              </div>
            ) : showBetaCodeInput ? (
              <div className="space-y-4">
                <div className="text-left space-y-2 text-sm text-[#3a241e]">
                  <p className="font-semibold">Enter Your Beta Access Code</p>
                  <p className="text-[#6B5B52]">
                    During our beta period, Plus is activated with a complimentary access code at <span className="font-bold">€0</span>.
                    No payment details required.
                  </p>
                </div>

                <form onSubmit={handleBetaCodeRedeem} className="space-y-3">
                  <input
                    type="text"
                    value={betaCode}
                    onChange={(e) => setBetaCode(e.target.value)}
                    placeholder="Enter beta code"
                    disabled={isRedeeming}
                    className="w-full rounded-full border border-[#ead8c9] bg-white px-6 py-3 text-center text-[#3a241e] placeholder:text-[#a89687] focus:border-[#ef6a57] focus:outline-none focus:ring-2 focus:ring-[#ef6a57]/20 disabled:opacity-50"
                    required
                  />

                  {redemptionError && (
                    <p className="text-sm text-[#ef6a57] text-center">
                      {redemptionError}
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={isRedeeming || !betaCode.trim()}
                      className="rounded-full bg-[#ef6a57] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#e05a47] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRedeeming ? "Activating..." : "Activate Plus for €0"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBetaCodeInput(false);
                        setBetaCode("");
                        setRedemptionError("");
                      }}
                      className="text-sm text-[#856b5f] hover:text-[#6B5B52] underline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                <div className="text-xs text-[#856b5f] text-left space-y-1">
                  <p>Don&apos;t have a code?</p>
                  <button
                    onClick={handleInterestClick}
                    className="text-[#ef6a57] hover:text-[#e05a47] underline"
                  >
                    Register your interest for future beta access
                  </button>
                </div>
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
