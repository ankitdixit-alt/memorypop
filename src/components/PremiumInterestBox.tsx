'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { MEMORYPOP_PLUS } from '@/config/plus';

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
        {MEMORYPOP_PLUS.standard.photos} photos · {MEMORYPOP_PLUS.standard.gifs} GIF · {MEMORYPOP_PLUS.standard.videoSeconds}-sec video + a message per contributor
      </p>

      {/* Plus mention */}
      <div className="pt-4 border-t border-[#ead8c9]">
        <p className="text-sm font-semibold text-[#2B1E18] mb-2">
          {MEMORYPOP_PLUS.tagline}
        </p>
        <p className="text-sm text-[#6B5B52] mb-4">
          {MEMORYPOP_PLUS.shortSummary}
          <br />
          Plus {MEMORYPOP_PLUS.features.music} and {MEMORYPOP_PLUS.features.styles}.
        </p>

        {!hasClickedInterest ? (
          // Before click: show CTA
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#ef6a57]">
              {MEMORYPOP_PLUS.priceLabel} {MEMORYPOP_PLUS.price} · Coming soon
            </span>
            <button
              onClick={handleInterestClick}
              className="text-sm font-semibold text-[#ef6a57] underline hover:text-[#e05a47] transition-colors"
            >
              {MEMORYPOP_PLUS.comingSoonCTA}
            </button>
          </div>
        ) : (
          // After click: show inline success state
          <div className="text-sm text-[#2B1E18]">
            <p className="font-semibold">
              {MEMORYPOP_PLUS.comingSoonConfirmation}
            </p>
            <p className="text-[#6B5B52] mt-1">
              {MEMORYPOP_PLUS.comingSoonFollowup}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
