"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { ShareMenu } from "./ShareMenu";
import { generateShareMessage, generateEmailSubject, generateEmailBody, generateShareMenuMessage } from "@/lib/shareMessageGenerator";

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
  mode?: 'contributor' | 'reveal' | 'product';
  shareCode?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setShowFallback(false);
      setTimeout(() => setCopied(false), 2000);

      trackEvent('memorypop_shared', {
        share_method: 'copy_link',
        share_mode: mode,
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      setShowFallback(true);
      setCopied(false);
    }
  }

  function handleWhatsApp() {
    const message = generateShareMessage(mode, recipient, shareLink, whatsappMessage);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    trackEvent('memorypop_shared', {
      share_method: 'whatsapp',
      share_mode: mode,
    });

    window.location.href = whatsappUrl;
  }

  function handleEmail() {
    const subject = generateEmailSubject(mode, recipient);
    const body = generateEmailBody(mode, recipient, shareLink, whatsappMessage);
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    trackEvent('memorypop_shared', {
      share_method: 'email',
      share_mode: mode,
    });

    window.location.href = mailtoUrl;
  }

  const whatsappButtonLabel = mode === 'reveal'
    ? '💬 Share on WhatsApp'
    : mode === 'product'
    ? 'Share on WhatsApp'
    : 'Share on WhatsApp';

  // Message for ShareMenu
  const shareMessage = generateShareMenuMessage(mode, recipient, whatsappMessage);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleCopy}
          className="rounded-full bg-[#ef6a57] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2 transition-all"
          aria-label="Copy link to clipboard"
        >
          {copied ? "Copied! ✓" : "Copy Link"}
        </button>

        <button
          onClick={handleWhatsApp}
          className="rounded-full bg-[#25D366] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#22c55e] active:ring-2 active:ring-white active:ring-offset-2 transition-all"
          aria-label="Share via WhatsApp"
        >
          {whatsappButtonLabel}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleEmail}
          className="rounded-full border border-[#ead8c9] bg-white px-7 py-4 font-semibold text-[#3a241e] transition-colors hover:bg-[#fff8ef] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 w-full sm:w-auto"
          aria-label="Share via email"
        >
          📧 Email
        </button>

        <ShareMenu
          shareLink={shareLink}
          message={shareMessage}
          recipient={recipient}
          mode={mode}
          shareCode={shareCode}
        />
      </div>

      {showFallback && (
        <div className="mt-3 p-4 bg-[#FFF8F5] border border-[#FFD4CC] rounded-xl">
          <p className="text-sm text-[#6B5B52] mb-2">
            Unable to copy automatically. Select and copy the link below:
          </p>
          <input
            type="text"
            readOnly
            value={shareLink}
            onClick={(e) => e.currentTarget.select()}
            className="w-full px-3 py-2 text-sm bg-white border border-[#ead8c9] rounded-lg text-[#3a241e] font-mono"
          />
        </div>
      )}
    </div>
  );
}
