"use client";

import { useState } from "react";
import Link from "next/link";

interface DashboardSharingCardsProps {
  // Contributor invitation props
  contributorLink: string;
  contributorMessage?: string;
  recipientName: string;
  shareCode: string;

  // Reveal sharing props (optional - only shown when ready)
  isReady?: boolean;
  revealLink?: string;
  revealMessage?: string;
}

export function DashboardSharingCards({
  contributorLink,
  contributorMessage,
  recipientName,
  shareCode,
  isReady = false,
  revealLink,
  revealMessage,
}: DashboardSharingCardsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Card 1: Invite Contributors */}
      <SharingCard
        title="Invite contributors"
        description="Collect wishes, photos and videos from friends and family."
        link={contributorLink}
        message={contributorMessage}
        recipientName={recipientName}
        shareCode={shareCode}
        mode="contributor"
        previewLabel="View contribution page"
        previewHref={`/m/${shareCode}/contribute`}
      />

      {/* Card 2: Your Gift is Ready (only shown when ready) */}
      {isReady && revealLink && (
        <SharingCard
          title="Your gift is ready"
          description="Share the finished MemoryPop when the moment feels right."
          footer="A special gift, ready to open and enjoy."
          link={revealLink}
          message={revealMessage}
          recipientName={recipientName}
          shareCode={shareCode}
          mode="reveal"
          showReadyBadge
          previewLabel="Preview reveal"
          previewHref={`/m/${shareCode}/reveal`}
        />
      )}
    </div>
  );
}

interface SharingCardProps {
  title: string;
  description: string;
  footer?: string;
  link: string;
  message?: string;
  recipientName: string;
  shareCode: string;
  mode: 'contributor' | 'reveal';
  showReadyBadge?: boolean;
  previewLabel: string;
  previewHref: string;
}

function SharingCard({
  title,
  description,
  footer,
  link,
  message,
  recipientName,
  shareCode,
  mode,
  showReadyBadge = false,
  previewLabel,
  previewHref,
}: SharingCardProps) {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [showMoreChannels, setShowMoreChannels] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setShowFallback(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setShowFallback(true);
      setCopied(false);
    }
  };

  const handleWhatsApp = () => {
    const fullMessage = message
      ? `${message} ${link}`
      : mode === 'reveal'
      ? `${recipientName} - Your MemoryPop is ready! ${link}`
      : `I created a MemoryPop for ${recipientName}. Add a memory for ${recipientName} here: ${link}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
    window.location.href = whatsappUrl;
  };

  const handleTelegram = () => {
    const text = message || (mode === 'reveal'
      ? `${recipientName} - Your MemoryPop is ready!`
      : `I created a MemoryPop for ${recipientName}`);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    const subject = mode === 'reveal'
      ? `${recipientName} - Your MemoryPop is ready!`
      : `Help celebrate ${recipientName}`;
    const body = message
      ? `${message}\n\n${link}`
      : mode === 'reveal'
      ? `${recipientName} - Your MemoryPop is ready!\n\n${link}`
      : `I created a MemoryPop for ${recipientName}. Add a memory for ${recipientName} here:\n\n${link}`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleX = () => {
    const text = mode === 'reveal'
      ? `${recipientName} - your gift is ready!`
      : `Help celebrate ${recipientName}`;
    const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleReddit = () => {
    const titleText = mode === 'reveal'
      ? `${recipientName}'s MemoryPop`
      : `Help celebrate ${recipientName}`;
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(titleText)}`;
    window.open(redditUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = async () => {
    const fullMessage = message
      ? `${message} ${link}`
      : mode === 'reveal'
      ? `${recipientName} - Your MemoryPop is ready! ${link}`
      : `I created a MemoryPop for ${recipientName}. Add a memory for ${recipientName} here: ${link}`;

    try {
      await navigator.clipboard.writeText(fullMessage);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: mode === 'reveal' ? `${recipientName}'s MemoryPop` : `Celebrate ${recipientName}`,
        text: message || (mode === 'reveal'
          ? `${recipientName} - Your MemoryPop is ready!`
          : `I created a MemoryPop for ${recipientName}`),
        url: link,
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Native share failed:', error);
      }
    }
  };

  const copyButtonLabel = mode === 'contributor' ? 'Copy invite link' : 'Copy gift link';

  // Contributor card: white background, subtle warm border (#ead8c9)
  // Reveal card: pale peach background, coral border (#FFD4CC)
  const cardBackground = mode === 'contributor'
    ? 'bg-white'
    : 'bg-[#FFF8F2]';
  const cardBorder = mode === 'contributor'
    ? 'border border-[#ead8c9]'
    : 'border-2 border-[#FFD4CC]';

  return (
    <div className={`rounded-2xl ${cardBorder} ${cardBackground} p-6 shadow-sm`}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-[#3a241e]">{title}</h3>
          {showReadyBadge && (
            <span className="inline-block rounded-full bg-[#4CAF50] px-3 py-1 text-xs font-bold text-white">
              Ready
            </span>
          )}
        </div>
        <p className="text-sm text-[#6B5B52] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Main Actions: WhatsApp and Copy Link */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-semibold text-white transition-all hover:bg-[#22c55e] active:scale-95"
        >
          <span className="text-lg">💬</span>
          <span className="text-sm">WhatsApp</span>
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#ef6a57] px-4 py-3 font-semibold text-white transition-all hover:bg-[#e05a47] active:scale-95"
        >
          {copied ? (
            <>
              <span className="text-lg">✓</span>
              <span className="text-sm">Copied!</span>
            </>
          ) : (
            <>
              <span className="text-lg">🔗</span>
              <span className="text-sm">{copyButtonLabel}</span>
            </>
          )}
        </button>
      </div>

      {/* Clipboard Fallback */}
      {showFallback && (
        <div className="mb-3 rounded-lg border border-[#FFD4CC] bg-[#FFF8F5] p-3">
          <p className="mb-2 text-xs text-[#6B5B52]">
            Unable to copy automatically. Select and copy the link below:
          </p>
          <input
            type="text"
            readOnly
            value={link}
            onClick={(e) => e.currentTarget.select()}
            className="w-full rounded-md border border-[#ead8c9] bg-white px-3 py-2 text-xs font-mono text-[#3a241e]"
          />
        </div>
      )}

      {/* Secondary Actions: Telegram and More channels on SAME row */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleTelegram}
          className="text-sm text-[#856b5f] underline hover:text-[#3a241e] transition-colors"
        >
          📱 Telegram
        </button>
        <span className="text-[#ead8c9]">•</span>
        <div className="relative">
          <button
            onClick={() => setShowMoreChannels(!showMoreChannels)}
            className="text-sm text-[#856b5f] underline hover:text-[#3a241e] transition-colors"
          >
            {showMoreChannels ? 'Hide channels' : 'More channels'}
          </button>

          {showMoreChannels && (
            <div className="absolute left-0 top-full z-10 mt-2 min-w-[200px] rounded-xl border border-[#FFD4CC] bg-white shadow-lg">
              <div className="p-2">
                <button
                  onClick={() => { handleEmail(); setShowMoreChannels(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                >
                  <span>📧</span>
                  <span>Email</span>
                </button>

                <button
                  onClick={() => { handleFacebook(); setShowMoreChannels(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                >
                  <span>📘</span>
                  <span>Facebook</span>
                </button>

                <button
                  onClick={() => { handleX(); setShowMoreChannels(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                >
                  <span>𝕏</span>
                  <span>X (Twitter)</span>
                </button>

                <button
                  onClick={() => { handleLinkedIn(); setShowMoreChannels(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                >
                  <span>💼</span>
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={() => { handleReddit(); setShowMoreChannels(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                >
                  <span>🔴</span>
                  <span>Reddit</span>
                </button>

                <div className="my-1 border-t border-[#FFD4CC]" />

                <button
                  onClick={() => { handleCopyMessage(); setShowMoreChannels(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                >
                  <span>📋</span>
                  <span>Copy message</span>
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={() => { handleNativeShare(); setShowMoreChannels(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                  >
                    <span>↗️</span>
                    <span>Share via device</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with preview link and optional message */}
      <div className="mt-4 pt-4 border-t border-[#ead8c9] text-center">
        <Link
          href={previewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#856b5f] underline hover:text-[#3a241e] transition-colors"
        >
          {previewLabel}
        </Link>
        {footer && (
          <p className="mt-2 text-xs text-[#856b5f] italic">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
