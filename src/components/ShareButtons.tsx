"use client";

import { useState } from "react";

export function ShareButtons({
  shareLink,
  recipient,
}: {
  shareLink: string;
  recipient: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      // Fallback: still show feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleWhatsApp() {
    const message = `I created a MemoryPop for ${recipient}. Add your memory here: ${shareLink} ❤️`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        onClick={handleCopy}
        className="rounded-full bg-[#ef6a57] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#e05a47]"
      >
        {copied ? "Copied! ✓" : "Copy Link"}
      </button>

      <button
        onClick={handleWhatsApp}
        className="rounded-full bg-[#25D366] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#22c55e]"
      >
        Share on WhatsApp
      </button>
    </div>
  );
}
