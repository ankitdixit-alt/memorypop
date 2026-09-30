"use client";

import { useState, useRef, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface ShareMenuProps {
  shareLink: string;
  message: string;
  recipient: string;
  mode: 'contributor' | 'reveal' | 'product';
  shareCode?: string;
}

export function ShareMenu({
  shareLink,
  message,
  recipient,
  mode,
  shareCode,
}: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const [showLinkFallback, setShowLinkFallback] = useState(false);
  const [showMessageFallback, setShowMessageFallback] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setShowLinkFallback(false);
      setTimeout(() => setCopied(false), 2000);

      trackEvent('memorypop_shared', {
        share_method: 'copy_link',
        share_mode: mode,
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      setShowLinkFallback(true);
      setCopied(false);
    }
  }

  async function handleCopyMessage() {
    try {
      const fullMessage = `${message} ${shareLink}`;
      await navigator.clipboard.writeText(fullMessage);
      setMessageCopied(true);
      setShowMessageFallback(false);
      setTimeout(() => setMessageCopied(false), 2000);

      trackEvent('memorypop_shared', {
        share_method: 'copy_message',
        share_mode: mode,
      });
    } catch (error) {
      console.error("Failed to copy message:", error);
      setShowMessageFallback(true);
      setMessageCopied(false);
    }
  }

  function handleWhatsApp() {
    const fullMessage = `${message} ${shareLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;

    trackEvent('memorypop_shared', {
      share_method: 'whatsapp',
      share_mode: mode,
    });

    window.location.href = whatsappUrl;
  }

  function handleEmail() {
    const subject = mode === 'product'
      ? 'Create beautiful gift memories with MemoryPop'
      : mode === 'reveal'
      ? `${recipient} - Your MemoryPop is ready!`
      : `Help celebrate ${recipient}`;

    const body = `${message}\n\n${shareLink}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    trackEvent('memorypop_shared', {
      share_method: 'email',
      share_mode: mode,
    });

    window.location.href = mailtoUrl;
  }

  function handleTelegram() {
    const fullMessage = `${message} ${shareLink}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(message)}`;

    trackEvent('memorypop_shared', {
      share_method: 'telegram',
      share_mode: mode,
    });

    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  }

  function handleFacebook() {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;

    trackEvent('memorypop_shared', {
      share_method: 'facebook',
      share_mode: mode,
    });

    window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  }

  function handleX() {
    // X (Twitter) has 280 char limit, so keep it concise
    const shortMessage = mode === 'product'
      ? 'Create beautiful collaborative gifts with MemoryPop'
      : mode === 'reveal'
      ? `${recipient} - your gift is ready!`
      : `Help celebrate ${recipient}`;

    const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shortMessage)}`;

    trackEvent('memorypop_shared', {
      share_method: 'x',
      share_mode: mode,
    });

    window.open(xUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  }

  function handleLinkedIn() {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;

    trackEvent('memorypop_shared', {
      share_method: 'linkedin',
      share_mode: mode,
    });

    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  }

  function handleReddit() {
    const title = mode === 'product'
      ? 'MemoryPop - Create beautiful collaborative gifts'
      : mode === 'reveal'
      ? `${recipient}'s MemoryPop`
      : `Help celebrate ${recipient}`;

    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(title)}`;

    trackEvent('memorypop_shared', {
      share_method: 'reddit',
      share_mode: mode,
    });

    window.open(redditUrl, '_blank', 'noopener,noreferrer');
  }

  async function handleNativeShare() {
    if (!navigator.share) {
      // Fallback to copy
      await handleCopyLink();
      return;
    }

    // Track attempt before awaiting (records opening share sheet, not confirmed posting)
    trackEvent('memorypop_shared', {
      share_method: 'native_share',
      share_mode: mode,
    });

    try {
      await navigator.share({
        title: mode === 'product'
          ? 'MemoryPop'
          : mode === 'reveal'
          ? `${recipient}'s MemoryPop`
          : `Celebrate ${recipient}`,
        text: message,
        url: shareLink,
      });
    } catch (error: any) {
      // User cancelled or share failed - no additional tracking needed
      if (error.name !== 'AbortError') {
        console.error('Native share failed:', error);
      }
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full border border-[#ead8c9] bg-white px-7 py-4 font-semibold text-[#3a241e] transition-colors hover:bg-[#fff8ef] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 w-full sm:w-auto"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        More sharing options
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 rounded-2xl bg-white shadow-xl border-2 border-[#FFD4CC] overflow-hidden right-0">
          <div className="p-2">
            <button
              onClick={() => {
                handleTelegram();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#3a241e] rounded-xl hover:bg-[#FFF1EC] transition-colors"
            >
              <span className="text-xl">📱</span>
              <span>Telegram</span>
            </button>

            <button
              onClick={() => {
                handleFacebook();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#3a241e] rounded-xl hover:bg-[#FFF1EC] transition-colors"
            >
              <span className="text-xl">📘</span>
              <span>Facebook</span>
            </button>

            <button
              onClick={() => {
                handleX();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#3a241e] rounded-xl hover:bg-[#FFF1EC] transition-colors"
            >
              <span className="text-xl">𝕏</span>
              <span>X (Twitter)</span>
            </button>

            <button
              onClick={() => {
                handleLinkedIn();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#3a241e] rounded-xl hover:bg-[#FFF1EC] transition-colors"
            >
              <span className="text-xl">💼</span>
              <span>LinkedIn</span>
            </button>

            <button
              onClick={() => {
                handleReddit();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#3a241e] rounded-xl hover:bg-[#FFF1EC] transition-colors"
            >
              <span className="text-xl">🔴</span>
              <span>Reddit</span>
            </button>

            <div className="my-2 border-t border-[#FFD4CC]" />

            <button
              onClick={async () => {
                setIsOpen(false);
                await handleCopyMessage();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#3a241e] rounded-xl hover:bg-[#FFF1EC] transition-colors"
            >
              <span className="text-xl">📋</span>
              <span>{messageCopied ? "Message copied! ✓" : "Copy message"}</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={() => {
                  handleNativeShare();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#3a241e] rounded-xl hover:bg-[#FFF1EC] transition-colors"
              >
                <span className="text-xl">↗️</span>
                <span>Share via device</span>
              </button>
            )}
          </div>
        </div>
      )}

      {showLinkFallback && (
        <div className="absolute z-50 mt-2 w-80 p-4 bg-[#FFF8F5] border-2 border-[#FFD4CC] rounded-xl shadow-lg right-0">
          <p className="text-sm text-[#6B5B52] mb-2">
            Unable to copy automatically. Select and copy the link below:
          </p>
          <input
            type="text"
            readOnly
            value={shareLink}
            onClick={(e) => e.currentTarget.select()}
            className="w-full px-3 py-2 text-sm bg-white border border-[#ead8c9] rounded-lg text-[#3a241e] font-mono mb-2"
          />
          <button
            onClick={() => setShowLinkFallback(false)}
            className="text-xs text-[#6B5B52] underline hover:text-[#3a241e]"
          >
            Close
          </button>
        </div>
      )}

      {showMessageFallback && (
        <div className="absolute z-50 mt-2 w-80 p-4 bg-[#FFF8F5] border-2 border-[#FFD4CC] rounded-xl shadow-lg right-0">
          <p className="text-sm text-[#6B5B52] mb-2">
            Unable to copy automatically. Select and copy the message below:
          </p>
          <textarea
            readOnly
            value={`${message} ${shareLink}`}
            onClick={(e) => e.currentTarget.select()}
            rows={4}
            className="w-full px-3 py-2 text-sm bg-white border border-[#ead8c9] rounded-lg text-[#3a241e] resize-none mb-2"
          />
          <button
            onClick={() => setShowMessageFallback(false)}
            className="text-xs text-[#6B5B52] underline hover:text-[#3a241e]"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
