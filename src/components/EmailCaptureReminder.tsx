/**
 * Email Capture Reminder Component
 * Sprint 1: Creator Email Capture & Recovery
 *
 * STATUS: DISABLED - Incompatible with new security model
 *
 * The new email flow requires management token validation, which is not available
 * on the dashboard (only token hash is stored). Email capture is now only supported
 * on the success page where the raw token is available.
 *
 * TODO: Either remove this component or redesign to work without management token.
 * Possible future approach: Email-based recovery link system.
 */

"use client";

import { useState, useEffect } from "react";
// import { EmailCaptureForm } from "./EmailCaptureForm"; // Disabled
import { trackEvent } from "@/lib/analytics";

interface EmailCaptureReminderProps {
  shareCode: string;
  hasEmail: boolean;
}

export function EmailCaptureReminder({ shareCode, hasEmail }: EmailCaptureReminderProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Mark component as client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check session storage and track analytics after client hydration
  useEffect(() => {
    if (!isClient) return;

    const dismissed = sessionStorage.getItem(`email_reminder_dismissed_${shareCode}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    } else {
      trackEvent("email_capture_presented", { shareCode, location: "dashboard" });
    }
  }, [isClient, shareCode]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(`email_reminder_dismissed_${shareCode}`, 'true');
    trackEvent("email_capture_dismissed", { shareCode, location: "dashboard" });
  };

  // Don't render until client-side hydration complete
  if (!isClient) {
    return null;
  }

  // Don't show if email already captured or dismissed
  if (hasEmail || isDismissed) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#FFF8F2] to-[#FFE8E0] border border-[#ead8c9] p-6 shadow-sm">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="float-right text-[#856b5f] hover:text-[#3a241e] transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#856b5f] mb-2">
          💌 Save Your Dashboard Link
        </p>
        <p className="text-[#3a241e] leading-relaxed">
          Want to access your dashboard later? Enter your email and we&apos;ll send you both links.
        </p>
      </div>

      {/* Email Capture Form - Disabled (requires management token) */}
      <p className="text-sm text-[#856b5f]">
        Email capture is only available during MemoryPop creation.
      </p>
    </div>
  );
}
