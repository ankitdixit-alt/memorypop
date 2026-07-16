"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { transitionToReady, canTransitionToReady } from "@/lib/memoryPopStates";
import PrepareRevealModal from "./PrepareRevealModal";
import RevealLinkSection from "./RevealLinkSection";

interface Props {
  memorypopId: string;
  shareCode: string;
  recipientName: string;
  memoryCount: number;
  currentStatus: string;
  revealWhatsappMessage: string;
}

export default function DashboardClientSection({
  memorypopId,
  shareCode,
  recipientName,
  memoryCount,
  currentStatus,
  revealWhatsappMessage,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [showModal, setShowModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrepareReveal = async () => {
    setIsTransitioning(true);
    const result = await transitionToReady(supabase, memorypopId);

    if (result.success) {
      setStatus('ready');
      setShowModal(false);
    } else {
      alert('Failed to prepare reveal. Please try again.');
    }

    setIsTransitioning(false);
  };

  // Collecting state: Show "Prepare Reveal" button
  if (status === 'collecting') {
    const canPrepare = canTransitionToReady(memoryCount);

    return (
      <>
        {canPrepare ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm text-center">
            <p className="text-4xl mb-3">🎁</p>
            <h2 className="text-xl font-bold text-[#3a241e] mb-2">
              Ready to share with {recipientName}?
            </h2>
            <p className="text-[#856b5f] mb-6">
              You've collected {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}. Prepare the reveal to get your shareable link.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-full bg-[#ef6a57] px-8 py-4 font-semibold text-white transition-colors hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2 transition-all"
            >
              Prepare the Reveal
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-[#856b5f]">
              Collect at least one memory before preparing the reveal.
            </p>
          </div>
        )}

        <PrepareRevealModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handlePrepareReveal}
          recipientName={recipientName}
          memoryCount={memoryCount}
          isTransitioning={isTransitioning}
        />
      </>
    );
  }

  // Ready or Revealed state: Show reveal link section
  if (status === 'ready' || status === 'revealed') {
    return (
      <>
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm text-center">
          <p className="text-4xl mb-3">✅</p>
          <h2 className="text-xl font-bold text-[#3a241e] mb-2">
            Your MemoryPop is ready to share with {recipientName}
          </h2>
          <p className="text-[#856b5f]">
            Use the reveal link below when you're ready to share the celebration.
          </p>
        </div>

        <RevealLinkSection
          shareCode={shareCode}
          recipientName={recipientName}
          revealWhatsappMessage={revealWhatsappMessage}
        />
      </>
    );
  }

  return null;
}
