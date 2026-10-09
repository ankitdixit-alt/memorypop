"use client";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import type { MediaItem } from "@/components/memory-experience/types";

interface Memory {
  id: string;
  contributor_name: string;
  message: string;
  photos?: MediaItem[];
  photo_url?: string | null;
}

interface Props {
  recipientName: string;
  occasion: string;
  memories: Memory[];
  shareCode: string;
  onClose: () => void;
}

type ContentType = "photo" | "message" | "text";

interface PhotoContent {
  type: "photo";
  url: string;
  memoryId: string;
  contributorName: string;
}

interface MessageContent {
  type: "message";
  text: string;
  contributorName: string;
  memoryId: string;
}

interface TextContent {
  type: "text";
  text: string;
}

type StoryContent = PhotoContent | MessageContent | TextContent;

export default function StoryCreator({
  recipientName,
  occasion,
  memories,
  shareCode,
  onClose,
}: Props) {
  const [selectedContent, setSelectedContent] = useState<StoryContent | null>(null);
  const [includeLink, setIncludeLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const giftUrl = typeof window !== "undefined"
    ? `${window.location.origin}/m/${shareCode}/reveal`
    : "";

  // Get all photos from memories
  const photos = memories.flatMap((memory) => {
    const photoUrls: PhotoContent[] = [];
    if (memory.photo_url && !memory.photo_url.endsWith(".gif")) {
      photoUrls.push({
        type: "photo",
        url: memory.photo_url,
        memoryId: memory.id,
        contributorName: memory.contributor_name,
      });
    }
    if (memory.photos) {
      memory.photos.forEach((photo) => {
        photoUrls.push({
          type: "photo",
          url: photo.url,
          memoryId: memory.id,
          contributorName: memory.contributor_name,
        });
      });
    }
    return photoUrls;
  });

  // Get all messages from memories
  const messages: MessageContent[] = memories.map((memory) => ({
    type: "message",
    text: memory.message,
    contributorName: memory.contributor_name,
    memoryId: memory.id,
  }));

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    setError(null);

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        width: 1080,
        height: 1920,
      });

      const link = document.createElement("a");
      link.download = `memorypop-${recipientName.toLowerCase().replace(/\s+/g, "-")}-story.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!navigator.share || !cardRef.current) {
      // Fallback to download if share not supported
      await handleDownload();
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        width: 1080,
        height: 1920,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "memorypop-story.png", { type: "image/png" });

      await navigator.share({
        files: [file],
        title: `${recipientName}'s MemoryPop`,
        text: includeLink ? `Check out this MemoryPop: ${giftUrl}` : undefined,
      });
    } catch (err: any) {
      // User cancelled or share failed
      if (err.name === "AbortError") {
        console.log("Share cancelled");
      } else {
        console.error("Share failed:", err);
        setError("Share failed. Try downloading instead.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(giftUrl);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#ead8c9] p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#3a241e]">Share this moment</h2>
          <button
            onClick={onClose}
            className="text-2xl text-[#6B5B52] hover:text-[#3a241e]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedContent ? (
            // Content selection
            <div>
              <p className="mb-6 text-[#6B5B52]">
                Create a beautiful story card to share on social media
              </p>

              {/* Photo selection */}
              {photos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-[#3a241e]">
                    Choose a photo
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.slice(0, 9).map((photo, idx) => (
                      <button
                        key={`${photo.memoryId}-${idx}`}
                        onClick={() => setSelectedContent(photo)}
                        className="aspect-square rounded-lg overflow-hidden border-2 border-[#ead8c9] hover:border-[#ef6a57] transition-colors"
                      >
                        <img
                          src={photo.url}
                          alt={`Photo from ${photo.contributorName}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message selection */}
              {messages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-[#3a241e]">
                    Choose a message
                  </h3>
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <button
                        key={msg.memoryId}
                        onClick={() => setSelectedContent(msg)}
                        className="w-full text-left p-4 rounded-lg border-2 border-[#ead8c9] hover:border-[#ef6a57] transition-colors"
                      >
                        <p className="text-sm text-[#3a241e] line-clamp-3">
                          "{msg.text}"
                        </p>
                        <p className="text-xs text-[#856b5f] mt-2">
                          — {msg.contributorName}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text-only option */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#3a241e]">
                  Or use a celebration card
                </h3>
                <button
                  onClick={() =>
                    setSelectedContent({
                      type: "text",
                      text: "Look what my friends and family made for me ❤️",
                    })
                  }
                  className="w-full p-4 rounded-lg border-2 border-[#ead8c9] hover:border-[#ef6a57] transition-colors text-left"
                >
                  <p className="text-sm text-[#3a241e]">
                    "Look what my friends and family made for me ❤️"
                  </p>
                </button>
              </div>
            </div>
          ) : (
            // Preview and export
            <div className="grid md:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#3a241e]">
                  Preview
                </h3>
                <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    ref={cardRef}
                    style={{
                      width: "1080px",
                      height: "1920px",
                      transform: "scale(0.3)",
                      transformOrigin: "top left",
                      background: "linear-gradient(135deg, #FFFBF7 0%, #FFF8F2 100%)",
                    }}
                  >
                    <StoryCard
                      content={selectedContent}
                      recipientName={recipientName}
                      occasion={occasion}
                      includeLink={includeLink}
                      giftUrl={giftUrl}
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#3a241e]">
                  Options
                </h3>

                <div className="space-y-4">
                  {/* Include link toggle */}
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={includeLink}
                      onChange={(e) => setIncludeLink(e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-[#3a241e]">
                        Include a link to this gift
                      </div>
                      <p className="text-sm text-[#6B5B52]">
                        Adds a QR code so others can view the gift
                      </p>
                    </div>
                  </label>

                  {/* Copy link button */}
                  {includeLink && (
                    <button
                      onClick={handleCopyLink}
                      className="text-sm text-[#856b5f] underline hover:text-[#3a241e]"
                    >
                      Copy gift link for caption
                    </button>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={handleDownload}
                      disabled={isGenerating}
                      className="w-full rounded-full bg-[#ef6a57] px-6 py-3 font-semibold text-white hover:bg-[#e05a47] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? "Generating..." : "Download image"}
                    </button>

                    {typeof navigator !== "undefined" && "share" in navigator && (
                      <button
                        onClick={handleShare}
                        disabled={isGenerating}
                        className="w-full rounded-full border-2 border-[#ead8c9] bg-white px-6 py-3 font-semibold text-[#3a241e] hover:bg-[#fff8ef] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Share
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedContent(null)}
                      className="w-full text-sm text-[#856b5f] underline hover:text-[#3a241e]"
                    >
                      Choose different content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StoryCard({
  content,
  recipientName,
  occasion,
  includeLink,
  giftUrl,
}: {
  content: StoryContent;
  recipientName: string;
  occasion: string;
  includeLink: boolean;
  giftUrl: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "120px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {content.type === "photo" && (
          <div
            style={{
              borderRadius: "24px",
              overflow: "hidden",
              marginBottom: "40px",
            }}
          >
            <img
              src={content.url}
              alt="Memory"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "1200px",
                objectFit: "cover",
              }}
              crossOrigin="anonymous"
            />
          </div>
        )}

        {content.type === "message" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "24px",
              padding: "60px",
              marginBottom: "40px",
            }}
          >
            <p
              style={{
                fontSize: "48px",
                lineHeight: "1.5",
                color: "#3a241e",
                margin: 0,
              }}
            >
              "{content.text.substring(0, 200)}"
            </p>
            <p
              style={{
                fontSize: "32px",
                color: "#856b5f",
                marginTop: "32px",
                fontStyle: "italic",
              }}
            >
              — {content.contributorName}
            </p>
          </div>
        )}

        {content.type === "text" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "24px",
              padding: "60px",
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "56px",
                lineHeight: "1.4",
                color: "#3a241e",
                margin: 0,
              }}
            >
              {content.text}
            </p>
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p
            style={{
              fontSize: "32px",
              color: "#856b5f",
              margin: "0 0 8px 0",
            }}
          >
            {recipientName}'s {occasion}
          </p>
          <p
            style={{
              fontSize: "24px",
              color: "#856b5f",
              margin: 0,
            }}
          >
            Made with MemoryPop
          </p>
        </div>

        {includeLink && giftUrl && (
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "12px",
            }}
          >
            <QRCodeSVG value={giftUrl} size={160} level="M" />
          </div>
        )}
      </div>
    </div>
  );
}
