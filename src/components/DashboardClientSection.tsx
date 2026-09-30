"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { canTransitionToReady } from "@/lib/memoryPopStates";
import PrepareRevealModal from "./PrepareRevealModal";

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
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [showModal, setShowModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrepareReveal = async () => {
    setIsTransitioning(true);

    try {
      // Call API to update status (server-side)
      const response = await fetch(`/api/memorypops/${memorypopId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready' }),
      });

      if (response.ok) {
        setStatus('ready');
        setShowModal(false);
        // Refresh the page to show updated reveal card in DashboardSharingCards
        router.refresh();
      } else {
        alert('Failed to prepare reveal. Please try again.');
      }
    } catch (error) {
      console.error('Status update error:', error);
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
              You&apos;ve collected {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}. Prepare the reveal to get your shareable link.
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

  // Ready or Revealed state: No longer needed here
  // Reveal sharing is now handled by DashboardSharingCards component
  return null;
}
