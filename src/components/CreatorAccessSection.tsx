/**
 * Creator Access Section Component
 * Helps creators preserve access to their MemoryPop
 *
 * Two options:
 * 1. Email (recommended) - Send MemoryPop details via email
 * 2. Private Creator Link (alternative) - Copy link manually
 *
 * No blocking behavior - creator can always access dashboard
 */

"use client";

import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { EmailCaptureForm } from "./EmailCaptureForm";

interface CreatorAccessSectionProps {
  shareCode: string;
  managementToken: string | null;
  baseUrl: string;
}

export function CreatorAccessSection({
  shareCode,
  managementToken,
  baseUrl,
}: CreatorAccessSectionProps) {
  if (!managementToken) {
    return null;
  }

  return (
    <div className="mt-10 w-full rounded-2xl border border-[#ead8c9] bg-white p-6 shadow-sm">
      {/* Section Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-[#3a241e] mb-2">
          Keep your creator access safe
        </h2>
      </div>

      {/* Option 1: Email (Recommended) */}
      <div className="mb-6">
        <div className="mb-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#856b5f] mb-2">
            Recommended
          </p>
          <h3 className="text-lg font-semibold text-[#3a241e] mb-2">
            📧 Email me my MemoryPop details
          </h3>
          <p className="text-sm text-[#6B5B52]">
            The email contains:
          </p>
          <ul className="text-sm text-[#6B5B52] mt-2 space-y-1">
            <li>• Private Creator Link</li>
            <li>• Contributor Link</li>
            <li>• MemoryPop summary</li>
            <li>• Celebration date</li>
          </ul>
        </div>

        <EmailCaptureForm
          shareCode={shareCode}
          managementToken={managementToken}
          baseUrl={baseUrl}
        />
      </div>

      {/* Divider */}
      <div className="my-8 flex items-center">
        <div className="flex-1 border-t border-[#ead8c9]"></div>
        <span className="px-4 text-sm font-semibold text-[#856b5f]">OR</span>
        <div className="flex-1 border-t border-[#ead8c9]"></div>
      </div>

      {/* Option 2: Private Creator Link (Alternative) */}
      <div>
        <div className="mb-4 text-center">
          <p className="text-sm text-[#6B5B52] mb-4">
            Prefer not to use email?
          </p>
        </div>

        <PrivateCreatorLink
          shareCode={shareCode}
          managementToken={managementToken}
          baseUrl={baseUrl}
        />
      </div>
    </div>
  );
}

// Private Creator Link Component (Alternative Option)
function PrivateCreatorLink({
  shareCode,
  managementToken,
  baseUrl,
}: {
  shareCode: string;
  managementToken: string;
  baseUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const managementLink = `${baseUrl}/manage/${managementToken}`;

  // Remove token from URL after component mounts
  // Token is already in React props, so URL cleanup is safe
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if token is in URL
    const url = new URL(window.location.href);
    const hasTokenParam = url.searchParams.has('token');

    if (hasTokenParam) {
      // Remove token param while preserving all other params
      url.searchParams.delete('token');

      // Update URL without page reload
      window.history.replaceState({}, '', url.toString());
    }
  }, []); // Run once on mount

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(managementLink);
      setCopied(true);

      // Track successful copy (no token in event)
      trackEvent("private_creator_link_copied", {
        shareCode,
        timestamp: new Date().toISOString(),
      });

      // Reset "Copied ✓" feedback after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Copy failed:", error);

      // Fallback: select text for manual copy
      const input = document.querySelector<HTMLInputElement>(
        'input[data-private-link="true"]'
      );
      if (input) {
        input.select();
        input.setSelectionRange(0, input.value.length);
      }
    }
  };

  return (
    <div>
      {/* Link Display */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#856b5f] mb-2 text-center">
          Your Private Creator Link:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={managementLink}
            readOnly
            data-private-link="true"
            className="flex-1 rounded-lg border border-[#ead8c9] bg-white px-4 py-3 text-sm text-[#3a241e] font-mono focus:outline-none focus:ring-2 focus:ring-[#ef6a57]"
            aria-label="Private Creator Link"
          />
          <button
            onClick={handleCopy}
            className={`rounded-lg px-6 py-3 font-semibold text-white transition-colors ${
              copied
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#ef6a57] hover:bg-[#e05745]"
            }`}
            aria-label="Copy Private Creator Link"
          >
            {copied ? "✓ Copied" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Security Warning */}
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
