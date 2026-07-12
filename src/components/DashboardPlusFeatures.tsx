"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardPlusFeaturesProps {
  isPremium: boolean;
  shareCode: string;
}

export function DashboardPlusFeatures({ isPremium, shareCode }: DashboardPlusFeaturesProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

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

  // Handle upgrade button click
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareCode }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session");
        setIsUpgrading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
      setIsUpgrading(false);
    }
  };

  return (
    <>
      {/* Welcome Message */}
      {showWelcome && (
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-6 shadow-lg text-white animate-fadeIn">
          <div className="text-center">
            <div className="text-5xl mb-3">❤️</div>
            <h2 className="text-2xl font-bold mb-2">Welcome to MemoryPop Plus!</h2>
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

      {/* Upgrade CTA - Only show if not premium */}
      {!isPremium && (
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#fff8ef] to-[#fff1e6] border-2 border-[#FFD700] p-6 shadow-sm">
          <div className="text-center">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-xl font-bold text-[#3a241e] mb-2">Upgrade to MemoryPop Plus</h3>
            <p className="text-[#856b5f] mb-4">
              Unlimited photos, priority support, and premium features as they launch.
            </p>
            <p className="text-sm font-bold text-[#ef6a57] mb-4">Founding Member Price: €4.99</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/plus"
                className="inline-block rounded-full border border-[#ef6a57] bg-white px-8 py-3 font-semibold text-[#ef6a57] transition-colors hover:bg-[#fff8ef]"
              >
                Learn More About Plus
              </Link>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="rounded-full bg-[#ef6a57] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#e05a47] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpgrading ? "Starting checkout..." : "Upgrade Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
