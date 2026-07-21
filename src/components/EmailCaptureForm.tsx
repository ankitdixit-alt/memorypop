/**
 * Email Capture Form Component
 * Private Beta: Optional Creator Welcome Email
 *
 * Sends creator a warm welcome email with:
 * - Private Creator Link (for dashboard access)
 * - Contributor Link (for sharing)
 * - MemoryPop summary and details
 *
 * Security: Management token validated server-side, never persisted.
 * Email address not stored (send-only convenience feature).
 */

"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface EmailCaptureFormProps {
  shareCode: string;
  managementToken: string;
  baseUrl: string; // Passed from server but not used client-side
}

export function EmailCaptureForm({ shareCode, managementToken }: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    // Track submission attempt (no email or token in event)
    trackEvent("creator_welcome_email_requested", { shareCode });

    try {
      const response = await fetch("/api/send-creator-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareCode,
          email,
          managementToken, // Validated server-side, never persisted
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      // Success - track and update UI (no email or token in event)
      setStatus("success");
      trackEvent("creator_welcome_email_sent", { shareCode });

    } catch (error) {
      // Error - track and show message (no email or token in event)
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      trackEvent("creator_welcome_email_failed", { shareCode, error: String(error) });
    }
  };

  // Success State
  if (status === "success") {
    return (
      <div className="text-center">
        <div className="text-4xl mb-2">✓</div>
        <p className="text-lg font-semibold text-[#3a241e]">
          Your MemoryPop details are on their way.
        </p>
      </div>
    );
  }

  // Form State
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          className="flex-1 rounded-full border border-[#ead8c9] px-6 py-3 text-[#3a241e] placeholder:text-[#856b5f] focus:border-[#ef6a57] focus:outline-none focus:ring-2 focus:ring-[#ef6a57] focus:ring-offset-2 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-[#ef6a57] px-7 py-3 font-semibold text-white transition-colors hover:bg-[#d95a47] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Sending..." : "Email me these details"}
        </button>
      </div>

      {/* Error Message */}
      {status === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}
    </form>
  );
}
