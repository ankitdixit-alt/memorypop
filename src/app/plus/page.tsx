"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { MEMORYPOP_PLUS } from "@/config/plus";

export default function PlusPage() {
  const [hasClickedInterest, setHasClickedInterest] = useState(false);

  useEffect(() => {
    // Track plus_viewed event
    trackEvent('plus_viewed', {});
  }, []);

  const handleInterestClick = () => {
    // Track Plus interest event
    trackEvent('premium_interest_clicked', {
      source: 'plus_page',
    });

    // Show inline success state
    setHasClickedInterest(true);
  };

  return (
    <main className="min-h-screen bg-[#fff8ef] px-6 py-12 text-[#3a241e]">
      <div className="mx-auto max-w-3xl">
        {/* Coming Soon Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1e6] px-4 py-2">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-bold text-[#ef6a57]">COMING SOON</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{MEMORYPOP_PLUS.name}</h1>
          <p className="text-xl text-[#856b5f]">
            {MEMORYPOP_PLUS.tagline}
          </p>
        </div>

        {/* Features Box */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg mb-12 border-2 border-[#FFD700]">
          <div className="space-y-6">
            {/* Core Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-3xl">📸</span>
                <div>
                  <h3 className="font-bold text-lg">{MEMORYPOP_PLUS.features.photos}</h3>
                  <p className="text-sm text-[#856b5f]">More room for every memory you want to share</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl">🎞️</span>
                <div>
                  <h3 className="font-bold text-lg">{MEMORYPOP_PLUS.features.gifs}</h3>
                  <p className="text-sm text-[#856b5f]">Bring your celebrations to life with animated moments</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl">🎥</span>
                <div>
                  <h3 className="font-bold text-lg">{MEMORYPOP_PLUS.features.video}</h3>
                  <p className="text-sm text-[#856b5f]">Longer video messages to express what matters most</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl">🎵</span>
                <div>
                  <h3 className="font-bold text-lg">Custom music</h3>
                  <p className="text-sm text-[#856b5f]">Choose the perfect soundtrack for your celebration</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl">✨</span>
                <div>
                  <h3 className="font-bold text-lg">Premium reveal styles</h3>
                  <p className="text-sm text-[#856b5f]">Beautiful animations and presentation designs</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="pt-6 border-t border-[#F0DED2] text-center">
              <div className="text-4xl font-bold text-[#3a241e] mb-1">{MEMORYPOP_PLUS.price}</div>
              <p className="text-sm font-semibold text-[#ef6a57]">{MEMORYPOP_PLUS.priceLabel}</p>
            </div>

            {/* CTA */}
            <div className="pt-6 text-center">
              {!hasClickedInterest ? (
                <button
                  onClick={handleInterestClick}
                  className="rounded-full bg-[#ef6a57] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#e05a47] w-full md:w-auto"
                >
                  {MEMORYPOP_PLUS.comingSoonCTA}
                </button>
              ) : (
                <div className="text-[#2B1E18]">
                  <p className="font-semibold text-lg mb-2">
                    {MEMORYPOP_PLUS.comingSoonConfirmation}
                  </p>
                  <p className="text-[#856b5f]">
                    {MEMORYPOP_PLUS.comingSoonFollowup}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-gradient-to-br from-[#fff8ef] to-[#fff1e6] rounded-2xl p-8 mb-12 border border-[#F0DED2]">
          <h2 className="text-2xl font-bold text-center mb-8">Standard vs Plus</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Standard */}
            <div className="bg-white rounded-xl p-6">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg mb-1">Standard</h3>
                <p className="text-sm text-[#856b5f]">Available now — Free</p>
              </div>
              <ul className="space-y-2 text-sm text-[#6B5B52]">
                <li>✓ {MEMORYPOP_PLUS.standard.photos} photos per contributor</li>
                <li>✓ {MEMORYPOP_PLUS.standard.gifs} GIF per contributor</li>
                <li>✓ {MEMORYPOP_PLUS.standard.videoSeconds}-sec video per contributor</li>
                <li>✓ Text messages</li>
              </ul>
            </div>

            {/* Plus */}
            <div className="bg-white rounded-xl p-6 border-2 border-[#FFD700]">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg mb-1">{MEMORYPOP_PLUS.name}</h3>
                <p className="text-sm text-[#ef6a57]">Coming soon — {MEMORYPOP_PLUS.price}</p>
              </div>
              <ul className="space-y-2 text-sm text-[#6B5B52]">
                <li>✓ {MEMORYPOP_PLUS.plus.photos} photos per contributor</li>
                <li>✓ {MEMORYPOP_PLUS.plus.gifs} GIFs per contributor</li>
                <li>✓ {MEMORYPOP_PLUS.plus.videoSeconds}-sec video per contributor</li>
                <li>✓ Custom music</li>
                <li>✓ Premium reveal styles</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="text-center">
          <p className="text-[#856b5f] mb-4">
            Ready to create a Standard MemoryPop for free?
          </p>
          <Link
            href="/"
            className="inline-block rounded-full border-2 border-[#ef6a57] bg-white px-8 py-3 font-semibold text-[#ef6a57] transition-colors hover:bg-[#fff8ef]"
          >
            Create Your MemoryPop
          </Link>
        </div>
      </div>
    </main>
  );
}
