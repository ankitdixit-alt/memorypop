"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipientName: string;
  memoryCount: number;
  isTransitioning: boolean;
}

export default function PrepareRevealModal({
  isOpen,
  onClose,
  onConfirm,
  recipientName,
  memoryCount,
  isTransitioning,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div className="max-w-lg w-full rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center mb-6">
          <p className="text-5xl mb-4">🎁</p>
          <h2 className="text-2xl font-bold text-[#3a241e] mb-2">
            Prepare the Reveal?
          </h2>
        </div>

        <div className="space-y-4 text-[#6B5B52] mb-8">
          <p className="leading-relaxed">
            You&apos;ve collected <strong>{memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}</strong> for {recipientName}.
          </p>

          <div className="rounded-xl bg-[#FFF8F2] border border-[#F0DED2] p-4">
            <p className="font-semibold text-[#3a241e] mb-2">
              What happens next:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B57]">•</span>
                <span>You&apos;ll get a special <strong>reveal link</strong> to share with {recipientName}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B57]">•</span>
                <span>This is different from the contributor link</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B57]">•</span>
                <span>Friends can still add memories after you prepare the reveal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B57]">•</span>
                <span>You can preview the reveal before sharing it</span>
              </li>
            </ul>
          </div>

          <p className="text-sm italic">
            Don&apos;t worry - you can share the reveal link whenever you&apos;re ready.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isTransitioning}
            className="flex-1 rounded-full border border-[#ead8c9] bg-white px-6 py-3 font-semibold text-[#3a241e] transition-colors hover:bg-[#fff8ef] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Not Yet
          </button>
          <button
            onClick={onConfirm}
            disabled={isTransitioning}
            className="flex-1 rounded-full bg-[#ef6a57] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#e05a47] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTransitioning ? 'Preparing...' : 'Prepare Reveal'}
          </button>
        </div>
      </div>
    </div>
  );
}
