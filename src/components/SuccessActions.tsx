/**
 * Success Actions Component
 * Manages Private Creator Link display and copy-to-continue gate
 *
 * Prevents accidental loss of management token by requiring
 * user to copy the link before accessing dashboard or continuing.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface SuccessActionsProps {
  shareCode: string;
  managementToken: string | null;
  baseUrl: string;
}

export function SuccessActions({
  shareCode,
  managementToken,
  baseUrl,
}: SuccessActionsProps) {
  const [hasCompletedCopy, setHasCompletedCopy] = useState(false);

  // Callback from PrivateCreatorLink when copy is successful
  const handleCopyComplete = () => {
    setHasCompletedCopy(true);
  };

  return (
    <>
      {/* Private Creator Link - Shown once for recovery */}
      {managementToken && (
        <PrivateCreatorLinkWithCallback
          shareCode={shareCode}
          managementToken={managementToken}
          baseUrl={baseUrl}
          onCopyComplete={handleCopyComplete}
        />
      )}

      <div className="mt-10 w-full border-t border-[#ead8c9]"></div>

      {/* Dashboard Access - Gated by copy completion */}
      {managementToken && !hasCompletedCopy ? (
        <div className="mt-10 text-center">
          <div className="inline-block rounded-full border-2 border-[#ead8c9] bg-[#f5f5f5] px-7 py-4 font-semibold text-[#9ca3af] cursor-not-allowed">
            View Creator Dashboard
          </div>
          <p className="mt-3 text-sm text-[#856b5f]">
            ⬆️ Please copy your Private Creator Link first
          </p>
        </div>
      ) : (
        <Link
          href={`/dashboard/${shareCode}`}
          className="mt-10 inline-block rounded-full border-2 border-[#ef6a57] bg-white px-7 py-4 font-semibold text-[#ef6a57] transition-colors hover:bg-[#fff8ef] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 transition-all"
        >
          View Creator Dashboard
        </Link>
      )}
    </>
  );
}

// Wrapper to pass callback to PrivateCreatorLink
function PrivateCreatorLinkWithCallback({
  shareCode,
  managementToken,
  baseUrl,
  onCopyComplete,
}: {
  shareCode: string;
  managementToken: string;
  baseUrl: string;
  onCopyComplete: () => void;
}) {
  return (
    <PrivateCreatorLinkInternal
      shareCode={shareCode}
      managementToken={managementToken}
      baseUrl={baseUrl}
      onCopyComplete={onCopyComplete}
    />
  );
}

// Internal component with copy callback
function PrivateCreatorLinkInternal({
  shareCode,
  managementToken,
  baseUrl,
  onCopyComplete,
}: {
  shareCode: string;
  managementToken: string;
  baseUrl: string;
  onCopyComplete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const managementLink = `${baseUrl}/manage/${managementToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(managementLink);
      setCopied(true);
      setHasCopied(true);

      // Track successful copy (no token in event)
      trackEvent("private_creator_link_copied", {
        shareCode,
        timestamp: new Date().toISOString(),
      });

      // Notify parent that copy is complete
      onCopyComplete();

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
    <div className="mt-10 w-full rounded-3xl border-2 border-[#ef6a57] bg-[#fff3f0] p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-[#2B1E18] mb-2">
          🔒 Private Creator Link
        </h2>
        <p className="text-sm text-[#6B5B52]">
          This link is shown only once. Save it now to access your dashboard anytime.
        </p>
      </div>

      {/* Security Warning */}
      <div className="mb-6 rounded-xl bg-[#ffe8e0] border border-[#ef6a57] p-4">
        <p className="text-sm font-semibold text-[#3a241e] mb-2">
          ⚠️ Keep this link private
        </p>
        <p className="text-xs text-[#6B5B52] leading-relaxed">
          Anyone with this link can manage your MemoryPop. Only share it with trusted co-creators.
        </p>
      </div>

      {/* Management Link Display */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#856b5f] mb-2">
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

      {/* Private Beta Context */}
      <div className="mb-6 rounded-xl bg-[#fff8f2] border border-[#ead8c9] p-4">
        <p className="text-xs font-semibold text-[#856b5f] mb-2">
          💡 During Private Beta:
        </p>
        <p className="text-xs text-[#6B5B52] leading-relaxed">
          Save this link in your password manager or bookmarks. This is the only way to regain access if you lose your session or change devices.
        </p>
      </div>

      {/* Copy-to-Continue Gate */}
      {!hasCopied && (
        <div className="pt-4 border-t border-[#ead8c9] text-center">
          <p className="text-sm font-semibold text-[#856b5f]">
            ⬆️ Please copy your Private Creator Link before continuing
          </p>
        </div>
      )}
    </div>
  );
}
