"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function ShareButtons({
  shareLink,
  recipient,
  whatsappMessage,
  mode = 'contributor',
  shareCode,
}: {
  shareLink: string;
  recipient: string;
  whatsappMessage?: string;
  mode?: 'contributor' | 'reveal';
  shareCode?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track memorypop_shared event
      trackEvent('memorypop_shared', {
        share_code: shareCode || 'unknown',
        share_method: 'copy_link',
        recipient_name: recipient,
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      // Fallback: still show feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleWhatsApp() {
    // v2: Use occasion-specific collaborative message if provided
    // Falls back to original transactional message for backwards compatibility
    const message = whatsappMessage
      ? `${whatsappMessage} ${shareLink}`
      : `I created a MemoryPop for ${recipient}. Add a memory for ${recipient} here: ${shareLink}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    // Track memorypop_shared event
    trackEvent('memorypop_shared', {
      share_code: shareCode || 'unknown',
      share_method: 'whatsapp',
      share_mode: mode,
      recipient_name: recipient,
    });

    // location.href is more reliable than window.open() on mobile devices
    window.location.href = whatsappUrl;
  }

  const whatsappButtonLabel = mode === 'reveal'
    ? '💬 Share on WhatsApp'
    : 'Share on WhatsApp';

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        onClick={handleCopy}
        className="rounded-full bg-[#ef6a57] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2 transition-all"
      >
        {copied ? "Copied! ✓" : "Copy Link"}
      </button>

      <button
        onClick={handleWhatsApp}
        className="rounded-full bg-[#25D366] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#22c55e] active:ring-2 active:ring-white active:ring-offset-2 transition-all"
      >
        {whatsappButtonLabel}
      </button>
    </div>
  );
}
