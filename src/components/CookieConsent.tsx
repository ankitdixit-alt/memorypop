// /src/components/CookieConsent.tsx
// Analytics Foundation Phase 1
// GDPR-compliant cookie consent banner

'use client';

import { useState } from 'react';
import { grantConsent, revokeConsent, shouldShowConsentBanner } from '@/lib/analytics';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(() => shouldShowConsentBanner());

  const handleAccept = () => {
    grantConsent();
    setIsVisible(false);
  };

  const handleDecline = () => {
    revokeConsent();
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Message */}
          <div className="flex-1 text-sm text-gray-700">
            <p>
              We use cookies to understand how you use MemoryPop and improve your experience.
              By clicking &quot;Accept&quot;, you consent to our use of analytics cookies.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-sm font-medium text-white bg-[#FF6B9D] hover:bg-[#FF5A8F] rounded-lg transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
