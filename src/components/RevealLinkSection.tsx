"use client";

import { ShareButtons } from "./ShareButtons";

interface Props {
  shareCode: string;
  recipientName: string;
  revealWhatsappMessage: string;
}

export default function RevealLinkSection({
  shareCode,
  recipientName,
  revealWhatsappMessage,
}: Props) {
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const revealLink = `${protocol}://${host}/m/${shareCode}/reveal`;

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#FFF1EC] to-[#FFE5DC] border-2 border-[#FFD4CC] p-6 shadow-sm">
      <div className="text-center mb-4">
        <p className="text-4xl mb-2">🎁</p>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#856b5f] mb-2">
          Share this link with {recipientName}
        </p>
        <p className="text-xs text-[#6B5B52] italic">
          This is different from your contributor link
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <ShareButtons
          shareLink={revealLink}
          recipient={recipientName}
          whatsappMessage={revealWhatsappMessage}
          mode="reveal"
          shareCode={shareCode}
        />

        <a
          href={`/m/${shareCode}/reveal`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[#ead8c9] bg-white px-7 py-4 text-center font-semibold text-[#3a241e] transition-colors hover:bg-[#fff8ef] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 transition-all"
        >
          👁️ Preview Reveal
        </a>
      </div>
    </div>
  );
}
