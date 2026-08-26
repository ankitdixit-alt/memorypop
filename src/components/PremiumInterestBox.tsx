'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

type PremiumInterestBoxProps = {
  shareCode: string;
  occasion: string;
};

export function PremiumInterestBox({ shareCode, occasion }: PremiumInterestBoxProps) {
  const [hasClickedInterest, setHasClickedInterest] = useState(false);

  const handleInterestClick = () => {
    // Track premium interest event
    trackEvent('premium_interest_clicked', {
      share_code: shareCode,
      occasion: occasion,
      source: 'success_page',
    });

    // Show inline success state
    setHasClickedInterest(true);
  };

  return (
    <div className="mt-8 w-full rounded-2xl bg-gradient-to-br from-[#fff8ef] to-[#fff1e6] p-6 border border-[#F0DED2]">
      {/* Standard reminder */}
      <p className="text-sm font-semibold text-[#856b5f] mb-3">
        Everyone can make it personal
      </p>
      <p className="text-sm text-[#6B5B52] mb-4">
        3 photos · 1 GIF · 15-sec video + a message per contributor
      </p>

      {/* Premium mention */}
      <div className="pt-4 border-t border-[#ead8c9]">
        <p className="text-sm font-semibold text-[#2B1E18] mb-2">
          Want more room for every memory?
        </p>
        <p className="text-sm text-[#6B5B52] mb-4">
          Premium gives each person 10 photos, 3 GIFs and a 90-sec video — plus your own music and Premium styles.
        </p>

        {!hasClickedInterest ? (
          // Before click: show CTA
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#ef6a57]">
              Premium €4.99 · Coming soon
            </span>
            <button
              onClick={handleInterestClick}
              className="text-sm font-semibold text-[#ef6a57] underline hover:text-[#e05a47] transition-colors"
            >
              I&apos;m interested
            </button>
          </div>
        ) : (
          // After click: show inline success state
          <div className="text-sm text-[#2B1E18]">
            <p className="font-semibold">
              ✓ Thanks — noted 💛
            </p>
            <p className="text-[#6B5B52] mt-1">
              We&apos;ll let you know when Premium is ready.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
